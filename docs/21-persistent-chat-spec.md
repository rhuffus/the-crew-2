# Persistent Chat per Scope — Design Specification

> **Task:** CAV-016
> **Epic:** 42 — Chat persistente
> **Mode:** plan
> **Status:** design complete

---

## Problem Statement

The chat dock in the visual shell is a disabled placeholder. It shows a scope label and a disabled input, but there is no backend, no message storage, no thread identity, and no AI integration.

The Canvas Editor v2 spec (doc 18) defines chat as a core pillar:
- Persistent history per scope
- Contextual awareness of the current scope
- Action suggestions on the model
- Ability to propose changes from chat
- Entity/edge/artifact references in messages

The gap analysis (doc 17, gap 6) identifies this as "one of the most distinctive features of the product."

**Current state:**
- `chat-dock.tsx`: 55-line placeholder with disabled input/send
- Store: `chatDockOpen: boolean`, `toggleChatDock()` — toggle only
- No shared types, no API, no hooks, no backend module
- No ChatMessage, ChatThread, or ChatScope types anywhere

**Dependencies met:**
- CAV-007 (inspector form engine): establishes typed, scope-aware UI patterns
- CAV-010 (generic scope model): provides `ScopeType`, `ScopeDescriptor`, `SCOPE_REGISTRY`

---

## Design Goals

1. **Scope-bound threads** — Each chat thread belongs to a `ScopeDescriptor`. Navigating to a scope opens its thread.
2. **Persistent history** — Messages survive page reloads and sessions. Stored server-side.
3. **Contextual awareness** — The chat system knows which entities are in the current scope and can reference them.
4. **AI-ready architecture** — The message model supports AI responses, action suggestions, and entity references, but CAV-017 implements the AI provider integration. This spec designs the plumbing.
5. **Entity references** — Messages can reference nodes/edges. References are clickable and navigate the canvas.
6. **Incremental adoption** — The placeholder is replaced with a real component; no other UI changes required.

---

## Non-Goals (for CAV-016/017)

- Full LLM agent orchestration (future — depends on AI provider selection)
- Voice input
- Multi-user real-time chat (future — CAV-021 collaboration)
- File/image attachments
- Chat notifications/alerts
- Chat-driven entity creation (future — requires AI action execution)

---

## Core Types

### ChatScope

Reuses `ScopeDescriptor` from CAV-010. A chat thread is uniquely identified by:

```typescript
// Thread identity = projectId + scopeType + entityId
interface ChatScopeKey {
  projectId: string
  scopeType: ScopeType
  entityId: string | null  // null only for 'company' scope
}
```

### ChatMessageRole

```typescript
type ChatMessageRole = 'user' | 'assistant' | 'system'
```

- `user`: human-authored message
- `assistant`: AI-generated response
- `system`: automated system messages (e.g., "Entity X was created", "Scope changed")

### ChatEntityRef

A reference to a domain entity mentioned in a message.

```typescript
interface ChatEntityRef {
  entityId: string
  entityType: NodeType
  label: string           // display name at time of reference
  scopeType?: ScopeType   // if ref is a drillable scope
}
```

### ChatActionSuggestion

An action the AI suggests the user can take. Rendered as a clickable button in the message.

```typescript
type ChatActionType =
  | 'navigate'       // navigate to an entity/scope
  | 'create-entity'  // open entity creation form
  | 'edit-entity'    // focus + open inspector edit
  | 'add-relation'   // open add-relationship dialog
  | 'run-validation' // trigger validation

interface ChatActionSuggestion {
  type: ChatActionType
  label: string             // button text
  payload: Record<string, string>  // action-specific data
}
```

### ChatMessageDto

```typescript
interface ChatMessageDto {
  id: string
  threadId: string
  role: ChatMessageRole
  content: string          // plain text or markdown
  entityRefs: ChatEntityRef[]
  actions: ChatActionSuggestion[]
  createdAt: string        // ISO timestamp
}
```

### ChatThreadDto

```typescript
interface ChatThreadDto {
  id: string
  projectId: string
  scopeType: ScopeType
  entityId: string | null
  title: string            // auto-generated from scope (e.g., "Chat: Engineering Dept")
  messageCount: number
  lastMessageAt: string | null
  createdAt: string
}
```

### CreateChatMessageDto

```typescript
interface CreateChatMessageDto {
  content: string
  entityRefs?: ChatEntityRef[]  // user can mention entities
}
```

---

## Backend Architecture

