# ADR-004: Scoped Persistent Chat

## Estado
Aceptada

## Fecha
2026-03-09

## Contexto

VIS-004 designed the visual shell with a ChatDock at the bottom of the canvas viewport. The dock is currently a placeholder that shows a scope-aware label but has no backend, no message types, and no persistence. Epic 31 requires a scoped persistent chat where conversations are tied to specific levels of the company model.

The key design questions are:
1. **What are the valid chat scopes?**
2. **What is the data model for conversations and messages?**
3. **Where does chat persistence live?**
4. **How does the frontend resolve and switch scopes?**

## Scope Model

### Scope Levels

Chat scopes align with the visual workspace's zoom levels and navigation model:

| Scope Level | ZoomLevel | scopeEntityType | scopeEntityId | Example |
|-------------|-----------|-----------------|---------------|---------|
| Project     | L1        | `project`       | projectId     | Strategic discussion about the whole company |
| Department  | L2        | `department`    | departmentId  | Team-oriented discussion about a department |
| Workflow    | L3        | `workflow`      | workflowId    | Process-focused discussion about a workflow |
| Node        | L4        | any NodeType    | entityId      | Detail discussion about a specific element |

### Scope Identity

A scope is uniquely identified by the triple:

```typescript
interface ChatScope {
  projectId: string
  entityType: ChatScopeEntityType  // 'project' | 'department' | 'workflow' | NodeType
  entityId: string                 // projectId for L1, entityId for L2–L4
}
```

The scope key for addressing a conversation is: `${projectId}:${entityType}:${entityId}`.

### Scope Resolution

The frontend derives the active chat scope from the visual workspace state:

```
currentView === 'org'        → { entityType: 'project', entityId: projectId }
currentView === 'department' → { entityType: 'department', entityId: scopeEntityId }
currentView === 'workflow'   → { entityType: 'workflow', entityId: scopeEntityId }
selectedNodeIds.length === 1 → { entityType: node.nodeType, entityId: node.entityId }
```

When the user navigates or selects a node, the ChatDock automatically resolves the new scope and loads the corresponding conversation.

## Data Model

### Domain Entities

#### ChatConversation (AggregateRoot)

Represents a persistent conversation scoped to a specific entity in the company model.

```typescript
interface ChatConversationProps {
  projectId: string
  scopeEntityType: ChatScopeEntityType
  scopeEntityId: string
  title: string | null           // optional; auto-generated from scope if null
  messageCount: number
  lastMessageAt: Date | null
  createdAt: Date
  updatedAt: Date
}
```

- **Identity**: UUID, auto-created on first message to a scope.
- **Uniqueness constraint**: one conversation per `(projectId, scopeEntityType, scopeEntityId)`.
- **Behavior**: append-only message log. No editing or deleting messages in v1.

#### ChatMessage (Entity, not AggregateRoot)

An individual message within a conversation. Immutable after creation (like AuditEntry).

```typescript
interface ChatMessageProps {
  conversationId: string
  authorType: ChatAuthorType       // 'user' | 'system' | 'ai'
  authorId: string | null          // userId for 'user', null for 'system'/'ai'
  authorName: string               // display name
  content: string                  // markdown text
  references: ChatReference[]      // optional links to entities
  timestamp: Date
}
```

#### ChatReference (Value Object)

An optional reference from a message to domain entities, enabling traceability.

```typescript
interface ChatReference {
  entityType: string              // NodeType or 'release', 'validation', etc.
  entityId: string
  label: string                   // human-readable at time of reference
}
```

### Shared Types (DTOs)

