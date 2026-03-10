# Visual Diff by Release v1 — Formal Specification

Epic 33 | VIS-015 | Plan deliverable

## 1. Purpose

This document designs how two published releases are compared **on the visual canvas**. Users currently compare releases via a tabular entity diff (Epic 13.4). This spec extends that capability to the visual-first paradigm: showing added, removed, and modified nodes and edges directly on the canvas, with full scope filtering, layer control, and inspector integration.

The visual diff reuses the graph projection pipeline (VIS-003) and the layer/filter infrastructure (VIS-013). It introduces no new domain entities — only a new projection variant and frontend rendering mode.

---

## 2. Design Principles

1. **Same canvas, different data source.** The diff canvas renders the same node types, edge types, and layouts as the standard canvas. The only difference is color-coded annotations.
2. **Server-side diff.** The diff is computed server-side on projected visual graphs, not on raw entities. This ensures consistency and testability.
3. **Union graph.** The result is a single graph containing nodes/edges from both releases: added (compare-only), removed (base-only), modified (both, changed properties), and unchanged (both, identical).
4. **Scope-aware.** Diff respects the same scope filtering as live projection: L1 shows company-level structural changes, L2 shows department-scoped changes, L3 shows workflow-scoped changes.
5. **Read-only.** The diff canvas does not support editing. It is a comparison tool.
6. **Complementary to entity diff.** The existing tabular `ReleaseDiffView` shows field-level before/after. The visual diff shows structural changes. The inspector bridges both: selecting a diff node shows its field-level changes.

---

## 3. Architecture Overview

```
                    ┌─────────────────────────────────────────────────┐
                    │          company-design-service                  │
                    │                                                 │
GET /visual-graph/  │  ┌──────────────┐     ┌──────────────────────┐  │
  diff?base=&       │  │   GraphProj  │     │  ReleaseRepository   │  │
  compare=          │  │  Controller  │────►│  (fetch snapshots)   │  │
  ───────────────►  │  └──────┬───────┘     └──────────────────────┘  │
                    │         │                                       │
                    │         ▼                                       │
                    │  ┌──────────────┐                               │
                    │  │ GraphProj    │                               │
                    │  │  Service     │                               │
                    │  │ .projectDiff │                               │
                    │  └──────┬───────┘                               │
                    │         │                                       │
                    │         ▼                                       │
                    │  ┌──────────────────────────────────────────┐   │
                    │  │  1. Project base snapshot → GraphA       │   │
                    │  │  2. Project compare snapshot → GraphB    │   │
                    │  │  3. Diff nodes by visual ID              │   │
                    │  │  4. Diff edges by visual ID              │   │
                    │  │  5. Build union graph + summary          │   │
                    │  └──────────────────────────────────────────┘   │
                    └─────────────────────────────────────────────────┘
```

### 3.1 Pipeline reuse

The `projectDiff()` method calls the existing pure mapping functions twice (once per snapshot) with identical scope/layer parameters. The diff logic is a new pure function operating on two `VisualGraphDto` outputs.

```
projectDiff(projectId, baseReleaseId, compareReleaseId, level, entityId, layers):
  1. baseRelease = ReleaseRepository.findById(baseReleaseId)
  2. compareRelease = ReleaseRepository.findById(compareReleaseId)
  3. validate both are published
  4. baseGraph = projectFromSnapshot(baseRelease.snapshot, projectId, level, entityId, layers)
  5. compareGraph = projectFromSnapshot(compareRelease.snapshot, projectId, level, entityId, layers)
  6. diff = diffVisualGraphs(baseGraph, compareGraph, baseReleaseId, compareReleaseId)
  7. return diff
```

Step 4/5 uses a new internal `projectFromSnapshot()` that runs `mapNodes → extractEdges → filterByScope` on a stored snapshot (without validation overlay — validation is per-release, not cross-release).

---

## 4. REST Endpoint

### 4.1 Get visual diff between releases

