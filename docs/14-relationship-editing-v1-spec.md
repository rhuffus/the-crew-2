# Relationship Editing v1 — Formal Specification

Epic 25 | VIS-008 | Plan deliverable

## 1. Purpose

This document specifies how users create, edit, and delete relationships (edges) directly on the visual canvas. It covers connection validation, ambiguity resolution, domain mutation mapping, inspector editing, deletion flow, and the implementation plan.

It builds on:
- `docs/11-visual-grammar-v1-spec.md` (VIS-002) — edge types, connection rules
- `docs/12-graph-projection-v1-spec.md` (VIS-003) — edge extraction from domain data
- `docs/adr/ADR-006-relationship-editing-v1.md` — architecture decision

---

## 2. Core Principle

> Creating or deleting an edge on the canvas is a **domain mutation**, not a visual-only operation.

Every canvas edge maps to a field on a domain entity. Edge creation calls `PATCH` on the owning entity. Edge deletion removes the relationship from the owning entity. The graph projection then re-derives the edge from updated data.

---

## 3. Edge Editability Matrix

### 3.1 Creatable edges (drag-to-connect on canvas)

| Edge Type | Source → Target | Mutated Entity | Field | Mutation Type |
|-----------|----------------|---------------|-------|---------------|
| `reports_to` | dept → dept | Department (source) | `parentId` | Set single ID |
| `owns` | dept → capability | Capability (target) | `ownerDepartmentId` | Set single ID |
| `owns` | dept → workflow | Workflow (target) | `ownerDepartmentId` | Set single ID |
| `assigned_to` | archetype → role | AgentArchetype (source) | `roleId` | Set single ID |
| `contributes_to` | role → capability | Role (source) | `capabilityIds[]` | Add to array |
| `has_skill` | archetype → skill | AgentArchetype (source) | `skillIds[]` | Add to array |
| `compatible_with` | skill → role | Skill (source) | `compatibleRoleIds[]` | Add to array |
| `provides` | dept/cap → contract | Contract (target) | `providerId` + `providerType` | Set single ID + type |
| `consumes` | dept/cap → contract | Contract (target) | `consumerId` + `consumerType` | Set single ID + type |
| `bound_by` | workflow → contract | Workflow (source) | `contractIds[]` | Add to array |
| `participates_in` | role/dept → workflow | Workflow (target) | `participants[]` | Add ValueObject |
| `governs` | policy → dept/company | Policy (source) | `departmentId` / `scope` | Set single ID / enum |

### 3.2 Non-creatable edges

| Edge Type | Reason |
|-----------|--------|
| `hands_off_to` | Derived from `stages[].order`. Users reorder stages, not hand-off edges. |

### 3.3 Mutation type definitions

| Type | Behavior | API Call |
|------|----------|----------|
| **Set single ID** | Replaces the current value. Previous relationship is removed. | `PATCH /entity/:id { field: newValue }` |
| **Add to array** | Appends to existing array. Does not remove previous values. | `PATCH /entity/:id { field: [...existing, newValue] }` |
| **Add ValueObject** | Appends a structured object to array. May require metadata input. | `PATCH /entity/:id { field: [...existing, newVO] }` |

---

## 4. Connection Validation

### 4.1 Validation engine (client-side)

```typescript
// packages/shared-types (already exists)
interface ConnectionRule {
  edgeType: EdgeType
  sourceTypes: NodeType[]
  targetTypes: NodeType[]
  category: EdgeCategory
  style: EdgeStyle
}

// New utility: apps/web/src/lib/connection-validator.ts
interface ConnectionValidation {
  valid: boolean
  possibleEdgeTypes: EdgeType[]
}

function validateConnection(
  sourceNodeType: NodeType,
  targetNodeType: NodeType,
  rules: ConnectionRule[]
): ConnectionValidation

function getValidTargetTypes(
  sourceNodeType: NodeType,
  rules: ConnectionRule[]
): NodeType[]

function getValidSourceTypes(
  targetNodeType: NodeType,
  rules: ConnectionRule[]
): NodeType[]
```

### 4.2 Validation during drag

