# ADR-007: Visual Diff by Release

Epic 33 | VIS-015

## Status

Accepted

## Context

TheCrew publishes versioned releases of a company model. Each published release stores a `ReleaseSnapshotDto` — a complete point-in-time copy of every domain entity. The existing `SnapshotDiffer` computes entity-level diffs between two snapshots, and the `ReleaseDiffView` component renders a tabular diff. However, this tabular diff is disconnected from the visual canvas: users must mentally map entity names to their positions in the company structure.

The visual-first pivot (ADR-001) demands that **the diagram is the primary interface**. Comparing two releases should be a visual experience: the user sees the same canvas they normally work with, but nodes and edges are color-coded to show what was added, removed, or modified.

## Decision

### 1. Visual diff as a graph projection variant

The visual diff is not a separate system. It is a **variant of the graph projection pipeline**. Instead of projecting the live snapshot, it projects two stored release snapshots and computes node-by-node, edge-by-edge differences using stable visual IDs.

### 2. New endpoint, not query parameter overload

The diff endpoint is:

```
GET /projects/:projectId/visual-graph/diff?base={releaseId}&compare={releaseId}&level=L1&entityId=...&layers=...
```

This is a distinct sub-resource under `/visual-graph/`, keeping the live projection endpoint clean. It reuses the same scope/layer parameters.

### 3. Diff computed server-side on visual graph, not entity level

The diff operates on **projected visual nodes and edges**, not directly on domain entities. This means:
- The visual ID determines identity (stable across projections)
- Changes to `parentId` (re-parenting) are detected as modifications
- Edge changes are derived from the visual graph, not the entity model
- Scope filtering applies: at L2, only changes within the department are shown

### 4. Union graph with diff annotations

The response is a single graph containing the **union** of both projections: nodes from base-only (removed), compare-only (added), and both (unchanged/modified). Each node and edge carries a `diffStatus` field.

### 5. Read-only overlay

The diff canvas is read-only. Users cannot edit entities through the diff view. They navigate to the standard canvas to make changes.

### 6. Reuse of pure mapping functions

The mapping pipeline (mapNodes, extractEdges, filterByScope, applyValidationOverlay, buildBreadcrumb) is reused unchanged. The diff layer wraps the pipeline, running it twice and comparing outputs.

## Consequences

- The `GraphProjectionService` gains a new `projectDiff()` method that loads two release snapshots and compares their visual projections
- Shared types gain `VisualDiffStatus`, `VisualNodeDiffDto`, `VisualEdgeDiffDto`, `VisualGraphDiffDto`, and `VisualDiffSummary`
- The `ReleaseService` must expose a method to retrieve stored snapshots (or the diff service queries the release repository directly)
- The frontend gains a diff canvas route, custom diff node rendering, and an inspector diff tab
- The existing `SnapshotDiffer` (entity-level) is complementary: it provides field-level before/after data for the inspector, while the visual diff shows structural changes on the canvas

## Alternatives Considered

1. **Client-side diff**: Project two graphs client-side and diff in the browser. Rejected: duplicates projection logic, increases payload size (two full graphs), and the diff algorithm should be deterministic and testable server-side.

2. **Extend existing entity diff with visual IDs**: Add visual IDs to `EntityChange`. Rejected: the entity diff operates at a different granularity (field-level). Edges don't exist as entities at all — they are derived from relationships. The visual diff must operate on the projected graph.

3. **Diff as a layer toggle**: Show diff annotations as a toggle-able layer (like runtime). Rejected for v1: the diff fundamentally changes the data source (two snapshots vs. live), making it a separate mode rather than an additive overlay. A future version could integrate diff as a layer once the infrastructure is proven.