```
GET /projects/:projectId/visual-graph/diff
```

**Query parameters:**

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `base` | `string` | Yes | — | Base release ID (the "before") |
| `compare` | `string` | Yes | — | Compare release ID (the "after") |
| `level` | `L1` \| `L2` \| `L3` | No | `L1` | Zoom level for scope filtering |
| `entityId` | `string` | If L2/L3 | — | Department or workflow ID to scope the diff |
| `layers` | `string` (comma-separated) | No | Level defaults | Active layer IDs |

**Response:** `VisualGraphDiffDto` (200 OK)

**Errors:**
- `400` if `base` or `compare` is missing
- `400` if either release is not published
- `400` if `level=L2` or `L3` without `entityId`
- `404` if either release is not found

**Examples:**

```
# Company-level diff between v1.0 and v2.0
GET /projects/p1/visual-graph/diff?base=rel-001&compare=rel-002

# Department-scoped diff
GET /projects/p1/visual-graph/diff?base=rel-001&compare=rel-002&level=L2&entityId=dept-abc

# Workflow-scoped diff with contracts layer
GET /projects/p1/visual-graph/diff?base=rel-001&compare=rel-002&level=L3&entityId=wf-xyz&layers=workflows,contracts
```

---

## 5. Shared Types

### 5.1 New types for `packages/shared-types`

```typescript
// --- Visual Diff Types ---

export type VisualDiffStatus = 'added' | 'removed' | 'modified' | 'unchanged'

export interface VisualNodeDiffDto extends VisualNodeDto {
  diffStatus: VisualDiffStatus
  /** Field-level changes when diffStatus is 'modified'. Keys: changed field names, values: { before, after }. */
  changes?: Record<string, { before: unknown; after: unknown }>
}

export interface VisualEdgeDiffDto extends VisualEdgeDto {
  diffStatus: VisualDiffStatus
}

export interface VisualDiffSummary {
  nodesAdded: number
  nodesRemoved: number
  nodesModified: number
  nodesUnchanged: number
  edgesAdded: number
  edgesRemoved: number
  edgesModified: number
  edgesUnchanged: number
}

export interface VisualGraphDiffDto {
  projectId: string
  scope: GraphScope
  zoomLevel: ZoomLevel
  baseReleaseId: string
  compareReleaseId: string
  nodes: VisualNodeDiffDto[]
  edges: VisualEdgeDiffDto[]
  activeLayers: LayerId[]
  breadcrumb: BreadcrumbEntry[]
  summary: VisualDiffSummary
}
```

### 5.2 Changes field rationale

The `changes` field on `VisualNodeDiffDto` provides the inspector with field-level detail without requiring a second API call. For a modified node, `changes` contains only the visual fields that differ:

```typescript
// Example: a department's mandate changed
{
  id: 'dept:abc',
  nodeType: 'department',
  label: 'Marketing',
  sublabel: 'Drive market growth',  // compare value
  diffStatus: 'modified',
  changes: {
    sublabel: { before: 'Grow market share', after: 'Drive market growth' },
    parentId: { before: 'company:p1', after: 'dept:xyz' },  // re-parented
  }
}
```

This captures changes to the visual representation. For full domain-level field diffs (e.g., every field on `DepartmentDto`), the existing entity diff endpoint remains available.

---

## 6. Diff Algorithm

### 6.1 Pure diff function signature

```typescript
function diffVisualGraphs(
  baseGraph: VisualGraphDto,
  compareGraph: VisualGraphDto,
  baseReleaseId: string,
  compareReleaseId: string,
): VisualGraphDiffDto
```

### 6.2 Node diff rules

Build maps by visual ID for both graphs.

| Condition | diffStatus | Included from |
|-----------|-----------|---------------|
| Node in compare, not in base | `added` | compare |
| Node in base, not in compare | `removed` | base |
| Node in both, visual properties differ | `modified` | compare (with `changes`) |
| Node in both, visual properties identical | `unchanged` | compare |