### Where does chat live?

**Decision: `services/company-design`** within a new `chat/` module.

Rationale:
- Chat threads reference project entities (departments, workflows, etc.) — tight coupling to the company design domain
- Chat needs access to the snapshot for context building (same service already has SnapshotCollector)
- Keeping it in the same service avoids cross-service calls for context
- If chat grows significantly, it can be extracted to its own service later

### Domain Model

```
services/company-design/src/chat/
├── domain/
│   ├── chat-thread.ts         # ChatThread aggregate
│   ├── chat-message.ts        # ChatMessage entity
│   └── chat-repository.ts     # ChatRepository interface
├── application/
│   ├── chat.service.ts        # ChatService (orchestration)
│   ├── chat.service.spec.ts
│   ├── chat.controller.ts     # ChatController (REST)
│   ├── chat.controller.spec.ts
│   └── chat.mapper.ts         # Domain ↔ DTO mapping
├── infrastructure/
│   └── in-memory-chat.repository.ts
└── chat.module.ts
```

#### ChatThread Aggregate

```typescript
class ChatThread extends AggregateRoot {
  readonly projectId: string
  readonly scopeType: ScopeType
  readonly entityId: string | null
  private _title: string
  private _messages: ChatMessage[]

  static create(projectId: string, scopeType: ScopeType, entityId: string | null): ChatThread

  addMessage(role: ChatMessageRole, content: string, entityRefs?: ChatEntityRef[], actions?: ChatActionSuggestion[]): ChatMessage
  get messages(): readonly ChatMessage[]
  get lastMessageAt(): Date | null
  get messageCount(): number
  get title(): string
  updateTitle(title: string): void
}
```

Thread identity is unique per `(projectId, scopeType, entityId)`. The service enforces this via `getOrCreateThread()`.

#### ChatMessage Entity

```typescript
class ChatMessage extends Entity {
  readonly threadId: string
  readonly role: ChatMessageRole
  readonly content: string
  readonly entityRefs: ChatEntityRef[]
  readonly actions: ChatActionSuggestion[]
  readonly createdAt: Date

  static create(threadId: string, role: ChatMessageRole, content: string, entityRefs?: ChatEntityRef[], actions?: ChatActionSuggestion[]): ChatMessage
}
```

Messages are immutable once created. No editing or deletion in v1.

#### ChatRepository Interface

```typescript
interface ChatRepository {
  findByScope(projectId: string, scopeType: ScopeType, entityId: string | null): Promise<ChatThread | null>
  findById(threadId: string): Promise<ChatThread | null>
  listByProject(projectId: string): Promise<ChatThread[]>
  save(thread: ChatThread): Promise<void>
  delete(threadId: string): Promise<void>
}
```

### Service Layer

```typescript
class ChatService {
  // Get or create thread for a scope — ensures uniqueness
  async getOrCreateThread(projectId: string, scopeType: ScopeType, entityId: string | null): Promise<ChatThreadDto>

  // Add a user message + optional AI response
  async sendMessage(threadId: string, dto: CreateChatMessageDto): Promise<ChatMessageDto>

  // List messages with pagination
  async listMessages(threadId: string, options?: { limit?: number; before?: string }): Promise<ChatMessageDto[]>

  // List all threads for a project
  async listThreads(projectId: string): Promise<ChatThreadDto[]>

  // Delete thread
  async deleteThread(threadId: string): Promise<void>

  // Build scope context summary for AI (future)
  async buildScopeContext(projectId: string, scopeType: ScopeType, entityId: string | null): Promise<string>
}
```

#### Scope Context Builder

The `buildScopeContext()` method collects a textual summary of the current scope for the AI assistant. It uses the existing `SnapshotCollector` to gather entity data.

For a department scope, the context might include:
- Department name, mandate, purpose
- Number of roles, capabilities, workflows
- Current validation issues
- Recent changes (from audit)

This context is not sent with every message in v1 — it's built when the AI provider is integrated. The method is designed now so the architecture is ready.

### Controller (REST API)

```
GET    /projects/:projectId/chat/threads                     → listThreads
GET    /projects/:projectId/chat/threads/by-scope?scopeType=...&entityId=...  → getOrCreateThread
GET    /projects/:projectId/chat/threads/:threadId/messages?limit=...&before=...  → listMessages
POST   /projects/:projectId/chat/threads/:threadId/messages   → sendMessage
DELETE /projects/:projectId/chat/threads/:threadId            → deleteThread
```