1. User starts dragging from a source node's connection handle.
2. Call `getValidTargetTypes(sourceNodeType)` to determine valid target types.
3. Nodes with invalid types are **dimmed** (reduced opacity, non-connectable).
4. Valid target nodes get a **highlight ring** (subtle glow).
5. Edges snap to valid targets only.

### 4.3 Duplicate edge prevention

Before creating an edge, check if the same relationship already exists:
- For **single-ID fields**: the edge replaces the existing value (no duplicate possible, but warn user about replacement).
- For **array fields**: check if the target ID already exists in the array. If so, reject with "Relationship already exists" feedback.

### 4.4 Self-loop prevention

`reports_to` and other hierarchical edges must not allow a node to connect to itself. The validator rejects `sourceId === targetId`.

### 4.5 Circular dependency prevention (reports_to only)

For `reports_to` edges, prevent circular department hierarchies. Before setting `dept.parentId`, traverse the parent chain from the target to check if the source is an ancestor.

---

## 5. Ambiguity Resolution

### 5.1 Ambiguous pairs

Some source→target type combinations match multiple edge types:

| Source Type | Target Type | Possible Edge Types |
|------------|------------|-------------------|
| `department` | `workflow` | `owns`, `participates_in` |
| `department` | `contract` | `provides`, `consumes` |
| `capability` | `contract` | `provides`, `consumes` |

### 5.2 Disambiguation UI

When a connection matches multiple edge types:

1. Show a **popover picker** near the drop point.
2. List possible edge types with labels and icons.
3. User selects one.
4. Proceed with the selected edge type's mutation.
5. If user dismisses the picker, cancel the connection.

```typescript
// Component: apps/web/src/components/visual-shell/edge-type-picker.tsx
interface EdgeTypePickerProps {
  position: { x: number; y: number }
  options: EdgeType[]
  onSelect: (edgeType: EdgeType) => void
  onCancel: () => void
}
```

The picker renders as a floating card with a list of options. Each option shows:
- Edge type label (from `EDGE_TYPE_LABELS`)
- Category badge
- Visual style indicator (solid/dashed/dotted line sample)

---

## 6. Metadata Input

### 6.1 Edges requiring additional input

| Edge Type | Required Metadata | Input UI |
|-----------|------------------|----------|
| `participates_in` | `responsibility: string` | Inline text input in popover |
| `provides` | (none beyond entity IDs) | — |
| `consumes` | (none beyond entity IDs) | — |

### 6.2 Metadata input flow

For `participates_in`:
1. After disambiguation (if needed), show a mini-form popover.
2. Required field: `responsibility` (text input, max 200 chars).
3. Submit creates the participant ValueObject.
4. Cancel aborts the connection.

All other edge types require no additional metadata — the connection is fully determined by source and target node IDs.

---

## 7. Edge Creation Flow (Complete)

```
User drags from source handle
  ↓
[1] getValidTargetTypes(sourceNodeType)
  ↓ dim invalid nodes, highlight valid
User drops on target node
  ↓
[2] validateConnection(sourceType, targetType)
  ↓ if invalid → reject (shouldn't happen if step 1 worked)
[3] Check for ambiguity
  ↓ if multiple edge types → show EdgeTypePicker
  ↓ if single → auto-select
[4] Check for metadata requirement
  ↓ if metadata needed → show MetadataInput popover
  ↓ if none → proceed
[5] Check for duplicates
  ↓ if duplicate → show "already exists" toast, abort
  ↓ if replacing (single-ID) → show "will replace X" confirm
[6] resolveRelationshipMutation(edgeType, sourceNode, targetNode, metadata?)
  ↓ returns { entityType, entityId, patchPayload }
[7] Optimistic canvas update (add edge visually)
[8] Call domain PATCH API
  ↓ on success → invalidate graph query, full refresh
  ↓ on failure → rollback optimistic edge, show error toast
```

---

## 8. Edge Deletion Flow

### 8.1 Deletion triggers

- Select edge on canvas + press `Delete`/`Backspace` key.
- Click "Delete" button in edge inspector.

### 8.2 Deletion confirmation

Show a confirm dialog:
```
Delete relationship?

"Role: Frontend Dev" → contributes_to → "Capability: UI Development"

This will remove "UI Development" from the role's capabilities.

[Cancel] [Delete]
```