**Compared visual properties for nodes:**
- `label`
- `sublabel`
- `parentId`
- `layerIds`
- `nodeType` (should never change for same visual ID, but checked for safety)

**Not compared:** `position` (layout is ephemeral), `collapsed` (UI state), `status` (validation-specific).

### 6.3 Edge diff rules

| Condition | diffStatus | Included from |
|-----------|-----------|---------------|
| Edge in compare, not in base | `added` | compare |
| Edge in base, not in compare | `removed` | base |
| Edge in both, properties differ | `modified` | compare |
| Edge in both, properties identical | `unchanged` | compare |

**Compared visual properties for edges:**
- `label`
- `sourceId`
- `targetId`
- `edgeType`
- `style`

**Note:** Edge visual IDs are deterministic (`{edgeType}:{sourceId}→{targetId}`), so an edge between the same pair with the same type is always matched. If a role changes its `capabilityIds`, old `contributes_to` edges disappear (removed) and new ones appear (added).

### 6.4 Handling removed entities at scoped levels

At L2 (department scope), if a department existed in the base release but was deleted in the compare release, the diff endpoint returns `404` only if the scoped entity itself is gone. For entities within the scope that were removed, they appear as `removed` nodes/edges in the union graph.

**Special case:** If `entityId` exists in the base but not in the compare, the diff is still valid — it shows everything as `removed`. The breadcrumb uses the base release's data for the missing entity.

### 6.5 Validation overlay in diff mode

Validation is **not applied** to the diff graph. The diff compares structural snapshots, not current validation state. Each snapshot's validation was applied at publish time and is part of the release record — not re-computed during diff.

---

## 7. Backend Implementation

### 7.1 New method on GraphProjectionService

```typescript
class GraphProjectionService {
  // Existing
  async projectGraph(projectId, level, entityId, requestedLayers): Promise<VisualGraphDto>

  // New
  async projectDiff(
    projectId: string,
    baseReleaseId: string,
    compareReleaseId: string,
    level: ZoomLevel = 'L1',
    entityId: string | null = null,
    requestedLayers: LayerId[] | null = null,
  ): Promise<VisualGraphDiffDto>
}
```

### 7.2 Internal projectFromSnapshot

A new private method that runs the mapping pipeline on a stored snapshot:

```typescript
private projectFromSnapshot(
  snapshot: ReleaseSnapshotDto,
  projectId: string,
  level: ZoomLevel,
  entityId: string | null,
  activeLayers: LayerId[],
): { nodes: VisualNodeDto[]; edges: VisualEdgeDto[]; breadcrumb: BreadcrumbEntry[] }
```

Steps:
1. `allNodes = mapNodes(snapshot, projectId)`
2. `allEdges = extractEdges(snapshot, projectId)`
3. `scope = { level, entityId, entityType: inferType(level) }`
4. `{ nodes, edges } = filterByScope(allNodes, allEdges, scope, activeLayers, snapshot)`
5. Final orphan edge cleanup
6. `breadcrumb = buildBreadcrumb(scope, snapshot, projectId)`

Note: no `SnapshotCollector.collect()` call (uses stored snapshot), no `ValidationEngine.validate()` (diff is structural, not validation-aware).

### 7.3 Dependencies

`GraphProjectionService` needs access to `ReleaseRepository` to fetch stored snapshots. It should be injected via the existing `RELEASE_REPOSITORY` token.

```typescript
@Injectable()
export class GraphProjectionService {
  constructor(
    private readonly snapshotCollector: SnapshotCollector,
    private readonly validationEngine: ValidationEngine,
    @Inject(RELEASE_REPOSITORY) private readonly releaseRepo: ReleaseRepository,
  ) {}
}
```

### 7.4 Pure diff function

File: `services/company-design/src/graph-projection/mapping/visual-diff.ts`