```typescript
// --- Scope ---
type ChatScopeEntityType = 'project' | 'department' | 'workflow' | NodeType

interface ChatScopeDto {
  projectId: string
  entityType: ChatScopeEntityType
  entityId: string
}

// --- Conversation ---
interface ChatConversationDto {
  id: string
  projectId: string
  scopeEntityType: ChatScopeEntityType
  scopeEntityId: string
  title: string | null
  messageCount: number
  lastMessageAt: string | null    // ISO 8601
  createdAt: string
  updatedAt: string
}

// --- Message ---
type ChatAuthorType = 'user' | 'system' | 'ai'

interface ChatReferenceDto {
  entityType: string
  entityId: string
  label: string
}

interface ChatMessageDto {
  id: string
  conversationId: string
  authorType: ChatAuthorType
  authorId: string | null
  authorName: string
  content: string
  references: ChatReferenceDto[]
  timestamp: string               // ISO 8601
}

interface CreateChatMessageDto {
  authorType: ChatAuthorType
  authorId: string | null
  authorName: string
  content: string
  references?: ChatReferenceDto[]
}

// --- Paginated response ---
interface ChatMessagesPageDto {
  messages: ChatMessageDto[]
  total: number
  hasMore: boolean
  cursor: string | null           // opaque cursor for next page
}
```

## Backend Architecture

### Decision: Module in company-design-service

Following the same rationale as ADR-003 (graph projection) and the audit module pattern:

| Criterion | New service | Module in company-design |
|-----------|-------------|------------------------|
| Complexity | High (new infra) | Low (reuses existing) |
| Entity access | Needs cross-service calls | Direct repo access for scope validation |
| Infrastructure | New deployment, new k8s manifest | Zero new infrastructure |
| Extractability | Already separate | Easy to extract later |
| Pattern consistency | Breaks current approach | Follows audit/graph-projection pattern |

**Decision**: New `ChatModule` inside `company-design-service`, registered as `@Global()` (like AuditModule) so other modules can emit system messages if needed.

### Module Structure

```
services/company-design/src/chat/
├── domain/
│   ├── chat-conversation.ts          # AggregateRoot
│   ├── chat-message.ts               # Entity
│   ├── chat-reference.ts             # Value Object
│   └── chat-repository.ts            # Repository interface
├── application/
│   ├── chat.service.ts               # Application service
│   └── chat.mapper.ts                # Domain ↔ DTO mapping
├── infrastructure/
│   └── in-memory-chat.repository.ts  # InMemory implementation
├── presentation/
│   └── chat.controller.ts            # REST controller
└── chat.module.ts                    # NestJS module
```

### API Contract

```
GET    /projects/:projectId/chat/conversations
       ?entityType=department&entityId=abc
       → ChatConversationDto (returns existing or 404)

POST   /projects/:projectId/chat/conversations
       body: { scopeEntityType, scopeEntityId }
       → ChatConversationDto (create or return existing — idempotent)

GET    /projects/:projectId/chat/conversations/:conversationId/messages
       ?cursor=...&limit=50
       → ChatMessagesPageDto

POST   /projects/:projectId/chat/conversations/:conversationId/messages
       body: CreateChatMessageDto
       → ChatMessageDto
```

The `GET conversations` endpoint with scope query params is the primary entry point from the ChatDock. When the user navigates to a new scope, the frontend queries for the conversation at that scope. If none exists, the first message triggers a `POST conversations` to create one.

### Scope Validation

On conversation creation, the service validates that the referenced entity exists:
- `project` → ProjectRepository (platform-service, via cross-service call or trust projectId from route)
- `department` → DepartmentRepository
- `workflow` → WorkflowRepository
- Other NodeTypes → corresponding repository

If the entity has been deleted, the conversation remains accessible (orphaned conversations are valid — they preserve history) but new messages are blocked.

### Message Ordering and Pagination

- Messages are stored ordered by timestamp (ascending).
- Pagination uses cursor-based pagination (cursor = message ID or timestamp).
- Default page size: 50 messages.
- The ChatDock fetches the most recent page first and loads older pages on scroll-up.

## Frontend Integration

### ChatDock Scope Lifecycle

