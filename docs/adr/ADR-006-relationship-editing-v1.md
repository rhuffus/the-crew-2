# ADR-006: Relationship Editing v1

**Status:** Accepted
**Date:** 2026-03-09
**Epic:** 25 | **Task:** VIS-008

## Context

TheCrew has a visual canvas where nodes represent domain entities and edges represent relationships between them. Currently, edges are:
- **Read-only** — derived from domain entity fields by the graph projection backend.
- **Not interactive** — the canvas has no `onConnect` handler and no edge creation/deletion UI.
- **Statically defined** — `CONNECTION_RULES` in shared-types catalog the 12 valid edge types but are unused at runtime.

The visual-first pivot requires users to **create, edit, and delete relationships directly on the canvas**, making the diagram an editing tool rather than just a visualization.

## Decision

### 1. Edges are domain mutations, not visual-only operations

Creating or deleting an edge on the canvas translates to a **domain API call** that modifies the entity owning the relationship field. There is no separate "edge storage" — edges remain derived from domain data via graph projection.

This preserves the principle: *"The diagram edits the real model."*

### 2. Use existing domain APIs for all mutations

Each edge type maps to a specific entity PATCH endpoint. No new "relationship" or "edge" endpoint is introduced. The frontend resolves which API to call based on the edge type.

| Edge Type | Mutated Entity | Field Modified |
|-----------|---------------|---------------|
| `reports_to` | Department | `parentId` |
| `owns` (dept→cap) | Capability | `ownerDepartmentId` |
| `owns` (dept→wf) | Workflow | `ownerDepartmentId` |
| `assigned_to` | AgentArchetype | `roleId` |
| `contributes_to` | Role | `capabilityIds[]` (add/remove) |
| `has_skill` | AgentArchetype | `skillIds[]` (add/remove) |
| `compatible_with` | Skill | `compatibleRoleIds[]` (add/remove) |
| `provides` | Contract | `providerId` + `providerType` |
| `consumes` | Contract | `consumerId` + `consumerType` |
| `bound_by` | Workflow | `contractIds[]` (add/remove) |
| `participates_in` | Workflow | `participants[]` (add/remove ValueObject) |
| `hands_off_to` | — | Not user-editable (derived from stage order) |
| `governs` | Policy | `departmentId` / `scope` |

### 3. Connection validation happens client-side using CONNECTION_RULES

When a user starts dragging a connection, the canvas checks `CONNECTION_RULES` to determine valid targets. Invalid targets are dimmed/disabled. This prevents impossible relationships before any API call.

### 4. Ambiguity resolution via picker dialog

Some source→target pairs match multiple edge types (e.g., `department→workflow` can be `owns` or `participates_in`). When this happens, a picker dialog asks the user to choose the intended relationship type.

### 5. `hands_off_to` edges are not user-creatable

Stage sequence edges are derived automatically from `stages[].order`. Users reorder stages, not hand-off edges. This avoids contradictions between stage order and hand-off graph.

### 6. Optimistic canvas update + graph refresh

1. User creates/deletes an edge on canvas.
2. Canvas shows optimistic visual feedback.
3. Frontend calls the domain API.
4. On success: invalidate graph query → full projection refresh.
5. On failure: rollback optimistic update, show error toast.

No incremental graph updates (WebSocket/SSE) in v1. Full graph refresh is acceptable for current data sizes.

### 7. Edge deletion with impact awareness

Before deleting an edge, the UI shows:
- The relationship being removed.
- Which entity field will be modified.
- A confirm/cancel dialog (no silent deletes).

### 8. Inspector gains edit capabilities

The edge inspector adds:
- **Delete button** for the selected edge.
- **Metadata editing** for edges with properties (e.g., `participates_in` responsibility label).
- Navigation links to source/target entities remain.

## Consequences

### Positive
- Canvas becomes a real editing tool, not just a viewer.
- No new domain concepts or storage — edges remain projections of entity fields.
- CONNECTION_RULES serve double duty: graph projection validation and canvas interaction validation.
- Existing domain tests continue to cover mutation logic.

### Negative
- Some edge types require multi-step UX (ambiguity picker, metadata form).
- Full graph refresh after each mutation may feel slow with large models (acceptable in v1, optimize later).
- `provides`/`consumes` edges require changing contract provider/consumer, which may break existing relationships.

### Risks
- Array field mutations (add/remove from `capabilityIds[]`) need careful handling to avoid race conditions with concurrent edits. Mitigated: single-user v1, no concurrent editing.
- Edge deletion can leave entities in invalid states (e.g., removing the only `provides` edge from a contract). Validation overlay will flag these immediately.

## Alternatives Considered

### A. New "Relationship" aggregate and endpoint
Rejected. Would duplicate domain logic and introduce a parallel source of truth.

### B. Client-side edge storage with periodic sync
Rejected. Violates "diagram edits the real model" principle. Stale state risk.

### C. Make all edges editable including `hands_off_to`
Rejected. Stage order is the source of truth for hand-offs. Allowing direct hand-off edge editing would create contradictions.