```typescript
export function diffVisualGraphs(
  baseGraph: { nodes: VisualNodeDto[]; edges: VisualEdgeDto[] },
  compareGraph: { nodes: VisualNodeDto[]; edges: VisualEdgeDto[] },
  baseReleaseId: string,
  compareReleaseId: string,
  scope: GraphScope,
  zoomLevel: ZoomLevel,
  activeLayers: LayerId[],
  breadcrumb: BreadcrumbEntry[],
  projectId: string,
): VisualGraphDiffDto
```

This is a **pure function** in the mapping layer, consistent with the architecture of existing mapping functions. Fully testable with no DI.

### 7.5 Module changes

`GraphProjectionModule` must import `ReleasesModule` to access the `ReleaseRepository`. If `ReleasesModule` already exports it (it exports `SnapshotCollector`), the repository must be added to exports. Alternatively, `GraphProjectionModule` can directly provide the repository injection.

### 7.6 Controller extension

```typescript
@Controller('projects/:projectId/visual-graph')
export class GraphProjectionController {
  // Existing
  @Get()
  async getVisualGraph(...): Promise<VisualGraphDto>

  // New
  @Get('diff')
  async getVisualDiff(
    @Param('projectId') projectId: string,
    @Query('base') baseReleaseId: string,
    @Query('compare') compareReleaseId: string,
    @Query('level') level?: string,
    @Query('entityId') entityId?: string,
    @Query('layers') layers?: string,
  ): Promise<VisualGraphDiffDto>
}
```

---

## 8. Gateway BFF Extension

### 8.1 CompanyDesignClient

```typescript
async getVisualGraphDiff(
  projectId: string,
  baseReleaseId: string,
  compareReleaseId: string,
  level?: string,
  entityId?: string,
  layers?: string,
): Promise<VisualGraphDiffDto>
```

### 8.2 VisualGraphController (gateway)

```typescript
@Get('projects/:projectId/visual-graph/diff')
async getVisualDiff(
  @Param('projectId') projectId: string,
  @Query('base') baseReleaseId: string,
  @Query('compare') compareReleaseId: string,
  @Query('level') level?: string,
  @Query('entityId') entityId?: string,
  @Query('layers') layers?: string,
): Promise<VisualGraphDiffDto>
```

---

## 9. Frontend — API & Hook

### 9.1 API client

File: `apps/web/src/api/visual-graph.ts` (extend existing)

```typescript
export const visualGraphApi = {
  // Existing
  getVisualGraph({ projectId, level, entityId, layers }): Promise<VisualGraphDto>,

  // New
  getVisualDiff({
    projectId,
    baseReleaseId,
    compareReleaseId,
    level,
    entityId,
    layers,
  }: {
    projectId: string
    baseReleaseId: string
    compareReleaseId: string
    level?: ZoomLevel
    entityId?: string
    layers?: LayerId[]
  }): Promise<VisualGraphDiffDto>,
}
```

### 9.2 Hook

File: `apps/web/src/hooks/use-visual-diff.ts`

```typescript
export function useVisualDiff(
  projectId: string,
  baseReleaseId: string | null,
  compareReleaseId: string | null,
  level?: ZoomLevel,
  entityId?: string,
  layers?: LayerId[],
) {
  return useQuery({
    queryKey: ['visual-diff', projectId, baseReleaseId, compareReleaseId, level, entityId, layers],
    queryFn: () => visualGraphApi.getVisualDiff({
      projectId,
      baseReleaseId: baseReleaseId!,
      compareReleaseId: compareReleaseId!,
      level,
      entityId,
      layers,
    }),
    enabled: !!baseReleaseId && !!compareReleaseId,
  })
}
```

---

## 10. Frontend — Diff Canvas

### 10.1 Route

```
/projects/$projectId/diff?base={releaseId}&compare={releaseId}
```