#### Why `getOrCreateThread` on GET?

The thread should exist transparently when the user navigates to a scope. The frontend calls `GET /chat/threads/by-scope?scopeType=company` and gets back a thread — created on first access. This avoids a separate "create thread" step and makes the chat dock seamless.

### Gateway BFF

```typescript
// apps/api-gateway/src/company-model/company-design.client.ts

// New methods:
listChatThreads(projectId: string): Promise<ChatThreadDto[]>
getChatThread(projectId: string, scopeType: string, entityId?: string): Promise<ChatThreadDto>
listChatMessages(threadId: string, projectId: string, limit?: number, before?: string): Promise<ChatMessageDto[]>
sendChatMessage(threadId: string, projectId: string, dto: CreateChatMessageDto): Promise<ChatMessageDto>
deleteChatThread(threadId: string, projectId: string): Promise<void>
```

```typescript
// apps/api-gateway/src/company-model/chat.controller.ts
// New controller proxying to company-design service
@Controller('projects/:projectId/chat')
export class ChatController { ... }
```

---

## Frontend Architecture

### API Layer

```typescript
// apps/web/src/api/chat.ts

export const chatApi = {
  getThread(projectId: string, scopeType: ScopeType, entityId?: string): Promise<ChatThreadDto>
  listThreads(projectId: string): Promise<ChatThreadDto[]>
  listMessages(projectId: string, threadId: string, limit?: number, before?: string): Promise<ChatMessageDto[]>
  sendMessage(projectId: string, threadId: string, content: string, entityRefs?: ChatEntityRef[]): Promise<ChatMessageDto>
  deleteThread(projectId: string, threadId: string): Promise<void>
}
```

### Hooks

```typescript
// apps/web/src/hooks/use-chat.ts

// Get/create thread for current scope
export function useChatThread(projectId: string, scopeType: ScopeType, entityId?: string): {
  thread: ChatThreadDto | undefined
  isLoading: boolean
  error: Error | null
}

// List messages for a thread with infinite scroll
export function useChatMessages(projectId: string, threadId: string | undefined): {
  messages: ChatMessageDto[]
  isLoading: boolean
  fetchMore: () => void
  hasMore: boolean
}

// Send a message
export function useSendMessage(projectId: string, threadId: string | undefined): {
  send: (content: string, entityRefs?: ChatEntityRef[]) => void
  isPending: boolean
}

// List all project threads (for explorer sidebar)
export function useChatThreads(projectId: string): {
  threads: ChatThreadDto[]
  isLoading: boolean
}
```

#### Query Key Strategy

```typescript
['chat', 'thread', projectId, scopeType, entityId]   // thread by scope
['chat', 'messages', projectId, threadId]              // messages
['chat', 'threads', projectId]                         // all threads
```

Invalidation: `sendMessage` invalidates messages + thread (for lastMessageAt).

### Store Integration

The store gains minimal chat state:

```typescript
// visual-workspace-store.ts additions

// State
activeChatThreadId: string | null

// Actions
setActiveChatThread(threadId: string | null): void
```

The chat dock component manages its own local state (input text, scroll position). The store only tracks which thread is active so other components can reference it.

### Chat Dock Component (Upgraded)

```
apps/web/src/components/visual-shell/chat-dock/
├── chat-dock.tsx          # Main dock container (upgraded from placeholder)
├── chat-message-list.tsx  # Scrollable message list with auto-scroll
├── chat-input.tsx         # Input with send button + entity mention support
├── chat-message.tsx       # Single message bubble (user/assistant/system)
├── entity-ref-chip.tsx    # Clickable entity reference in message
└── action-button.tsx      # Clickable action suggestion button
```

#### ChatDock (main container)

```
┌─────────────────────────────────────────────────┐
│ 💬 Chat: Engineering Department    [↑] [✕]      │ ← header: scope label, collapse, clear
├─────────────────────────────────────────────────┤
│                                                 │
│  [system] Thread started for Engineering Dept   │
│                                                 │
│  [user] What capabilities does this dept own?   │
│                                                 │
│  [assistant] This department owns 3 caps:       │
│    • [Product Development] ← entity chip        │
│    • [Quality Assurance]                        │
│    • [Customer Support]                         │
│  You could [Add a capability] ← action button   │
│                                                 │
├─────────────────────────────────────────────────┤
│ Type a message...                    [Send]     │
└─────────────────────────────────────────────────┘
```

#### Behavior

