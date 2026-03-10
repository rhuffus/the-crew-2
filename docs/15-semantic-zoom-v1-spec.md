# Semantic Zoom & Nested Navigation v1 — Specification

Epic 28 | VIS-011 | Plan deliverable

## 1. Purpose

This document specifies how users navigate between semantic zoom levels (L1–L4) on the TheCrew canvas, how transitions are animated, how container nodes collapse/expand, how cross-scope references work, and how keyboard shortcuts accelerate navigation.

It builds on:
- `docs/11-visual-grammar-v1-spec.md` (VIS-002) — zoom levels, visibility rules
- `docs/12-graph-projection-v1-spec.md` (VIS-003) — scope filtering, breadcrumbs
- ADR-002 — visual shell layout

---

## 2. Current State & Gaps

### 2.1 What works today

| Feature | Status |
|---------|--------|
| Route-based navigation (L1 → L2 → L3) | Working via `navigate()` on double-click |
| Breadcrumb trail | Working but shows raw entity IDs, not names |
| Browser back/forward | Working (TanStack Router history) |
| Focus-to-center (explorer → canvas) | Working via `fitView` with 300ms duration |
| View state persistence (layers, filters) | Working via localStorage per project+scope |
| MiniMap | Working |

### 2.2 Gaps this spec addresses

| Gap | Impact |
|-----|--------|
| No transition animation between levels | Jarring context switch on drill-in/out |
| Breadcrumbs show entity IDs instead of names | Users can't identify where they are |
| No collapse/expand for container nodes | Can't reduce visual noise at any level |
| No cross-reference navigation | Can't follow links to entities outside current scope |
| No keyboard navigation | Power users have no shortcuts |
| No visual drilldown affordance | Unclear which nodes are drillable |
| No navigation history in store | Can't programmatically navigate back |
| No "up one level" gesture | Only breadcrumb to go back |
| Workflow breadcrumb doesn't show owner department | Missing intermediate path segment |

---

## 3. Design Principles

1. **Navigation is semantic, not geometric.** Zoom wheel changes graphical scale; level transitions change what data is shown.
2. **Route = truth.** Each zoom level is a URL route. The URL is the source of truth for what the user sees. This preserves browser history, deep linking, and shareable URLs.
3. **Transitions should feel spatial.** When drilling into a department, the animation should zoom toward that node. When going back, it should zoom out.
4. **Progressive disclosure.** Container nodes can be collapsed to reduce noise without navigating away.
5. **Keyboard-first for power users.** Every navigation action available via mouse should also be available via keyboard.

---

## 4. Zoom Level Transitions

### 4.1 Transition model

Semantic zoom transitions are **route-based with animated handoff**. The sequence:

```
1. User triggers drill-in (double-click, Enter, or breadcrumb)
2. Current canvas plays zoom-in animation toward target node
3. Route changes (URL updates, new data fetches)
4. New canvas mounts with initial zoom-out state
5. New canvas plays zoom-in animation to fit the new graph
```

For drill-out (breadcrumb click, Escape, or back button):

```
1. Current canvas plays zoom-out animation
2. Route changes
3. New canvas mounts with initial zoom-in state on the entity we came from
4. New canvas plays zoom-out animation to fit the full graph
```

### 4.2 Animation contract

| Property | Value |
|----------|-------|
| Duration | 400ms |
| Easing | `ease-out` (CSS) / `cubicBezier(0, 0, 0.2, 1)` |
| Direction (drill-in) | Current view scales up + fades out |
| Direction (drill-out) | Current view scales down + fades out |
| Mechanism | CSS transform on canvas container, then React Flow `fitView` on mount |

### 4.3 Transition state in store

```typescript
// New store fields
transitionDirection: 'drill-in' | 'drill-out' | null
transitionTargetId: string | null  // visual node ID being drilled into/out from

// New store methods
startTransition(direction: 'drill-in' | 'drill-out', targetId: string): void
clearTransition(): void
```

The transition state is set **before** the route change and read by the new canvas on mount to determine its initial viewport position.

### 4.4 Implementation: TransitionWrapper component

A `TransitionWrapper` component wraps the `ReactFlow` instance inside `CanvasViewport`:

```typescript
interface TransitionWrapperProps {
  children: React.ReactNode
  direction: 'drill-in' | 'drill-out' | null
  onTransitionEnd: () => void
}
```

- On mount, if `direction` is set, applies an initial CSS transform (scaled up for drill-in, scaled down for drill-out) and immediately transitions to `transform: none`.
- Calls `onTransitionEnd` after the CSS transition completes, which triggers `clearTransition()` in the store.