This is a dedicated route, not a mode toggle on the standard canvas. Rationale:
- The data source is fundamentally different (two stored snapshots vs. live)
- The canvas is read-only
- The URL is shareable and bookmarkable
- Scope navigation (L1→L2→L3) is supported via nested routes or query params

### 10.2 Entry points

Users can enter the diff canvas from:

1. **Releases admin page**: "Compare" button next to a release, or a "Compare Releases" section with two dropdowns + "View Diff" button.
2. **Release detail view**: "Compare with..." action linking to diff route.
3. **Canvas toolbar**: (future) A "Compare with release" action when viewing the live canvas.

### 10.3 Diff release selector

At the top of the diff canvas (below the TopBar breadcrumb), a **DiffSelector** bar shows:

```
┌─────────────────────────────────────────────────────────────┐
│  Base: [v1.0 ▾]    →    Compare: [v2.0 ▾]     [Swap ⇄]   │
│  Summary: +3 nodes, -1 node, ~5 modified, +2 edges, -1 edge│
└─────────────────────────────────────────────────────────────┘
```

- Two dropdowns listing published releases (sorted by version/date)
- Swap button to reverse base↔compare
- Summary line with counts
- The selector updates the route query params on change

### 10.4 Diff legend

A small legend in the canvas toolbar (or floating panel):

```
┌─────────────────────────┐
│ ● Added    (green)      │
│ ● Removed  (red)        │
│ ● Modified (amber)      │
│ ○ Unchanged (dimmed)    │
└─────────────────────────┘
```

### 10.5 Diff filter toggle

The canvas toolbar gains a **diff filter** toggle group:

| Toggle | Effect |
|--------|--------|
| Show All | Display all nodes (default) |
| Changes Only | Hide unchanged nodes/edges; show only added/removed/modified |
| Added Only | Show only added nodes |
| Removed Only | Show only removed nodes |
| Modified Only | Show only modified nodes |

These are client-side filters on the diff response — no re-fetch needed.

---

## 11. Frontend — Node & Edge Rendering

### 11.1 Diff node styles

Each `VisualNodeDiffDto` is rendered using the same `VisualNode` component but with a diff-status CSS overlay:

| diffStatus | Border | Background | Opacity | Badge |
|-----------|--------|------------|---------|-------|
| `added` | 2px solid green-500 | green-50 | 1.0 | "+" icon |
| `removed` | 2px dashed red-500 | red-50 | 0.7 | "−" icon |
| `modified` | 2px solid amber-500 | amber-50 | 1.0 | "~" icon |
| `unchanged` | 1px solid gray-200 | white | 0.5 | none |

For removed nodes, a dashed border + reduced opacity communicates "ghost" status — these nodes no longer exist in the compare release but are shown for context.

### 11.2 Diff edge styles

| diffStatus | Color | Stroke | Opacity | Label |
|-----------|-------|--------|---------|-------|
| `added` | green-500 | match edgeType style | 1.0 | "+ {edgeType}" |
| `removed` | red-500 | dashed override | 0.5 | "− {edgeType}" |
| `modified` | amber-500 | match edgeType style | 1.0 | "~ {edgeType}" |
| `unchanged` | gray-300 | match edgeType style | 0.3 | none |

### 11.3 Layout strategy

The diff graph uses the **compare** release's structure for layout:
- Added nodes are positioned by the standard layout algorithm (they only exist in compare)
- Removed nodes are positioned where they would have been in the base layout. Since the base graph has potentially different parentId relationships, a two-pass approach is used:
  1. Layout the compare graph normally
  2. Insert removed nodes near their former parent (if the parent exists in both, place near it; if the parent was also removed, place in a "removed entities" cluster)
- Modified nodes use the compare position (their current state)

This ensures the canvas primarily reflects the "after" state with removed items shown as ghosts.

### 11.4 graph-to-flow conversion

File: `apps/web/src/lib/graph-to-flow.ts` (extend existing)

A new function:

