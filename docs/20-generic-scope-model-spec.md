# Generic Scope Model — Design Specification

> **Task:** CAV-010
> **Epic:** 39 — Romper la rigidez org/department/workflow
> **Mode:** plan
> **Status:** design complete

---

## Problem Statement

The current canvas navigation is hardcoded to three fixed scopes:
- `org` (L1) → company overview
- `department` (L2) → department drilldown
- `workflow` (L3) → workflow detail

This rigidity manifests in **8 coupled locations**:

| Component | File | Hardcoded Constraint |
|-----------|------|---------------------|
| `CanvasView` type | `visual-workspace-store.ts:5` | `'org' \| 'department' \| 'workflow'` |
| `zoomLevelForView()` | `visual-workspace-store.ts:147` | 3-case switch |
| `NavigationEntry.view` | `visual-workspace-store.ts:8` | `CanvasView` type |
| `inferEntityType()` | `graph-projection.service.ts:164` | L2→department, L3→workflow only |
| Controller validation | `graph-projection.controller.ts:18` | Only L2/L3 require entityId |
| `filterByScope()` | `scope-filter.ts:14` | 3 hardcoded filter functions |
| `buildBreadcrumb()` | `breadcrumb-builder.ts:7` | 3 hardcoded cases |
| `graphToFlow()` | `graph-to-flow.ts:373` | 3-case switch for layout |
| `resolveEntityRoute()` | `entity-route-resolver.ts:59` | Hardcoded route paths per type |
| `SCOPE_TYPES` | `entity-route-resolver.ts:28` | `Set(['department', 'workflow'])` |

**Consequence:** Adding a new scope type (e.g., capability map, contract detail, artifact workspace) requires modifying all 8+ files. L4 is defined in types but unreachable. The architecture cannot support the multi-level vision described in the Canvas Editor v2 spec.

---

## Design Goals

1. **Extensible scope system** — Adding a new scope type should require registering it in one place, writing its filter function, and writing its layout function. No switch statements to modify.
2. **Decoupled concerns** — Separate "what entity is the scope root" from "what depth level" from "what content rules apply."
3. **Generic navigation** — The navigation stack, breadcrumbs, and route resolution should work with any registered scope type.
4. **L4 real** — The system must support L4 (e.g., workflow-stage detail) from day one.
5. **Future-proof** — Capability maps, contract internals, artifact workspaces, and custom sub-scopes should be addable without structural changes.
6. **Incremental migration** — Existing routes and components continue working during the transition.

---

## Core Types

### ScopeType

Replaces `CanvasView`. Represents the kind of entity that serves as the scope root.

```typescript
// packages/shared-types/src/index.ts

export type ScopeType =
  | 'company'          // L1: top-level company overview
  | 'department'       // L2: department drilldown
  | 'workflow'         // L3: workflow detail
  | 'workflow-stage'   // L4: stage detail (new)
  // Future scope types (added as entities become scope-capable):
  // | 'capability'     // L2: capability map view
  // | 'contract'       // L3: contract internals
  // | 'artifact'       // L3/L4: artifact workspace
```

### ScopeDescriptor

Replaces `GraphScope`. A complete, self-describing scope reference.

```typescript
// packages/shared-types/src/index.ts

export interface ScopeDescriptor {
  scopeType: ScopeType
  entityId: string | null     // null only for 'company'
  zoomLevel: ZoomLevel        // derived from registry, included for convenience
}
```

**Key difference from `GraphScope`:** The `scopeType` field replaces `entityType` inference. The caller declares what scope they want; the system doesn't guess from the zoom level.

### ScopeDefinition

The registry entry for each scope type. Centralizes all metadata about a scope.

```typescript
// packages/shared-types/src/index.ts

export interface ScopeDefinition {
  scopeType: ScopeType
  rootNodeType: NodeType          // which node type is the scope root
  zoomLevel: ZoomLevel            // which zoom level this scope lives at
  requiresEntityId: boolean       // false only for 'company'
  defaultLayers: LayerId[]        // default visible layers for this scope
  drillableChildScopes: ScopeType[]  // what scope types can be entered from here
  parentScopeTypes: ScopeType[]   // which scopes can contain this one (for breadcrumb chain)
  label: string                   // human-readable label (e.g., "Department", "Workflow")
}
```

### SCOPE_REGISTRY