### 8.3 Deletion mutation mapping

| Edge Type | Mutated Entity | Mutation |
|-----------|---------------|----------|
| `reports_to` | Department (source) | Set `parentId` to `null` |
| `owns` (dept→cap) | Capability (target) | Set `ownerDepartmentId` to `null` |
| `owns` (dept→wf) | Workflow (target) | Set `ownerDepartmentId` to `null` |
| `assigned_to` | AgentArchetype (source) | Set `roleId` to `null` |
| `contributes_to` | Role (source) | Remove target ID from `capabilityIds[]` |
| `has_skill` | AgentArchetype (source) | Remove target ID from `skillIds[]` |
| `compatible_with` | Skill (source) | Remove target ID from `compatibleRoleIds[]` |
| `provides` | Contract (target) | Set `providerId` to `null`, `providerType` to `null` |
| `consumes` | Contract (target) | Set `consumerId` to `null`, `consumerType` to `null` |
| `bound_by` | Workflow (source) | Remove target ID from `contractIds[]` |
| `participates_in` | Workflow (target) | Remove participant VO from `participants[]` |
| `governs` | Policy (source) | Set `departmentId` to `null`, `scope` to `'global'` |

### 8.4 Deletion flow

```
User triggers delete (key or button)
  ↓
[1] Show confirm dialog with relationship details
  ↓ user confirms
[2] resolveRelationshipDeletion(edgeType, sourceNode, targetNode)
  ↓ returns { entityType, entityId, patchPayload }
[3] Optimistic canvas update (remove edge visually)
[4] Call domain PATCH API
  ↓ on success → invalidate graph query, full refresh
  ↓ on failure → rollback, show error toast
```

---

## 9. Relationship Mutation Resolver

### 9.1 Purpose

A pure function that maps edge creation/deletion to the correct domain API call. This is the central mapping layer between canvas interactions and domain mutations.

### 9.2 Module location

```
apps/web/src/lib/relationship-mutations.ts
```

### 9.3 Interface

```typescript
interface RelationshipMutation {
  /** Which entity to PATCH */
  entityType: 'department' | 'capability' | 'workflow' | 'role'
    | 'agent-archetype' | 'skill' | 'contract' | 'policy'
  /** ID of the entity to PATCH */
  entityId: string
  /** The PATCH payload */
  patch: Record<string, unknown>
  /** Human-readable description of the change */
  description: string
}

function resolveEdgeCreation(
  edgeType: EdgeType,
  sourceNode: VisualNodeDto,
  targetNode: VisualNodeDto,
  metadata?: Record<string, unknown>
): RelationshipMutation

function resolveEdgeDeletion(
  edgeType: EdgeType,
  sourceNode: VisualNodeDto,
  targetNode: VisualNodeDto,
  currentEntityData?: Record<string, unknown>
): RelationshipMutation
```

### 9.4 Creation resolution rules

| Edge Type | entityType | entityId | patch |
|-----------|-----------|----------|-------|
| `reports_to` | `department` | source.entityId | `{ parentId: target.entityId }` |
| `owns` (→cap) | `capability` | target.entityId | `{ ownerDepartmentId: source.entityId }` |
| `owns` (→wf) | `workflow` | target.entityId | `{ ownerDepartmentId: source.entityId }` |
| `assigned_to` | `agent-archetype` | source.entityId | `{ roleId: target.entityId }` |
| `contributes_to` | `role` | source.entityId | `{ capabilityIds: [...current, target.entityId] }` |
| `has_skill` | `agent-archetype` | source.entityId | `{ skillIds: [...current, target.entityId] }` |
| `compatible_with` | `skill` | source.entityId | `{ compatibleRoleIds: [...current, target.entityId] }` |
| `provides` | `contract` | target.entityId | `{ providerId: source.entityId, providerType: source.nodeType }` |
| `consumes` | `contract` | target.entityId | `{ consumerId: source.entityId, consumerType: source.nodeType }` |
| `bound_by` | `workflow` | source.entityId | `{ contractIds: [...current, target.entityId] }` |
| `participates_in` | `workflow` | target.entityId | `{ participants: [...current, { participantId: source.entityId, participantType: source.nodeType, responsibility }] }` |
| `governs` | `policy` | source.entityId | `{ departmentId: target.entityId, scope: 'department' }` or `{ scope: 'global' }` |