1. **Thread auto-load**: When the chat dock opens (or scope changes while open), `useChatThread` fires with the current scope. Thread is created on first access.
2. **Scope sync**: `currentScope` from store drives the thread. If scope changes, the chat thread changes. Previous thread is preserved (navigating back restores it).
3. **Auto-scroll**: New messages scroll to bottom. User scroll position is preserved if scrolled up.
4. **Message rendering**: Markdown in content. Entity refs rendered as inline chips. Actions rendered as buttons below message.
5. **Resizable height**: The dock uses the existing collapsible pattern but gains a drag handle to resize height (200px default, 100px min, 50% viewport max).
6. **Keyboard**: Enter sends message (Shift+Enter for newline). Escape closes dock.

#### Entity Reference Flow

When a user types `@` in the chat input, a mention popover appears showing entities from the current scope's `graphNodes`. Selecting one inserts a reference chip and adds it to the message's `entityRefs`.

Clicking an entity ref chip in a message:
1. If the entity is in the current scope → `focusNode(entityId)` in canvas
2. If the entity is in a different scope → navigate using `resolveEntityRoute()`

#### Action Suggestion Flow

When an assistant message includes action suggestions, they're rendered as buttons. Clicking:
- `navigate` → navigate to the referenced entity/scope
- `create-entity` → `showEntityForm(nodeType)` in store
- `edit-entity` → `focusNode(entityId)` + select + open inspector
- `add-relation` → open add-relationship dialog in inspector
- `run-validation` → trigger validation refetch

In v1 (CAV-017), actions are manually created when the AI provider generates them. No automatic execution.

---

## Explorer Integration

The explorer sidebar gains a **Chat** tab listing all active threads for the project.

```
Explorer > Chat tab
├── 💬 Organization (Company)     3 messages, 2h ago
├── 💬 Engineering Department    12 messages, 5m ago
├── 💬 Product Development        0 messages
└── 💬 Onboarding Workflow        7 messages, 1d ago
```

Clicking a thread navigates to its scope and opens the chat dock.

This is lightweight and reuses `useChatThreads(projectId)`.

---

## Persistence Strategy

### v1 (CAV-017): InMemoryRepository

Same pattern as all other aggregates. Messages stored in memory. Sufficient for development.

### v2 (future): Database-backed

When a database is introduced, ChatThread and ChatMessage map naturally to tables:
- `chat_threads (id, project_id, scope_type, entity_id, title, created_at)`
- `chat_messages (id, thread_id, role, content, entity_refs JSONB, actions JSONB, created_at)`

Unique constraint on `(project_id, scope_type, entity_id)` for threads.

### Message Pagination

Messages are loaded in reverse chronological order (newest first for display). Default page size: 50. `before` cursor uses message `createdAt` ISO timestamp for pagination.

---

## AI Provider Architecture (Design Only)

CAV-017 will implement the chat dock and backend. The AI provider is designed but not wired.

### Interface

```typescript
interface ChatAIProvider {
  generateResponse(
    thread: ChatThread,
    newMessage: ChatMessage,
    context: ScopeContext,
  ): Promise<{
    content: string
    entityRefs: ChatEntityRef[]
    actions: ChatActionSuggestion[]
  }>
}

interface ScopeContext {
  scopeType: ScopeType
  entityId: string | null
  entities: Array<{ type: NodeType; id: string; name: string }>
  relations: Array<{ type: EdgeType; sourceId: string; targetId: string }>
  validationIssues: ValidationIssue[]
  recentMessages: ChatMessageDto[]  // last N for conversation context
}
```

### Stub Provider (CAV-017)

A `StubChatAIProvider` that echoes back a formatted response:

```
I received your message about [scope]. This is a placeholder response.
The current scope contains N entities and M relations.
```

This proves the pipeline works without requiring an actual LLM.

### Future Provider

When a real LLM is connected (Anthropic API via CAV SDK), the `ScopeContext` is serialized into the system prompt, messages are forwarded, and the response is parsed for entity refs and action suggestions.

---

## What This Does NOT Change