The single source of truth. A `Record<ScopeType, ScopeDefinition>` in `shared-types`.

```typescript
// packages/shared-types/src/index.ts

export const SCOPE_REGISTRY: Record<ScopeType, ScopeDefinition> = {
  company: {
    scopeType: 'company',
    rootNodeType: 'company',
    zoomLevel: 'L1',
    requiresEntityId: false,
    defaultLayers: ['organization'],
    drillableChildScopes: ['department', 'workflow'],
    parentScopeTypes: [],
    label: 'Organization',
  },
  department: {
    scopeType: 'department',
    rootNodeType: 'department',
    zoomLevel: 'L2',
    requiresEntityId: true,
    defaultLayers: ['organization', 'capabilities'],
    drillableChildScopes: ['department', 'workflow'],
    parentScopeTypes: ['company', 'department'],
    label: 'Department',
  },
  workflow: {
    scopeType: 'workflow',
    rootNodeType: 'workflow',
    zoomLevel: 'L3',
    requiresEntityId: true,
    defaultLayers: ['workflows'],
    drillableChildScopes: ['workflow-stage'],
    parentScopeTypes: ['department', 'company'],
    label: 'Workflow',
  },
  'workflow-stage': {
    scopeType: 'workflow-stage',
    rootNodeType: 'workflow-stage',
    zoomLevel: 'L4',
    requiresEntityId: true,
    defaultLayers: ['workflows'],
    drillableChildScopes: [],
    parentScopeTypes: ['workflow'],
    label: 'Stage',
  },
}
```

### NavigationEntry (updated)

```typescript
// apps/web/src/stores/visual-workspace-store.ts

export interface NavigationEntry {
  scope: ScopeDescriptor          // replaces view: CanvasView
  focusNodeId: string | null
}
```

---

## Component-by-Component Migration

### 1. Shared Types (`packages/shared-types/src/index.ts`)

**Add:**
- `ScopeType` type
- `ScopeDescriptor` interface
- `ScopeDefinition` interface
- `SCOPE_REGISTRY` constant

**Modify:**
- `GraphScope` → deprecated alias to `ScopeDescriptor` (backward compat during migration)

**Keep:**
- `ZoomLevel` — still useful as a derived property
- `BreadcrumbEntry` — unchanged, already generic enough
- `DEFAULT_LAYERS_PER_LEVEL` — replaced by `ScopeDefinition.defaultLayers`, mark deprecated

### 2. Frontend Store (`visual-workspace-store.ts`)

**Replace:**
```typescript
// Before
export type CanvasView = 'org' | 'department' | 'workflow'
export interface NavigationEntry {
  view: CanvasView
  entityId: string | null
  focusNodeId: string | null
}

// After
export interface NavigationEntry {
  scope: ScopeDescriptor
  focusNodeId: string | null
}
```

**Replace `setView()`:**
```typescript
// Before
setView(view: CanvasView, entityId?: string | null): void

// After
setScope(scopeType: ScopeType, entityId?: string | null): void
```

Implementation reads from `SCOPE_REGISTRY[scopeType]` to derive `zoomLevel` and `defaultLayers`, replacing the `zoomLevelForView()` switch.

**State shape changes:**
```typescript
// Before
currentView: CanvasView
zoomLevel: ZoomLevel
scopeEntityId: string | null

// After
currentScope: ScopeDescriptor        // single source of truth
// zoomLevel and scopeEntityId are derived:
//   get zoomLevel() → currentScope.zoomLevel
//   get scopeEntityId() → currentScope.entityId
```

**Delete:**
- `zoomLevelForView()` function
- `CanvasView` type export

### 3. Backend Service (`graph-projection.service.ts`)

**Replace `inferEntityType()`:**
```typescript
// Before
private inferEntityType(level: ZoomLevel): NodeType | null {
  switch (level) { case 'L2': return 'department'; case 'L3': return 'workflow'; default: return null }
}

// After — no inference needed
// The caller provides scopeType directly; the service looks up SCOPE_REGISTRY[scopeType].rootNodeType
```

**New signature for `projectGraph()`:**
```typescript
// Before
async projectGraph(projectId, level, entityId, requestedLayers)

// After
async projectGraph(projectId, scopeType, entityId, requestedLayers)
```

The service resolves `zoomLevel` and `rootNodeType` from `SCOPE_REGISTRY[scopeType]`.