### 4.5 What does NOT change semantic level

- **Mouse wheel / pinch zoom**: Changes graphical scale only (existing React Flow behavior, `minZoom: 0.1`, `maxZoom: 4`).
- **Fit view**: Resets graphical zoom to fit all nodes. Does not change level.
- **Pan**: Moves the viewport. Does not change level.

This is a deliberate v1 choice. Automatic semantic zoom triggered by graphical zoom thresholds (e.g., zoom past 2x on a department node auto-drills into it) is deferred to v2.

---

## 5. Drilldown Affordance

### 5.1 Visual indicator

Nodes that support drilldown (`company`, `department`, `workflow`) display a **drilldown indicator**: a small expand icon in the bottom-right corner of the node.

| Node Type | Drillable | Target Level |
|-----------|-----------|-------------|
| `company` | Yes (L1 → L1 org canvas) | L1 |
| `department` | Yes | L2 |
| `workflow` | Yes | L3 |
| All others | No | N/A (L4 inspector only) |

### 5.2 Trigger methods

| Method | Action |
|--------|--------|
| Double-click on drillable node | Navigate to target level |
| Press `Enter` with drillable node selected | Navigate to target level |
| Click drilldown icon on node | Navigate to target level |
| Explorer tree expand arrow | Navigate to target level |

### 5.3 Non-drillable node interaction

Single-clicking a non-drillable node opens L4 (inspector). Double-clicking does nothing additional (no drill-in; the node is already at maximum detail). This prevents confusion about what's drillable.

---

## 6. Collapse / Expand Container Nodes

### 6.1 Concept

At any zoom level, container nodes (nodes whose children are visible on the current canvas) can be **collapsed** to hide their children and show a summary badge instead.

This is NOT a level change — it's a within-level visual simplification. The route stays the same, the data stays the same, but children are hidden on the canvas.

### 6.2 Which nodes are collapsible

| Level | Collapsible Nodes | Children Hidden When Collapsed |
|-------|------------------|-------------------------------|
| L1 | — | None (departments are the unit at L1; collapsing them would empty the view) |
| L2 | `department` (context) | All children except the department node itself |
| L2 | Node type groups | Roles, capabilities, workflows can be grouped and collapsed as a cluster |
| L3 | `workflow` (context) | All stages |

### 6.3 Collapse behavior

When a container is collapsed:
1. Children nodes are hidden from the canvas
2. The container node shows a badge: `+N` (count of hidden children)
3. Edges from/to hidden children are **aggregated** onto the container node as a count badge (e.g., "3 connections")
4. Expanding reverses the process with a 200ms animation

### 6.4 Collapse state

```typescript
// New store field
collapsedNodeIds: string[]

// New store methods
toggleCollapse(nodeId: string): void
expandAll(): void
collapseAll(): void
```

Collapse state is **per-view** and resets on navigation. It is NOT persisted in localStorage (too volatile to be useful across sessions).

### 6.5 Layout impact

When nodes are collapsed:
- The layout function receives a filtered node set (with collapsed children removed)
- The container node gets a `data.childCount` property for the badge
- Edges are not re-extracted; they're simply hidden if either endpoint is collapsed

### 6.6 Implementation: client-side filtering

Collapse is implemented as an additional filtering step AFTER `filterGraph` and BEFORE `graphToFlow`:

```typescript
function applyCollapse(
  nodes: VisualNodeDto[],
  edges: VisualEdgeDto[],
  collapsedIds: string[]
): { nodes: VisualNodeDto[]; edges: VisualEdgeDto[]; collapsedCounts: Map<string, number> }
```

This pure function:
1. For each collapsed ID, removes nodes where `parentId` matches (recursively for nested containers)
2. Counts removed children per container
3. Removes edges where source or target was removed
4. Returns the filtered set + counts map

---

## 7. Breadcrumb Enhancements

### 7.1 Current problems

1. Shows raw entity IDs (`dept-abc`) instead of human-readable names
2. Workflow breadcrumb doesn't include the owner department as intermediate crumb
3. No indication of current zoom level

### 7.2 Solution: use backend breadcrumb data

The `VisualGraphDto` already includes a `breadcrumb: BreadcrumbEntry[]` field from the backend graph projection. The `TopBar` should use this instead of building breadcrumbs from store state.

```typescript
// New store field
breadcrumb: BreadcrumbEntry[]

// New store method
setBreadcrumb(entries: BreadcrumbEntry[]): void
```