### 9.5 Array mutation challenge

For array fields (`capabilityIds[]`, `skillIds[]`, etc.), the frontend needs the **current** array value to produce the correct patch. Two approaches:

**Approach A (chosen for v1):** Read the entity's current data before mutation.
- Call `GET /entity/:id` to fetch current state.
- Compute the new array.
- Send `PATCH` with the full new array.

**Approach B (future):** Add `add-to-array` / `remove-from-array` semantics to the API.
- Deferred. Requires new endpoint design.

### 9.6 Provider/consumer type mapping

For `provides` and `consumes` edges, the `providerType`/`consumerType` is derived from the source node type:

| Source NodeType | providerType / consumerType |
|----------------|---------------------------|
| `department` | `'department'` |
| `capability` | `'capability'` |

---

## 10. Canvas UX Specification

### 10.1 Connection handles

Nodes gain **connection handles** (small circles on node borders) when:
- The canvas is in default mode (not in read-only/presentation mode).
- The node type is a valid source or target for at least one edge type.

Handle placement:
- **Source handles**: right side and bottom of node.
- **Target handles**: left side and top of node.

React Flow provides this via `Handle` components with `type="source"` and `type="target"`.

### 10.2 Visual feedback during drag

| State | Visual |
|-------|--------|
| Dragging from source | Source node highlighted. Valid targets show glow ring. Invalid targets dimmed to 30% opacity. |
| Hovering valid target | Target node border turns accent color. Snap indicator appears. |
| Hovering invalid target | No snap. Cursor shows "not allowed". |
| Connection dropped on void | Connection cancelled silently. |

### 10.3 Edge visual states

| State | Visual |
|-------|--------|
| Default | Style per edge type (solid/dashed/dotted with category color) |
| Hover | Thicker stroke, slight glow |
| Selected | Thicker stroke, accent color, selection handles visible |
| Optimistic (pending) | Pulsing animation, muted color |
| Error (failed) | Red flash, then removed |

### 10.4 Keyboard shortcuts

| Key | Action | Context |
|-----|--------|---------|
| `Delete` / `Backspace` | Delete selected edge | Edge selected |
| `Escape` | Cancel connection in progress | During drag |
| `Escape` | Dismiss picker/form | Picker open |

---

## 11. Inspector Edge Editing

### 11.1 Edge inspector enhancements

The current read-only edge inspector gains:

| Section | Current | New |
|---------|---------|-----|
| Header | Edge type label | Edge type label + **Delete button** |
| Source | Node summary + link | (unchanged) |
| Target | Node summary + link | (unchanged) |
| Properties | Static display | **Editable fields** (where applicable) |

### 11.2 Editable edge properties

| Edge Type | Editable Properties |
|-----------|-------------------|
| `participates_in` | `responsibility` (text input) |
| All others | No editable properties in v1 |

### 11.3 Delete from inspector

The delete button in the edge inspector header triggers the same deletion flow (confirm dialog → API call → refresh).

### 11.4 Inspector node relations tab enhancements

The relations tab on node inspector shows incoming/outgoing edges. Enhancement:
- Each relation row gains a **remove (×) button** to delete that specific relationship.
- An **"Add Relationship"** button at the bottom opens a connection picker:
  1. Select edge type (filtered to valid types for this node type).
  2. Select target entity from a searchable list.
  3. Fill metadata if needed.
  4. Create the relationship.

This provides a non-drag alternative for creating relationships, useful for connecting to entities not currently visible on canvas.

---

## 12. Error Handling

### 12.1 API errors

| Scenario | Handling |
|----------|----------|
| 404 (entity not found) | Toast: "Entity not found. It may have been deleted." Refresh graph. |
| 400 (validation error) | Toast with server message. Rollback optimistic update. |
| 409 (conflict) | Toast: "Conflict. Refreshing..." Refresh graph. |
| 500 (server error) | Toast: "Server error. Please try again." Rollback. |