```typescript
export function layoutDiffGraph(diff: VisualGraphDiffDto): {
  nodes: Node[]
  edges: Edge[]
}
```

This converts `VisualNodeDiffDto[]` and `VisualEdgeDiffDto[]` to React Flow nodes/edges, applying the diff-specific styles (border colors, opacity, badges) as `data` properties on the Flow nodes.

---

## 12. Frontend — Explorer in Diff Mode

### 12.1 Entity tree with diff badges

The explorer's EntityTree component shows graph nodes grouped by type. In diff mode, each node entry shows a diff badge:

```
▼ Departments (2 added, 1 removed, 3 modified)
  ● Marketing     [modified ~]
  ● Engineering    [unchanged]
  ● Sales          [added +]
  ● HR             [added +]
  ● Finance        [removed −]
  ● Operations     [modified ~]
```

- Badge colors match diff status colors
- Click-to-focus works the same as in live canvas
- Filter panel still works (layer/nodeType/status filters)

### 12.2 Diff summary tab

A new tab in the explorer (or a section at the top of the entity tree) showing the `VisualDiffSummary`:

```
┌─────────────────────────────┐
│ Diff Summary                │
│                             │
│ Nodes                       │
│   +3 added   −1 removed    │
│   ~5 modified  12 unchanged│
│                             │
│ Edges                       │
│   +2 added   −1 removed    │
│   ~3 modified  18 unchanged│
└─────────────────────────────┘
```

---

## 13. Frontend — Inspector in Diff Mode

### 13.1 Node diff details

When a diff node is selected, the inspector shows:

**Overview tab:** Same as standard inspector, but with a diff status badge and the release versions.

**Changes tab (new, diff-only):** Shows field-level changes from the `changes` field:

```
┌─────────────────────────────────────┐
│ Changes (v1.0 → v2.0)              │
│                                     │
│ sublabel                            │
│   Before: "Grow market share"       │
│   After:  "Drive market growth"     │
│                                     │
│ parentId                            │
│   Before: company:p1                │
│   After:  dept:xyz (Engineering)    │
│                                     │
│ [View full entity diff →]           │
└─────────────────────────────────────┘
```

The "View full entity diff" link navigates to the existing `ReleaseDiffView` (tabular diff) filtered to the selected entity.

**For `added` nodes:** The Changes tab shows "New entity — all fields are additions" with the full property list.

**For `removed` nodes:** The Changes tab shows "Deleted entity — all fields were removed" with the last-known property list.

### 13.2 Edge diff details

Selecting a diff edge shows:
- Edge type and direction
- Source and target nodes (with their diff statuses)
- If `added`: "New relationship"
- If `removed`: "Deleted relationship"
- If `modified`: Changed properties (e.g., label changed)

### 13.3 No selection (canvas summary)

When nothing is selected, the inspector shows the `VisualDiffSummary` plus a release comparison header:

```
Comparing: v1.0 → v2.0
Published: 2026-01-15 → 2026-03-01

+3 nodes added, −1 removed, ~5 modified
+2 edges added, −1 removed, ~3 modified
```

---

## 14. Frontend — Zustand Store Extension

### 14.1 Diff state

The visual workspace store gains diff-related state:

```typescript
interface VisualWorkspaceState {
  // ... existing fields ...

  // Diff mode
  isDiffMode: boolean
  baseReleaseId: string | null
  compareReleaseId: string | null
  diffFilter: VisualDiffStatus[] | null   // null = show all

  // Actions
  enterDiffMode(baseReleaseId: string, compareReleaseId: string): void
  exitDiffMode(): void
  setDiffFilter(statuses: VisualDiffStatus[] | null): void
  swapDiffReleases(): void
}
```

### 14.2 Interaction with existing state

- `activeLayers`, `nodeTypeFilter`, `statusFilter` work the same in diff mode
- `selectedNodeIds`, `selectedEdgeIds` work the same
- `focusNodeId` works the same
- `showValidationOverlay` is disabled in diff mode (validation is not computed for stored snapshots)