Each route sets the breadcrumb from the graph response:

```typescript
useEffect(() => {
  if (graph?.breadcrumb) {
    setBreadcrumb(graph.breadcrumb)
  }
}, [graph, setBreadcrumb])
```

### 7.3 Enhanced TopBar breadcrumb rendering

```
TheCrew > Project Name > Organization                          (L1)
TheCrew > Project Name > Organization > Engineering            (L2)
TheCrew > Project Name > Organization > Engineering > CI/CD    (L3, workflow under Engineering)
```

Each breadcrumb entry:
- Uses `entry.label` (the entity's real name from the backend)
- Is clickable and navigates to the appropriate route
- The last entry is non-clickable (current location)

### 7.4 Breadcrumb route resolution

```typescript
function breadcrumbToRoute(entry: BreadcrumbEntry, projectId: string): string {
  switch (entry.zoomLevel) {
    case 'L1': return `/projects/${projectId}/org`
    case 'L2': return `/projects/${projectId}/departments/${entry.entityId}`
    case 'L3': return `/projects/${projectId}/workflows/${entry.entityId}`
    default:   return `/projects/${projectId}/org`
  }
}
```

### 7.5 Zoom level badge

The TopBar shows a small badge next to the breadcrumb indicating the current zoom level: `L1`, `L2`, or `L3`. This helps users orient themselves.

---

## 8. Cross-Reference Navigation

### 8.1 Problem

Entities often reference other entities outside the current scope. For example:
- At L2 in Department A, a contract's consumer is Department B
- At L3 in a workflow, a participant role belongs to a different department
- In the inspector, a capability references roles from other departments

Currently, there's no way to follow these references.

### 8.2 Navigation targets

| Reference Type | Source Context | Navigation Target |
|----------------|---------------|-------------------|
| Department reference | Any level | L2 of that department |
| Workflow reference | Any level | L3 of that workflow |
| Role/Capability/etc. reference | Inspector | L2 of the entity's department, then focus on entity |
| Contract reference | Any level | L2 of the provider's department, then focus on contract |

### 8.3 Cross-reference link component

A reusable `EntityLink` component renders inline links to entities:

```typescript
interface EntityLinkProps {
  entityId: string
  nodeType: NodeType
  label: string
  projectId: string
}
```

When clicked:
1. Resolves the target route based on `nodeType` and `entityId`
2. For department/workflow: navigates directly to L2/L3
3. For leaf entities (role, capability, etc.): navigates to the entity's parent department at L2, then sets `focusNodeId` to center the canvas on that entity

### 8.4 Cross-reference in the inspector

The inspector's Relations tab already shows related entities. Each relation entry becomes an `EntityLink`:
- Shows entity name + type badge
- Click navigates to the entity's scope
- Entities in the current scope are highlighted differently from those outside

### 8.5 Cross-reference in the canvas

Nodes at the edge of the current scope that reference entities outside the scope show a **reference badge** (small arrow icon). Clicking the badge navigates to the referenced entity's scope.

This is limited to v1 scope: only visible when an edge's other endpoint is outside the current graph (the edge itself is shown as a "stub" ending at the canvas boundary).

---

## 9. Keyboard Navigation

### 9.1 Keyboard shortcuts

| Shortcut | Context | Action |
|----------|---------|--------|
| `Enter` | Node selected | Drill into node (if drillable) OR open inspector (if not) |
| `Escape` | Any | Go up one level (L3 → L2 → L1). If at L1, deselect all. |
| `Backspace` / `Delete` | Node selected | (Reserved for VIS-008 edge/node deletion) |
| `[` | Any | Collapse selected container node |
| `]` | Any | Expand selected container node |
| `Ctrl+[` / `Cmd+[` | Any | Collapse all container nodes |
| `Ctrl+]` / `Cmd+]` | Any | Expand all container nodes |
| `Tab` | Any | Cycle selection to next node (by render order) |
| `Shift+Tab` | Any | Cycle selection to previous node |
| `Ctrl+Shift+E` | Any | Toggle explorer panel |
| `Ctrl+Shift+I` | Any | Toggle inspector panel |
| `F` | No text input focused | Fit view (reset zoom to show all nodes) |

### 9.2 Implementation

Keyboard shortcuts are handled by a `useCanvasKeyboard` hook registered on the canvas container:

```typescript
function useCanvasKeyboard(options: {
  projectId: string
  onDrillIn: (nodeId: string) => void
  onDrillOut: () => void
}): void
```

The hook:
1. Attaches a `keydown` listener to the canvas container element
2. Checks the currently selected node(s) from the store
3. Dispatches the appropriate action
4. Prevents default browser behavior for handled shortcuts
5. Does NOT capture events when a text input is focused (inspector edit fields, chat input)

### 9.3 Escape navigation chain

`Escape` follows a priority chain:
1. If text input is focused → blur the input (don't navigate)
2. If nodes/edges are selected → clear selection
3. If at L3 → navigate to L2 (owner department, or L1 if no owner)
4. If at L2 → navigate to L1
5. If at L1 → no-op

---

## 10. Navigation History (Store)

### 10.1 Purpose

While browser history handles back/forward navigation via the URL, the store needs a lightweight navigation stack to:
- Determine the "back" target for Escape key (without relying on `window.history`)
- Know which node to focus on when returning to a parent level (the node we drilled into)
- Enable programmatic "navigate back" from components

### 10.2 Navigation stack

```typescript
interface NavigationEntry {
  view: CanvasView
  entityId: string | null
  focusNodeId: string | null  // which node to focus on when returning to this level
}

// New store fields
navigationStack: NavigationEntry[]

// New store methods
pushNavigation(entry: NavigationEntry): void
popNavigation(): NavigationEntry | null
clearNavigationStack(): void
```

### 10.3 Stack behavior

- **Drill-in**: Push current view + the drilled node's ID as `focusNodeId` onto the stack, then navigate.
- **Drill-out (Escape/breadcrumb)**: Pop the stack, navigate to the popped entry's view, and set `focusNodeId` to re-center on where we came from.
- **Direct URL navigation**: Clear the stack (the user jumped to a bookmark or pasted URL; history is unknown).
- **Max depth**: 3 entries (L1 → L2 → L3). Stack never grows beyond the level hierarchy.

### 10.4 Integration with router

The navigation stack does NOT replace the browser history. It supplements it with focus-node context that the URL doesn't carry. When the router navigates (programmatically or via browser back), the route's `useEffect` checks the stack for a `focusNodeId` to restore.

---

## 11. Enhanced VisualNode Component

### 11.1 Drilldown indicator

The `VisualNode` component (used for all 11 node types) gains a conditional drilldown icon:

```typescript
const isDrillable = ['company', 'department', 'workflow'].includes(data.nodeType)
```

If drillable, a small `ChevronRight` or `Maximize2` icon appears in the node's bottom-right corner. On hover, the node shows a subtle scale-up effect (1.02x) to reinforce interactivity.

### 11.2 Collapse indicator

If the node is a container with children currently on the canvas, a collapse/expand toggle appears in the node's top-right corner:
- Collapsed: `ChevronRight` + `+N` badge
- Expanded: `ChevronDown`

### 11.3 Reference badge

If the node has edges to entities outside the current scope (cross-references), a small outbound-arrow badge appears, with a count of external references.

---

## 12. Updated Data Flow

### 12.1 Route mount sequence (enhanced)

```
1. Route mounts with params (projectId, entityId?)
2. Check navigation stack for focusNodeId (returning from drill-in)
3. Set store: view, projectId, breadcrumb=[], transition state
4. Restore persisted view state (layers, filters) from localStorage
5. Fetch graph via useVisualGraph
6. On graph response:
   a. Set breadcrumb from graph.breadcrumb
   b. Apply client-side filters (layers, nodeType, status)
   c. Apply collapse filter (collapsedNodeIds)
   d. Convert to React Flow via graphToFlow
   e. Enrich with validation counts
   f. Sync graphNodes to store for explorer
7. Render CanvasViewport with TransitionWrapper
8. On mount animation complete: fitView with focusNodeId if present
```

### 12.2 Drill-in sequence

```
1. User double-clicks drillable node (or presses Enter)
2. Push current view + clicked node ID to navigation stack
3. Set transition: { direction: 'drill-in', targetId: clickedNode.id }
4. Navigate to new route
5. New route mounts (see 12.1) — TransitionWrapper reads transition state
6. Animated entry
```

### 12.3 Drill-out sequence (Escape)

```
1. Pop navigation stack → get previous entry
2. Set transition: { direction: 'drill-out', targetId: previousEntry.focusNodeId }
3. Navigate to previous route
4. New route mounts — TransitionWrapper reads transition state
5. fitView centers on focusNodeId (the node we had drilled into)
```

---

## 13. Store Changes Summary

### 13.1 New fields

```typescript
// Transition
transitionDirection: 'drill-in' | 'drill-out' | null
transitionTargetId: string | null

// Collapse
collapsedNodeIds: string[]

// Breadcrumb
breadcrumb: BreadcrumbEntry[]

// Navigation history
navigationStack: NavigationEntry[]
```

### 13.2 New methods

```typescript
// Transition
startTransition(direction: 'drill-in' | 'drill-out', targetId: string): void
clearTransition(): void

// Collapse
toggleCollapse(nodeId: string): void
expandAll(): void
collapseAll(): void

// Breadcrumb
setBreadcrumb(entries: BreadcrumbEntry[]): void

// Navigation history
pushNavigation(entry: NavigationEntry): void
popNavigation(): NavigationEntry | null
clearNavigationStack(): void
```

### 13.3 Modified methods

```typescript
// setView: also resets collapsedNodeIds and breadcrumb
setView(view: CanvasView, entityId?: string | null): void
```

---

## 14. Implementation Slices

### Slice VIS-011a: Navigation store + breadcrumb enhancement (edit, ~30 tests)

**Scope:**
- Add navigation stack, breadcrumb, and transition fields to Zustand store
- Refactor `TopBar` to use `breadcrumb` from store instead of building from raw IDs
- Add `breadcrumbToRoute()` helper
- Add zoom level badge to TopBar
- Routes sync `graph.breadcrumb` to store on fetch
- Store tests + TopBar tests + route integration tests

**Files touched:**
- `apps/web/src/stores/visual-workspace-store.ts`
- `apps/web/src/components/visual-shell/top-bar.tsx`
- `apps/web/src/routes/projects/$projectId/org.tsx`
- `apps/web/src/routes/projects/$projectId/departments.$departmentId.tsx`
- `apps/web/src/routes/projects/$projectId/workflows.$workflowId.tsx`

### Slice VIS-011b: Drilldown affordance + keyboard navigation (edit, ~35 tests)

**Scope:**
- Add drilldown indicator to VisualNode component
- Implement `useCanvasKeyboard` hook (Enter to drill in, Escape chain, Tab cycling, F for fit)
- Wire keyboard hook into all three canvas routes
- Push/pop navigation stack on drill-in/out
- Tests for keyboard hook + visual node updates

**Files touched:**
- `apps/web/src/components/visual-shell/nodes/visual-node.tsx`
- `apps/web/src/hooks/use-canvas-keyboard.ts` (new)
- `apps/web/src/routes/projects/$projectId/org.tsx`
- `apps/web/src/routes/projects/$projectId/departments.$departmentId.tsx`
- `apps/web/src/routes/projects/$projectId/workflows.$workflowId.tsx`
- `apps/web/src/components/visual-shell/canvas-viewport.tsx`

### Slice VIS-011c: Transition animations (edit, ~20 tests)

**Scope:**
- Implement `TransitionWrapper` component with CSS transitions
- Wire transition state from store into CanvasViewport
- Drill-in/out animation on route change
- Focus restoration from navigation stack on mount
- Tests for TransitionWrapper + integration with drill-in/out

**Files touched:**
- `apps/web/src/components/visual-shell/transition-wrapper.tsx` (new)
- `apps/web/src/components/visual-shell/canvas-viewport.tsx`
- `apps/web/src/stores/visual-workspace-store.ts`

### Slice VIS-011d: Collapse/expand container nodes (edit, ~30 tests)

**Scope:**
- Add collapse state to store
- Implement `applyCollapse()` pure function
- Add collapse/expand toggle to VisualNode for container nodes
- Wire collapse into route data pipelines (after filterGraph, before graphToFlow)
- Keyboard shortcuts `[` and `]`
- Toolbar buttons for expand/collapse all
- Badge showing hidden child count on collapsed nodes
- Tests for applyCollapse + UI integration

**Files touched:**
- `apps/web/src/lib/collapse-filter.ts` (new)
- `apps/web/src/stores/visual-workspace-store.ts`
- `apps/web/src/components/visual-shell/nodes/visual-node.tsx`
- `apps/web/src/components/visual-shell/canvas-toolbar.tsx`
- `apps/web/src/routes/projects/$projectId/org.tsx`
- `apps/web/src/routes/projects/$projectId/departments.$departmentId.tsx`
- `apps/web/src/routes/projects/$projectId/workflows.$workflowId.tsx`

### Slice VIS-011e: Cross-reference navigation (edit, ~25 tests)

**Scope:**
- Implement `EntityLink` reusable component
- Implement `resolveEntityRoute()` helper (nodeType + entityId → route + focusNodeId)
- Wire EntityLink into inspector Relations tab
- Reference badge on nodes with external connections
- Tests for EntityLink + resolveEntityRoute + inspector integration

**Files touched:**
- `apps/web/src/components/visual-shell/entity-link.tsx` (new)
- `apps/web/src/lib/entity-route-resolver.ts` (new)
- `apps/web/src/components/visual-shell/inspector/relations-tab.tsx`
- `apps/web/src/components/visual-shell/nodes/visual-node.tsx`

---

## 15. Dependency Graph

```
VIS-011a (breadcrumbs + store)
    ↓
VIS-011b (drilldown + keyboard) ← depends on navigation stack from 011a
    ↓
VIS-011c (transitions) ← depends on navigation stack from 011a/b

VIS-011d (collapse/expand) ← independent, can parallel with 011b/c after 011a

VIS-011e (cross-references) ← independent, can parallel with 011b/c/d after 011a
```

**Parallelizable after VIS-011a:**
- VIS-011b + VIS-011d + VIS-011e (all independent)
- VIS-011c depends on VIS-011b (navigation stack wiring)

---

## 16. What This Spec Does NOT Cover

| Deferred to | Topic |
|-------------|-------|
| v2 | Automatic semantic zoom triggered by graphical zoom thresholds |
| v2 | Minimap showing scope context (highlighting current scope in overall map) |
| v2 | Canvas-level search (find node by name → navigate + focus) |
| v2 | Animated node rearrangement on collapse/expand (spring physics) |
| VIS-008 | Edge creation/deletion keyboard shortcuts (Backspace/Delete) |
| VIS-016 | Chat scope auto-switching on navigation |
| Future | Custom keyboard shortcut configuration |
| Future | Touch/gesture navigation (mobile) |
| Future | Undo/redo navigation (Ctrl+Z for navigation, not edits) |

---

## 17. Acceptance Criteria

- [ ] Zoom transitions between L1/L2/L3 have animated drill-in/out effects
- [ ] Breadcrumbs show entity names (not IDs) from backend breadcrumb data
- [ ] Breadcrumb shows zoom level badge (L1/L2/L3)
- [ ] Breadcrumb includes intermediate departments (nested dept hierarchy)
- [ ] Workflow breadcrumb includes owner department
- [ ] Drillable nodes (department, workflow) show visual drilldown indicator
- [ ] Enter key drills into selected drillable node
- [ ] Escape key navigates up one level (with priority chain)
- [ ] Container nodes can be collapsed/expanded to hide/show children
- [ ] Collapsed nodes show child count badge
- [ ] Tab/Shift+Tab cycles node selection
- [ ] Cross-reference links in inspector navigate to the entity's scope
- [ ] Navigation stack preserves focus context for drill-out
- [ ] F key triggers fit view
- [ ] Keyboard shortcuts don't fire when text input is focused
- [ ] All features have 100% test coverage in scope

---

## 18. Open Decisions

| # | Decision | Resolution |
|---|----------|------------|
| 1 | Should graphical zoom thresholds trigger semantic level changes? | **No for v1.** Keep it deliberate (double-click, keyboard, breadcrumb). |
| 2 | Should collapse state persist across sessions? | **No.** Too volatile. Reset on navigation. |
| 3 | Should Escape at L1 navigate to project list? | **No.** At L1, Escape clears selection. Project list navigation uses the breadcrumb. |
| 4 | Should cross-reference navigation open in a new tab? | **No.** Same tab, push to navigation stack. Users can Ctrl+Click for new tab via standard browser behavior. |
| 5 | Should collapse aggregate edge counts? | **Yes, as a badge count.** But don't re-route edges to the container node (too complex for v1). Just show "N hidden connections" text. |

---

## 19. References

- `docs/11-visual-grammar-v1-spec.md` — Visual Grammar v1 (VIS-002)
- `docs/12-graph-projection-v1-spec.md` — Graph Projection v1 (VIS-003)
- `docs/adr/ADR-002-visual-shell-design.md` — Shell design
- `apps/web/src/stores/visual-workspace-store.ts` — Current store
- `apps/web/src/components/visual-shell/top-bar.tsx` — Current breadcrumb
- `apps/web/src/components/visual-shell/canvas-viewport.tsx` — Current canvas
- `apps/web/src/lib/graph-to-flow.ts` — Current layout algorithms