### 12.2 Optimistic rollback

The canvas maintains a "pending mutations" queue. Each mutation stores the previous state. On failure, the mutation is rolled back and the graph refreshed from server.

---

## 13. State Management

### 13.1 New store additions

```typescript
// Additions to visual-workspace-store.ts

interface VisualWorkspaceState {
  // ... existing state ...

  /** Edge being created (drag in progress) */
  pendingConnection: {
    sourceNodeId: string
    sourceNodeType: NodeType
    validTargetTypes: NodeType[]
  } | null

  /** Picker state */
  edgeTypePicker: {
    position: { x: number; y: number }
    options: EdgeType[]
    sourceNode: VisualNodeDto
    targetNode: VisualNodeDto
  } | null

  /** Metadata input state */
  metadataInput: {
    edgeType: EdgeType
    sourceNode: VisualNodeDto
    targetNode: VisualNodeDto
  } | null

  /** Pending mutations for optimistic UI */
  pendingMutations: string[]  // edge IDs being created/deleted
}
```

### 13.2 Actions

```typescript
startConnection(sourceNodeId: string, sourceNodeType: NodeType): void
cancelConnection(): void
showEdgeTypePicker(position, options, sourceNode, targetNode): void
dismissEdgeTypePicker(): void
showMetadataInput(edgeType, sourceNode, targetNode): void
dismissMetadataInput(): void
addPendingMutation(edgeId: string): void
removePendingMutation(edgeId: string): void
```

---

## 14. Hook: useRelationshipMutation

```typescript
// apps/web/src/hooks/use-relationship-mutation.ts

interface UseRelationshipMutationReturn {
  createEdge: (
    edgeType: EdgeType,
    sourceNode: VisualNodeDto,
    targetNode: VisualNodeDto,
    metadata?: Record<string, unknown>
  ) => Promise<void>

  deleteEdge: (
    edgeType: EdgeType,
    sourceNode: VisualNodeDto,
    targetNode: VisualNodeDto
  ) => Promise<void>

  updateEdgeMetadata: (
    edgeType: EdgeType,
    sourceNode: VisualNodeDto,
    targetNode: VisualNodeDto,
    metadata: Record<string, unknown>
  ) => Promise<void>

  isPending: boolean
}
```

This hook:
1. Resolves the mutation via `resolveEdgeCreation`/`resolveEdgeDeletion`.
2. For array fields, fetches current entity data first.
3. Calls the appropriate domain API via existing API client functions.
4. Invalidates the visual graph query on success.
5. Manages pending state.

---

## 15. Implementation Plan

### Slice VIS-008a: Connection Validator + Mutation Resolver (edit)

**Scope:** Pure utility functions, no UI.

**Files:**
- `apps/web/src/lib/connection-validator.ts` — `validateConnection()`, `getValidTargetTypes()`, `getValidSourceTypes()`
- `apps/web/src/lib/connection-validator.test.ts`
- `apps/web/src/lib/relationship-mutations.ts` — `resolveEdgeCreation()`, `resolveEdgeDeletion()`
- `apps/web/src/lib/relationship-mutations.test.ts`

**Tests:** All 12 edge types for creation resolution, all deletable edge types for deletion resolution, all ambiguous pairs, duplicate detection, self-loop prevention.

**Estimated tests:** ~60

### Slice VIS-008b: Canvas Connection Handling (edit)

**Scope:** React Flow `onConnect`, connection handles, visual feedback during drag.

**Files:**
- `apps/web/src/components/visual-shell/canvas-viewport.tsx` — add `onConnect`, `onConnectStart`, `onConnectEnd`, `isValidConnection`, connection handle rendering
- `apps/web/src/components/visual-shell/nodes/visual-node.tsx` — add `Handle` components
- `apps/web/src/components/visual-shell/edge-type-picker.tsx` — disambiguation popover
- `apps/web/src/components/visual-shell/metadata-input.tsx` — metadata form popover (participates_in responsibility)
- `apps/web/src/stores/visual-workspace-store.ts` — add connection state
- Tests for all above

**Estimated tests:** ~40

### Slice VIS-008c: Relationship Mutation Hook + API Integration (edit)