```
1. User navigates (setView) or selects a node
2. Zustand store updates → currentView / scopeEntityId / selectedNodeIds
3. ChatDock derives ChatScope from store state
4. useChatConversation(scope) fires TanStack Query
   → GET /chat/conversations?entityType=...&entityId=...
5. If conversation exists → load messages via useChatMessages(conversationId)
6. If no conversation → show empty state with "Start a conversation" prompt
7. On first message send → POST /chat/conversations (creates conv) → POST messages
8. Subsequent messages → POST messages directly
```

### New Hooks

```typescript
// Query conversation by scope
useChatConversation(scope: ChatScopeDto): ChatConversationDto | null

// Query messages with infinite scroll
useChatMessages(conversationId: string): {
  messages: ChatMessageDto[]
  hasMore: boolean
  fetchMore: () => void
}

// Send a message (creates conversation if needed)
useSendChatMessage(): {
  send: (scope: ChatScopeDto, message: CreateChatMessageDto) => Promise<void>
}
```

### Zustand Store Updates

Add to `VisualWorkspaceState`:

```typescript
// No new persistent state needed — scope is derived from existing state.
// The only addition is a convenience selector:
chatScope: () => ChatScopeDto   // derived from currentView + scopeEntityId + selectedNodeIds
```

### Unread Indicator (v2)

Not in v1 scope. Future: track `lastReadMessageId` per user per conversation and show badge on collapsed ChatDock.

## Gateway BFF

The API Gateway proxies chat endpoints to company-design-service:

```
GET/POST /projects/:projectId/chat/conversations      → company-design:4020
GET/POST /projects/:projectId/chat/conversations/:id/messages → company-design:4020
```

`CompanyDesignClient` gets new methods:
- `getConversation(projectId, entityType, entityId)`
- `createConversation(projectId, dto)`
- `getMessages(projectId, conversationId, cursor?, limit?)`
- `createMessage(projectId, conversationId, dto)`

## Consequences

### Positive
- **Zero new infrastructure**. Chat is a module in the existing service.
- **Scope model aligns perfectly** with the existing zoom levels and workspace state.
- **Entity references** create traceability between conversations and design decisions.
- **Immutable messages** match the audit pattern — simple, append-only, no conflict resolution.
- **Idempotent conversation creation** avoids race conditions on first message.

### Negative / Trade-offs
- **No real-time updates in v1**. Other users won't see new messages until they refetch. Mitigation: TanStack Query refetch-on-focus. Real-time via Redis pub/sub + SSE is a v2 feature.
- **In-memory persistence loses data on restart**. Acceptable for dev/prototype. Migration to Redis or a database is a future task.
- **No threading in v1**. All messages are flat in a conversation. Threads/replies can be added later without breaking the model (add `parentMessageId: string | null`).
- **No AI integration in v1**. The `authorType: 'ai'` is reserved for future AI assistant responses. The infrastructure is ready but the integration is out of scope.

### Future extraction criteria
Extract to a dedicated `chat-service` if:
- Real-time messaging (WebSocket/SSE) is needed.
- Chat volume becomes a performance bottleneck on company-design-service.
- Chat needs to span beyond company-design scopes (platform-level, cross-project).

## Implementation Roadmap

| Slice | Scope | Mode |
|-------|-------|------|
| 31.1 | Domain entities (ChatConversation, ChatMessage, ChatReference), repository interface, InMemory repo, ChatService, ChatMapper, ChatController, shared types, all tests | edit |
| 31.2 | Gateway BFF (CompanyDesignClient chat methods, ChatController proxy, tests) | edit |
| 31.3 | Frontend (chatApi, useChatConversation, useChatMessages, useSendChatMessage hooks, ChatDock upgrade with real messages, all tests) | edit |
| 31.4 | Node-level scope (inspector Chat tab, scope override on node selection, tests) | edit |

## References
- ADR-001: Visual-First Pivot
- ADR-002: Visual Shell Design (ChatDock specs)
- ADR-003: Graph Projection Architecture (module-in-service pattern)
- `docs/03-backlog-completo.md` — Epic 31: Scoped Persistent Chat
- `docs/11-visual-grammar-v1-spec.md` — NodeType, ZoomLevel definitions
