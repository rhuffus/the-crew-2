# ADR-003: Graph Projection Architecture

## Estado
Aceptada

## Fecha
2026-03-09

## Contexto

VIS-002 formalized the visual grammar: 11 node types, 12 edge types, connection rules, semantic zoom levels, layers, and inspector contracts. Now the system needs a backend component that transforms the existing domain entities (collected via `SnapshotCollector`) into the `VisualGraphDto` that the canvas will consume.

The key architectural question is: **where does the graph projection live and how does it work?**

### Options considered

1. **Frontend-side projection**: The web app fetches all CRUD entities and assembles the graph client-side.
2. **New microservice** (`workspace-projection-service`): A dedicated service that subscribes to domain events and maintains a materialized visual graph.
3. **New module in company-design-service**: A `GraphProjectionModule` that reuses `SnapshotCollector` and produces `VisualGraphDto` on demand.

### Analysis

| Criterion | Frontend | New Service | Module in company-design |
|-----------|----------|-------------|------------------------|
| Complexity | Low backend, high frontend | High (new infra, events, eventual consistency) | Low (reuses existing infra) |
| Consistency | Always fresh (fetches all) | Eventual (event lag) | Always fresh (reads repos) |
| Performance (small models) | Acceptable | Over-engineered | Fast |
| Performance (large models) | Bad (N+1, large payloads) | Good (materialized) | Good (single collect + transform) |
| Testability | Hard (logic in UI) | Good | Excellent (pure functions) |
| CLAUDE.md compliance | Violates rule 4 ("no hacer que la web reconstruya el grafo") | OK | OK |

## Decision

**Option 3: New `GraphProjectionModule` inside `company-design-service`.**

### Rationale

1. **Reuses SnapshotCollector** which already collects all 10 entity types in parallel via `Promise.all()`. No new infrastructure needed.
2. **Pure mapping functions** transform `ReleaseSnapshotDto` → `VisualGraphDto`. Easy to test, no side effects.
3. **Complies with CLAUDE.md rule 4**: the backend serves a pre-composed graph DTO; the frontend does not reassemble it from CRUD endpoints.
4. **Extractable later**: if performance requires it, the module can be extracted to its own service without changing the API contract.
5. **ValidationEngine integration**: validation issues are merged into node status in the same process, avoiding an extra round trip.

### What the module does NOT do

- It does not store visual state (positions, collapsed state). V1 returns `position: null` for all nodes; the client applies auto-layout.
- It does not manage user-specific view state (active layers, saved views). That is client-side state (Zustand store per ADR-002).
- It does not subscribe to events or maintain a cache. Each request re-collects and re-transforms. This is acceptable because the snapshot collection is already optimized with parallel reads.

## Consequences

### Positive
- Zero new infrastructure. The module is a pure addition to the existing service.
- The SnapshotCollector is battle-tested (used by releases and validation).
- The mapping logic is purely functional and 100% unit-testable.
- The API contract (`VisualGraphDto`) is the same whether projected server-side or from a future materialized service.

### Negative / Trade-offs
- Every graph request re-collects all entities. For very large models (thousands of entities), this may become slow. Mitigation: scope-based partial collection in a future optimization pass.
- No push-based updates. The client must poll or refetch. Mitigation: TanStack Query with `staleTime` and refetch-on-focus is already the pattern in the web app.

### Future extraction criteria
Extract to a dedicated service if:
- Graph projection latency exceeds 500ms for typical models (100–500 entities).
- Multiple consumers (other than the web app) need the visual graph.
- Push-based updates (WebSocket/SSE) are required for real-time collaboration.

## References
- ADR-001: Visual-First Pivot
- ADR-002: Visual Shell Design
- `docs/11-visual-grammar-v1-spec.md` — Visual Grammar v1 (VIS-002)
- `docs/12-graph-projection-v1-spec.md` — Graph Projection Spec (this task's companion)