---

## 15. Scope Navigation in Diff Mode

### 15.1 Drilldown

Double-clicking a department node in the L1 diff canvas navigates to:

```
/projects/$projectId/diff?base={baseId}&compare={compareId}&level=L2&entityId={deptId}
```

Similarly for workflow drilldown to L3.

### 15.2 Breadcrumb

The breadcrumb shows the standard path plus a diff indicator:

```
Company (v1.0 → v2.0) > Marketing > Onboarding Workflow
```

Each breadcrumb entry navigates to the corresponding scope within the diff.

### 15.3 Handling removed entities at drilldown

If the user drills into a department that exists in both releases, the diff shows changes within that department. If the department was removed (exists only in base), the diff shows all its contents as `removed`. If the department was added (exists only in compare), all contents are `added`.

---

## 16. View Persistence in Diff Mode

The existing view persistence (VIS-013) extends to diff mode with a separate storage key:

```
the-crew:view:{projectId}:diff:{baseReleaseId}:{compareReleaseId}:{scope}
```

This stores `activeLayers`, `nodeTypeFilter`, `statusFilter`, and `diffFilter` so users can close and re-open a diff comparison with their preferred filters intact.

---

## 17. Implementation Plan

### Phase 1: Shared types
1. Add `VisualDiffStatus`, `VisualNodeDiffDto`, `VisualEdgeDiffDto`, `VisualDiffSummary`, `VisualGraphDiffDto` to `packages/shared-types/src/index.ts`
2. Run typecheck

### Phase 2: Pure diff function + tests
3. Implement `visual-diff.ts` — pure function in `graph-projection/mapping/`
4. Unit tests (~30 tests: added/removed/modified/unchanged nodes, edges, scope scenarios, summary computation, changes field population)

### Phase 3: Service + controller
5. Add `ReleaseRepository` injection to `GraphProjectionService`
6. Implement `projectFromSnapshot()` private method
7. Implement `projectDiff()` public method
8. Add `@Get('diff')` endpoint to `GraphProjectionController`
9. Update `GraphProjectionModule` imports for release repository access
10. Service tests (~15 tests: happy path, missing releases, unpublished, scope params)
11. Controller tests (~8 tests: validation, query params, error cases)

### Phase 4: Gateway BFF
12. Add `getVisualGraphDiff()` to `CompanyDesignClient`
13. Add diff route to `VisualGraphController` in gateway
14. Tests (~5 tests)

### Phase 5: Frontend API + hook
15. Add `getVisualDiff()` to `visualGraphApi`
16. Implement `useVisualDiff` hook
17. Tests (~8 tests: API, hook, enabled/disabled)

### Phase 6: Frontend diff canvas
18. Implement `layoutDiffGraph()` in `graph-to-flow.ts`
19. Implement diff node rendering (CSS overlay on `VisualNode`)
20. Implement diff edge rendering
21. Implement `DiffSelector` bar component
22. Implement diff route `/projects/$projectId/diff`
23. Wire scope navigation (drilldown, breadcrumb)
24. Tests (~25 tests: layout, node rendering, selector, routing)

### Phase 7: Explorer + Inspector + Store
25. Extend EntityTree for diff badges
26. Implement diff summary section in explorer
27. Implement Changes tab in inspector
28. Extend Zustand store with diff state
29. Wire diff filter toggles in canvas toolbar
30. View persistence for diff mode
31. Tests (~20 tests: explorer, inspector, store, filter, persistence)

### Estimated: 7 phases, ~111 tests, 5-7 implementation tasks

---

## 18. Suggested Implementation Task Breakdown