**Backward compatibility:** During migration, support both `level` and `scopeType` params. If `scopeType` is provided, use it. If only `level` is provided, infer `scopeType` from level (the reverse of today's inference — only needed temporarily).

### 4. Backend Controller (`graph-projection.controller.ts`)

**Replace hardcoded validation:**
```typescript
// Before
if ((zoomLevel === 'L2' || zoomLevel === 'L3') && !entityId) { throw ... }

// After
const def = SCOPE_REGISTRY[scopeType]
if (!def) throw new BadRequestException(`Unknown scope type: ${scopeType}`)
if (def.requiresEntityId && !entityId) {
  throw new BadRequestException(`entityId is required for scope type ${scopeType}`)
}
```

**Query param change:**
```
// Before
GET /visual-graph?level=L2&entityId=xxx&layers=...

// After
GET /visual-graph?scope=department&entityId=xxx&layers=...

// Backward compat: accept level= and translate to scope=
```

### 5. Scope Filter (`scope-filter.ts`)

**Replace switch with registry dispatch:**

```typescript
// Before
switch (scope.level) {
  case 'L1': filteredNodes = filterL1(nodes, activeLayers); break
  case 'L2': filteredNodes = filterL2(nodes, scope.entityId!, activeLayers, snapshot); break
  case 'L3': filteredNodes = filterL3(nodes, scope.entityId!, activeLayers, snapshot); break
  default: filteredNodes = nodes
}

// After
type ScopeFilterFn = (
  nodes: VisualNodeDto[],
  edges: VisualEdgeDto[],
  entityId: string | null,
  activeLayers: LayerId[],
  snapshot: ReleaseSnapshotDto,
) => FilterResult

const SCOPE_FILTERS: Record<ScopeType, ScopeFilterFn> = {
  company: filterCompanyScope,
  department: filterDepartmentScope,
  workflow: filterWorkflowScope,
  'workflow-stage': filterWorkflowStageScope,
}

export function filterByScope(
  nodes: VisualNodeDto[],
  edges: VisualEdgeDto[],
  scope: ScopeDescriptor,
  activeLayers: LayerId[],
  snapshot: ReleaseSnapshotDto,
): FilterResult {
  const filterFn = SCOPE_FILTERS[scope.scopeType]
  if (!filterFn) return { nodes, edges }
  return filterFn(nodes, edges, scope.entityId, activeLayers, snapshot)
}
```

The individual filter functions (`filterCompanyScope`, `filterDepartmentScope`, etc.) contain the **same business logic** as today's `filterL1`, `filterL2`, `filterL3` — they're renamed and given a consistent signature, not rewritten.

**New filter for L4:**
```typescript
function filterWorkflowStageScope(
  nodes, edges, entityId, activeLayers, snapshot,
): FilterResult {
  // Show: the stage itself, its artifacts (future), its handoff partners
  // Implementation deferred until workflow-stage has richer data
  const stageNode = nodes.find(n => n.entityId === entityId && n.nodeType === 'workflow-stage')
  if (!stageNode) return { nodes: [], edges: [] }

  // For now: stage + directly connected nodes
  const stageEdges = edges.filter(e => e.sourceNodeId === stageNode.id || e.targetNodeId === stageNode.id)
  const connectedIds = new Set([stageNode.id, ...stageEdges.flatMap(e => [e.sourceNodeId, e.targetNodeId])])
  return {
    nodes: nodes.filter(n => connectedIds.has(n.id)),
    edges: stageEdges,
  }
}
```

### 6. Breadcrumb Builder (`breadcrumb-builder.ts`)

**Replace hardcoded cases with generic chain walker:**

```typescript
export function buildBreadcrumb(
  scope: ScopeDescriptor,
  snapshot: ReleaseSnapshotDto,
  projectId: string,
): BreadcrumbEntry[] {
  const crumbs: BreadcrumbEntry[] = []

  // Always start with company (L1 root)
  const companyLabel = snapshot.companyModel?.purpose ?? 'Company'
  crumbs.push({
    label: companyLabel,
    nodeType: 'company',
    entityId: projectId,
    zoomLevel: 'L1',
  })

  if (scope.scopeType === 'company') return crumbs

  // Walk up from scope entity to company using the entity's parent chain
  const chain = buildAncestorChain(scope, snapshot)
  crumbs.push(...chain)

  return crumbs
}
```

**`buildAncestorChain()` logic:**

Each scope type knows how to find its parent:
- `department` → `parentDepartmentId` (recursive) → company
- `workflow` → `ownerDepartmentId` → department chain → company
- `workflow-stage` → parent workflow → `ownerDepartmentId` → department chain → company

This is implemented as a small resolver per scope type:

```typescript
const PARENT_RESOLVERS: Record<ScopeType, (entityId: string, snapshot: ReleaseSnapshotDto) => BreadcrumbEntry[]> = {
  company: () => [],
  department: (entityId, snapshot) => buildDeptChain(entityId, snapshot),  // existing function
  workflow: (entityId, snapshot) => {
    const wf = snapshot.workflows.find(w => w.id === entityId)
    const chain: BreadcrumbEntry[] = []
    if (wf?.ownerDepartmentId) chain.push(...buildDeptChain(wf.ownerDepartmentId, snapshot))
    if (wf) chain.push({ label: wf.name, nodeType: 'workflow', entityId: wf.id, zoomLevel: 'L3' })
    return chain
  },
  'workflow-stage': (entityId, snapshot) => {
    const stage = snapshot.workflows.flatMap(w => (w.stages ?? []).map(s => ({ ...s, workflowId: w.id })))
      .find(s => s.id === entityId)
    if (!stage) return []
    // Resolve parent workflow first, then append stage
    const parentChain = PARENT_RESOLVERS.workflow(stage.workflowId, snapshot)
    return [...parentChain, { label: stage.name, nodeType: 'workflow-stage', entityId, zoomLevel: 'L4' }]
  },
}
```

### 7. Frontend Layout (`graph-to-flow.ts`)

**Replace switch with registry dispatch:**

```typescript
// Before
export function graphToFlow(graph: VisualGraphDto): FlowGraph {
  switch (graph.zoomLevel) {
    case 'L2': return layoutDepartmentGraph(graph)
    case 'L3': return layoutWorkflowGraph(graph)
    default:   return layoutOrgGraph(graph)
  }
}

// After
type LayoutFn = (graph: VisualGraphDto) => FlowGraph

const SCOPE_LAYOUTS: Record<ScopeType, LayoutFn> = {
  company: layoutOrgGraph,
  department: layoutDepartmentGraph,
  workflow: layoutWorkflowGraph,
  'workflow-stage': layoutWorkflowStageGraph,  // new
}

export function graphToFlow(graph: VisualGraphDto): FlowGraph {
  const scopeType = graph.scopeType ?? inferScopeTypeFromLevel(graph.zoomLevel)
  const layoutFn = SCOPE_LAYOUTS[scopeType] ?? layoutOrgGraph
  return layoutFn(graph)
}
```

This requires `VisualGraphDto` to carry `scopeType` (added to the response).

### 8. Entity Route Resolver (`entity-route-resolver.ts`)

**Replace hardcoded route map with registry-driven resolution:**

```typescript
// Route patterns per scope type
const SCOPE_ROUTE_PATTERNS: Record<ScopeType, string> = {
  company: '/projects/:projectId/org',
  department: '/projects/:projectId/departments/:entityId',
  workflow: '/projects/:projectId/workflows/:entityId',
  'workflow-stage': '/projects/:projectId/workflows/:parentId/stages/:entityId',
}

// Replace SCOPE_TYPES Set:
export function isScopeType(nodeType: NodeType): boolean {
  return Object.values(SCOPE_REGISTRY).some(def => def.rootNodeType === nodeType)
}
```

### 9. Frontend Routes

**Existing routes stay** but become thin wrappers:

```typescript
// org.tsx
const scope: ScopeDescriptor = { scopeType: 'company', entityId: null, zoomLevel: 'L1' }
setScope('company')
useVisualGraph(projectId, 'company')

// departments.$departmentId.tsx
const scope: ScopeDescriptor = { scopeType: 'department', entityId: departmentId, zoomLevel: 'L2' }
setScope('department', departmentId)
useVisualGraph(projectId, 'department', departmentId)

// workflows.$workflowId.tsx
const scope: ScopeDescriptor = { scopeType: 'workflow', entityId: workflowId, zoomLevel: 'L3' }
setScope('workflow', workflowId)
useVisualGraph(projectId, 'workflow', workflowId)
```

**New route for L4:**
```
/projects/$projectId/workflows/$workflowId/stages/$stageId
```

**Future generic route (optional):**
```
/projects/$projectId/scope/$scopeType/$entityId
```

This catch-all route would be used for scope types that don't have dedicated routes (e.g., artifact workspace, capability map). Dedicated routes remain for established scopes (org, department, workflow) because they have cleaner URLs and are already bookmarked/shared.

### 10. useVisualGraph Hook

**Updated signature:**

```typescript
// Before
useVisualGraph(projectId: string, level: ZoomLevel, entityId?: string)

// After
useVisualGraph(projectId: string, scopeType: ScopeType, entityId?: string)
```

The hook translates `scopeType` to the API query param `scope=department` instead of `level=L2`.

### 11. VisualGraphDto (Response)

**Add `scopeType` field:**

```typescript
export interface VisualGraphDto {
  nodes: VisualNodeDto[]
  edges: VisualEdgeDto[]
  breadcrumb: BreadcrumbEntry[]
  zoomLevel: ZoomLevel
  scopeType: ScopeType     // NEW — tells the frontend which scope this graph represents
  scope: GraphScope         // DEPRECATED — kept for backward compat
}
```

---

## Drilldown Resolution

Today, drill-in/drill-out is hardcoded per route:
- org.tsx: if `department` → navigate to `/departments/:id`
- dept.tsx: if `department` → `/departments/:id`, if `workflow` → `/workflows/:id`

**Generic drilldown resolution:**

```typescript
// Pure function, usable in any route
export function resolveDrillTarget(
  nodeType: NodeType,
  entityId: string,
  projectId: string,
): { route: string; scopeType: ScopeType } | null {
  const scopeDef = Object.values(SCOPE_REGISTRY).find(
    def => def.rootNodeType === nodeType
  )
  if (!scopeDef) return null  // not a drillable type

  const routePattern = SCOPE_ROUTE_PATTERNS[scopeDef.scopeType]
  const route = routePattern
    .replace(':projectId', projectId)
    .replace(':entityId', entityId)

  return { route, scopeType: scopeDef.scopeType }
}
```

**Generic drill-out:** Pop the navigation stack and navigate to `entry.scope`'s route. No type-specific logic needed.

---

## What This Does NOT Change

1. **Individual filter logic** — Each scope type still has its own filter function with specific business logic. The generic model provides the dispatch mechanism, not the filtering algorithm.
2. **Layout algorithms** — Each scope type keeps its own layout function. The generic model provides dispatch.
3. **Inspector** — Not affected. Inspector reads node/edge data regardless of scope.
4. **Connection validator** — Not affected. Connection rules are independent of scope.
5. **Visual grammar** — NodeType, EdgeType, LayerId remain unchanged.
6. **Diff system** — Diff canvas already uses its own rendering. It gains `scopeType` in the response but the diff logic is unchanged.

---

## API Contract Change

### Before
```
GET /projects/:projectId/visual-graph?level=L2&entityId=xxx&layers=organization,capabilities
```

### After
```
GET /projects/:projectId/visual-graph?scope=department&entityId=xxx&layers=organization,capabilities
```

### Backward compatibility
During migration, the API accepts both `level=` and `scope=`. If `scope` is present, it takes precedence. If only `level` is present, it's translated:
- `L1` → `company`
- `L2` → `department`
- `L3` → `workflow`

This allows gradual frontend migration without breaking the API.

---

## L4 Scope: Workflow Stage Detail

The first new scope enabled by this model. Demonstrates the extensibility.

**What L4 shows:**
- The stage node itself (centered)
- Directly connected nodes (participants, handoff partners)
- Stage-specific artifacts (future)
- Governing policies (if any)

**Filter:** Connected-subgraph approach (stage + 1-hop neighbors).

**Layout:** Simple radial or force-directed from the stage center.

**Breadcrumb:** Company → [Dept chain] → Workflow → Stage

**Drill-in:** From workflow canvas, double-click on a stage node.

**Drill-out:** Back to parent workflow.

---

## Implementation Slices for CAV-011

CAV-011 ("Implementar navegación multinivel genérica, L4 real y breadcrumbs/historial profundos") should be split into these sub-slices:

### CAV-011a: Shared Types + Scope Registry (~30 tests)
**Scope:** `packages/shared-types/src/index.ts`
- Add `ScopeType`, `ScopeDescriptor`, `ScopeDefinition`
- Add `SCOPE_REGISTRY` constant
- Add `scopeType` to `VisualGraphDto`
- Deprecate `GraphScope` (alias to `ScopeDescriptor`)
- Add helper functions: `getScopeDefinition(scopeType)`, `isDrillableScopeType(nodeType)`, `getZoomLevelForScope(scopeType)`

### CAV-011b: Backend Scope-Driven Projection (~40 tests)
**Scope:** `services/company-design/src/graph-projection/`
- Replace `inferEntityType()` with `SCOPE_REGISTRY` lookup in service
- Controller accepts `scope=` param (backward compat with `level=`)
- `filterByScope()` uses `ScopeFilterFn` dispatch map
- Rename filterL1/L2/L3 → filterCompanyScope/filterDepartmentScope/filterWorkflowScope
- Add `filterWorkflowStageScope` (L4)
- `buildBreadcrumb()` uses `PARENT_RESOLVERS` dispatch map
- Service populates `scopeType` in response DTO

### CAV-011c: Frontend Store + Navigation (~25 tests)
**Scope:** `apps/web/src/stores/visual-workspace-store.ts`
- Replace `CanvasView` with `ScopeType`
- Replace `setView()` with `setScope()`
- Replace `NavigationEntry.view` with `NavigationEntry.scope`
- `currentScope: ScopeDescriptor` replaces `currentView + zoomLevel + scopeEntityId`
- Derived accessors for backward compat during transition

### CAV-011d: Frontend Routes + Hook + Layout (~30 tests)
**Scope:** Routes, `useVisualGraph`, `graph-to-flow.ts`, `entity-route-resolver.ts`
- `useVisualGraph(projectId, scopeType, entityId)` sends `scope=` param
- `graphToFlow()` dispatches on `scopeType` instead of `zoomLevel`
- Routes call `setScope()` instead of `setView()`
- `resolveEntityRoute()` uses `SCOPE_REGISTRY`
- `isScopeType()` uses `SCOPE_REGISTRY`

### CAV-011e: L4 Route + Drill-in/out (~20 tests)
**Scope:** New route + existing routes
- New route: `workflows.$workflowId.stages.$stageId.tsx`
- Workflow route: drill-in on stage nodes
- L4 route: drill-out back to workflow
- Generic `resolveDrillTarget()` function
- Breadcrumb renders full chain (Company → Dept → Workflow → Stage)

**Estimated total: ~145 tests across 5 slices.**

---

## Migration Strategy

1. **Phase 1 (CAV-011):** Introduce `ScopeType` and `SCOPE_REGISTRY` alongside existing types. Backend accepts both `level=` and `scope=`. Frontend migrates to `setScope()`. L4 added.
2. **Phase 2 (organic):** Future scope types (capability, contract, artifact) are added by registering in `SCOPE_REGISTRY`, writing a filter function, and writing a layout function. No structural changes needed.
3. **Phase 3 (cleanup):** Remove deprecated `GraphScope`, `CanvasView`, `DEFAULT_LAYERS_PER_LEVEL`, and `level=` API param support.

---

## Acceptance Criteria (Checklist D in `docs/19`)

After CAV-011 implementation:
- [x] The user can enter and exit multiple levels stably
- [x] Breadcrumbs represent the real scope path
- [x] Returning to a parent scope restores focus
- [x] The system supports scopes beyond org/department/workflow (L4: workflow-stage)
- [x] Adding a new scope type requires: 1 registry entry + 1 filter function + 1 layout function + 1 route

---

## Decision Log

| Decision | Rationale |
|----------|-----------|
| Keep `ZoomLevel` as derived, not primary | ZoomLevel is useful for API responses and breadcrumbs, but `ScopeType` is the primary identifier. |
| Keep dedicated routes for org/dept/workflow | Clean URLs, existing bookmarks, established patterns. Generic catch-all route reserved for future scope types. |
| Filter functions remain per-scope-type | Business logic for what's visible at each scope is inherently specific. The generic model provides dispatch, not algorithm. |
| Backward-compat API during migration | Avoids big-bang migration. Gateway BFF doesn't need immediate changes. |
| L4 = workflow-stage first | Simplest new scope to implement. Proves the model works. |
| `ScopeDescriptor` includes `zoomLevel` | Convenience — avoids constant lookups. Derived from registry on construction. |