**Scope:** `useRelationshipMutation` hook, optimistic updates, error handling.

**Files:**
- `apps/web/src/hooks/use-relationship-mutation.ts`
- `apps/web/src/hooks/use-relationship-mutation.test.ts`
- Integration with existing API clients (`departmentsApi`, `capabilitiesApi`, `rolesApi`, etc.)

**Estimated tests:** ~25

### Slice VIS-008d: Edge Deletion + Inspector Editing (edit)

**Scope:** Delete flow, confirm dialog, inspector edit capabilities.

**Files:**
- `apps/web/src/components/visual-shell/edge-delete-confirm.tsx` — confirm dialog
- `apps/web/src/components/visual-shell/inspector/edge-inspector.tsx` — add delete button, editable metadata
- `apps/web/src/components/visual-shell/inspector/relations-tab.tsx` — add remove buttons, add-relationship button
- `apps/web/src/components/visual-shell/canvas-viewport.tsx` — keyboard shortcut for delete
- Tests for all above

**Estimated tests:** ~30

### Slice VIS-008e: Add-Relationship from Inspector (edit)

**Scope:** Non-drag alternative for creating relationships from the inspector relations tab.

**Files:**
- `apps/web/src/components/visual-shell/inspector/add-relationship-dialog.tsx` — edge type selector + entity search + metadata form
- `apps/web/src/components/visual-shell/inspector/relations-tab.tsx` — wire add button
- Tests

**Estimated tests:** ~20

### Total estimated: ~175 new tests

---

## 16. Dependencies

| Dependency | Status |
|------------|--------|
| VIS-003 (graph projection spec) | Done |
| VIS-007 (inspector v1) | Done |
| CONNECTION_RULES in shared-types | Done |
| Domain CRUD APIs (all entities) | Done |
| React Flow onConnect API | Available (not yet wired) |

---

## 17. What This Spec Does NOT Cover

| Deferred to | Topic |
|-------------|-------|
| VIS-011 | Cross-scope navigation when connecting to entities outside current view |
| VIS-012 | Validation overlay updates after relationship mutation |
| VIS-013 | Layer filtering interaction with connection handles |
| Future | Undo/redo for relationship changes |
| Future | Batch relationship creation (e.g., connect role to multiple capabilities at once) |
| Future | Custom edge components (animated hand-offs, bidirectional arrows) |
| Future | Array mutation API (add/remove semantics instead of full array replace) |

---

## 18. Acceptance Criteria

- [ ] All 11 user-creatable edge types can be created via drag-to-connect on canvas
- [ ] CONNECTION_RULES validated client-side before connection completes
- [ ] Invalid targets dimmed during drag
- [ ] Ambiguous connections resolved via picker dialog
- [ ] `participates_in` prompts for responsibility metadata
- [ ] Duplicate relationships prevented
- [ ] Self-loops prevented
- [ ] Circular `reports_to` hierarchies prevented
- [ ] All 11 user-creatable edge types can be deleted from canvas or inspector
- [ ] Delete shows confirm dialog with relationship details
- [ ] Edge inspector shows delete button and editable metadata
- [ ] Relations tab shows remove buttons and add-relationship action
- [ ] Optimistic updates with rollback on API failure
- [ ] Error toasts for API failures
- [ ] `hands_off_to` edges are not user-creatable or deletable
- [ ] All mutations trigger graph refresh after success
- [ ] Tests: ~175 new tests across 5 slices

---

## 19. References

- `docs/11-visual-grammar-v1-spec.md` — Visual Grammar v1 (VIS-002)
- `docs/12-graph-projection-v1-spec.md` — Graph Projection v1 (VIS-003)
- `docs/adr/ADR-006-relationship-editing-v1.md` — Architecture decision
- `packages/shared-types/src/index.ts` — CONNECTION_RULES, EdgeType, NodeType
- `apps/web/src/components/visual-shell/inspector/edge-inspector.tsx` — Current edge inspector
- `apps/web/src/components/visual-shell/canvas-viewport.tsx` — Current canvas (no onConnect)
- `apps/web/src/lib/graph-to-flow.ts` — Edge conversion to React Flow