| Task ID | Scope | Mode | Tests |
|---------|-------|------|-------|
| VIS-015a | Shared types + pure diff function + tests | edit | ~30 |
| VIS-015b | Service + controller + module wiring + tests | edit | ~23 |
| VIS-015c | Gateway BFF proxy + tests | edit | ~5 |
| VIS-015d | Frontend API + hook + tests | edit | ~8 |
| VIS-015e | Diff canvas route + DiffSelector + layout + node/edge rendering + tests | edit | ~25 |
| VIS-015f | Explorer diff badges + inspector Changes tab + store + filters + persistence + tests | edit | ~20 |

Tasks a-d are backend-first and can be parallelized in pairs (a+d, b+c). Tasks e-f are frontend and sequential (e before f).

---

## 19. What This Spec Does NOT Cover

| Deferred to | Topic |
|-------------|-------|
| Future | Animated transition between base→compare (morphing layout) |
| Future | Three-way diff (base, compare, current live) |
| Future | Diff between a draft release and last published |
| Future | Diff notifications / change digest per stakeholder |
| Future | Side-by-side canvas view (base left, compare right) |
| Future | Diff export (PNG, PDF, or structured report) |
| Future | Position persistence in diff mode |

---

## 20. Open Decisions

| # | Decision | Resolution |
|---|----------|------------|
| 1 | Should unchanged nodes be shown by default? | **Yes.** They provide structural context. The "Changes Only" filter hides them for focused review. |
| 2 | Should the diff canvas be a mode of the standard canvas or a separate route? | **Separate route.** The data source is fundamentally different (stored snapshots vs. live). A separate route is clearer and URL-shareable. |
| 3 | Should validation overlay work in diff mode? | **No.** Each snapshot's validation was computed at publish time. Re-computing against current rules would be misleading. |
| 4 | How to handle entities that moved between departments? | A node whose `parentId` changed is `modified` with `changes: { parentId: { before, after } }`. The layout places it in its compare-release position. |
| 5 | Should the `changes` field include all entity DTO fields or only visual fields? | **Visual fields only** (`label`, `sublabel`, `parentId`, `layerIds`). For full entity diffs, use the existing entity-level diff endpoint. |
| 6 | Should removed nodes be interactive? | **Yes**, selectable but read-only. The inspector shows "Deleted entity" with last-known properties. |
| 7 | Where should `visual-diff.ts` live? | In `graph-projection/mapping/` alongside other pure functions. |

---

## 21. Acceptance Criteria

- [ ] ADR-007 documents the visual diff architecture decision
- [ ] `VisualGraphDiffDto` and related types are specified
- [ ] Diff algorithm is defined: node diff rules, edge diff rules, changes field
- [ ] REST endpoint contract is defined with all query parameters
- [ ] Server-side architecture reuses graph projection pipeline
- [ ] Gateway BFF extension is specified
- [ ] Frontend route, entry points, and DiffSelector are designed
- [ ] Node/edge diff rendering styles are specified (colors, opacity, badges)
- [ ] Explorer diff badges and summary are designed
- [ ] Inspector Changes tab for diff mode is designed
- [ ] Zustand store extensions for diff state are specified
- [ ] Scope navigation (drilldown, breadcrumb) in diff mode is designed
- [ ] View persistence extends to diff mode
- [ ] Implementation plan with phases and task breakdown exists
- [ ] No new domain entities or mutations introduced (read-only projection)

---

## 22. References

- `docs/12-graph-projection-v1-spec.md` — Graph Projection v1 (VIS-003), §10 Visual Diff Strategy
- `docs/11-visual-grammar-v1-spec.md` — Visual Grammar v1 (VIS-002)
- `docs/adr/ADR-001-visual-first-pivot.md` — Pivot decision
- `docs/adr/ADR-003-graph-projection-architecture.md` — Graph projection architecture
- `docs/adr/ADR-007-visual-diff-by-release.md` — Architecture decision (this task)
- `services/company-design/src/releases/application/snapshot-differ.ts` — Entity-level differ
- `services/company-design/src/graph-projection/` — Existing graph projection module
- `apps/web/src/components/releases/release-diff-view.tsx` — Existing tabular diff component