1. **Visual grammar** — No new NodeType or EdgeType for chat
2. **Graph projection** — Chat doesn't affect the visual graph
3. **Inspector** — No chat tab in inspector for v1 (future consideration)
4. **Diff system** — Chat threads are not part of releases/snapshots
5. **Validation** — Chat doesn't trigger validation
6. **Audit** — Chat messages are not audited in v1 (they're conversational, not mutations)

---

## Implementation Slices for CAV-017

### CAV-017a: Shared Types (~10 tests)
**Scope:** `packages/shared-types/src/index.ts`
- Add `ChatMessageRole`, `ChatEntityRef`, `ChatActionType`, `ChatActionSuggestion`
- Add `ChatMessageDto`, `ChatThreadDto`, `CreateChatMessageDto`
- Export all types

### CAV-017b: Backend Domain + Service (~60 tests)
**Scope:** `services/company-design/src/chat/`
- `ChatMessage` entity (immutable, EntityRef/Action value objects)
- `ChatThread` aggregate (create, addMessage, identity uniqueness)
- `ChatRepository` interface + `InMemoryRepository`
- `ChatService` (getOrCreateThread, sendMessage, listMessages, listThreads, deleteThread, buildScopeContext)
- `ChatMapper` (domain ↔ DTO)
- `ChatController` (REST endpoints)
- `ChatModule` (registered in AppModule)

### CAV-017c: Gateway BFF (~10 tests)
**Scope:** `apps/api-gateway/src/company-model/`
- `CompanyDesignClient` new chat methods
- `ChatController` proxy
- `CompanyModelModule` updated

### CAV-017d: Frontend API + Hooks (~20 tests)
**Scope:** `apps/web/src/api/chat.ts`, `apps/web/src/hooks/use-chat.ts`
- `chatApi` (getThread, listThreads, listMessages, sendMessage, deleteThread)
- `useChatThread`, `useChatMessages`, `useSendMessage`, `useChatThreads` hooks
- Store: `activeChatThreadId`, `setActiveChatThread()`

### CAV-017e: Chat Dock UI (~40 tests)
**Scope:** `apps/web/src/components/visual-shell/chat-dock/`
- `ChatDock` (upgraded from placeholder: thread loading, scope sync, resize)
- `ChatMessageList` (scrollable, auto-scroll, pagination)
- `ChatMessage` (user/assistant/system rendering, markdown, entity refs, actions)
- `ChatInput` (input + send + entity mention popover)
- `EntityRefChip` (clickable entity reference)
- `ActionButton` (clickable action suggestion)
- Explorer Chat tab (thread list with navigation)

**Estimated total: ~140 tests across 5 slices.**

---

## API Contract Summary

```
GET    /projects/:projectId/chat/threads
  → ChatThreadDto[]

GET    /projects/:projectId/chat/threads/by-scope?scopeType=company&entityId=...
  → ChatThreadDto (created if not exists)

GET    /projects/:projectId/chat/threads/:threadId/messages?limit=50&before=...
  → ChatMessageDto[]

POST   /projects/:projectId/chat/threads/:threadId/messages
  Body: { content: string, entityRefs?: ChatEntityRef[] }
  → ChatMessageDto

DELETE /projects/:projectId/chat/threads/:threadId
  → 204
```

---

## Acceptance Criteria (Checklist G in doc 19)

After CAV-017 implementation:
- [ ] Existe chat persistente de empresa/CEO → `useChatThread(projectId, 'company')`
- [ ] Existe chat persistente por department → `useChatThread(projectId, 'department', deptId)`
- [ ] Existe chat persistente por workflow o nodo → `useChatThread(projectId, 'workflow', wfId)`
- [ ] El chat está realmente conectado al scope y no es placeholder → thread auto-load on scope change

---

## Decision Log

| Decision | Rationale |
|----------|-----------|
| Chat module in company-design service | Tight coupling to entity data, SnapshotCollector access, avoids cross-service calls |
| Thread = unique per (project, scopeType, entityId) | Natural mapping to scope model; one conversation per context |
| GET creates thread on first access | Seamless UX — no "create thread" step, chat just works |
| Messages immutable (no edit/delete) | Simplicity. Chat history is a log, not a document |
| AI provider as interface + stub | Decouples chat plumbing from LLM integration. CAV-017 proves the pipeline; AI wiring is a separate concern |
| Entity refs as explicit structure, not inline parsing | Reliable linking without NLP. User selects entities via @ mention popover |
| Action suggestions as typed objects | Enables safe, predictable execution vs. freeform AI commands |
| Explorer chat tab (not inspector) | Chat is cross-entity, not per-selection. Explorer is the right home |
| No chat in diff mode | Diff is read-only analysis. Chat is design-time interaction |
| Pagination by cursor (before timestamp) | Efficient for append-only message logs. No offset pagination issues |
