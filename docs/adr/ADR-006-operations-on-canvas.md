# ADR-006: Operations on Canvas

## Estado
Aceptada

## Fecha
2026-03-09

## Contexto

TheCrew's canvas currently represents the **design-time** model of a company: organizational structure, capabilities, workflows, contracts, and governance. This is the "blueprint" of the company.

Epic 35 introduces **operations/runtime** — showing what is actually happening in the company at execution time. This includes workflow runs, operational incidents, and task queues. The fundamental question is: **how should runtime state appear on the visual canvas?**

### Options considered

1. **Separate Operations Dashboard**: A traditional dashboard view with tables, charts, and metrics. Completely independent from the canvas.
2. **Hybrid: Dashboard + Canvas Overlay**: A separate dashboard as the primary operations view, with optional annotations on the design-time canvas.
3. **Canvas-native Overlay**: Operations appear as a toggle-able layer on the existing canvas, consistent with the layer system.

## Decisión

**Option 3: Canvas-native overlay.**

Runtime state is rendered as a **runtime layer** on the existing canvas, following the same layer architecture as organization, capabilities, workflows, contracts, and governance.

### Key design decisions

1. **Runtime is a layer, not a view.** Users toggle the `runtime` layer on/off like any other layer. When off, the canvas shows only the design-time model. When on, runs, incidents, and progress indicators appear overlaid on the design-time graph.

2. **Two new node types, not more.** Only `run` and `incident` become canvas nodes. Tasks are too granular for the canvas — they appear as badge counts and inspector detail. This prevents canvas clutter.

3. **Four new edge types.** `executes` (run→workflow), `at_stage` (run→current stage), `caused_by` (incident→run), `affects` (incident→any entity). These are strictly runtime edges, visible only when the runtime layer is active.

4. **Progressive density by zoom level.** L1 shows only aggregate badges (run counts, incident counts on departments). L2 adds badges on workflows and agents. L3 shows full run detail with stage progress. This matches the semantic zoom principle.

5. **Operations entities live in a new module within company-design-service.** For v1, they share the same service to avoid premature infrastructure. They can be extracted to a separate service when runtime complexity justifies it.

6. **Runtime does not affect releases/snapshots.** Releases capture the design-time model. Runtime state is ephemeral and not versioned. A run references a workflow by ID but is not included in the release snapshot.

7. **Polling v1, real-time later.** V1 uses standard REST polling (same as all existing data). WebSocket/SSE for live run updates is explicitly deferred.

## Consecuencias

### Positivas

- **Unified experience.** Users see both "what the company is" and "what the company is doing" on the same canvas. No context-switching to a separate dashboard.
- **Consistent architecture.** The layer system extends naturally. No new rendering paradigm needed.
- **Progressive disclosure.** Badge counts at high zoom → full detail at low zoom. Users aren't overwhelmed.
- **Reuses existing graph projection.** Runtime nodes/edges flow through the same pipeline with an optional extension step.

### Negativas / Trade-offs

- **Canvas complexity increases.** More node types, more edge types, more visual states. Careful design needed to prevent clutter.
- **Performance consideration.** Active runs change frequently. The projection must be efficient when runtime layer is active (lazy loading, pagination of runs).
- **Temporal dimension is new.** Design-time is (mostly) static. Runtime changes per-second. This introduces UI refresh concerns.

### Riesgos mitigados

- **Canvas clutter**: Tasks are NOT canvas nodes (badges only). Runtime is off by default. Progressive density by zoom level.
- **Domain pollution**: Operations entities are in a separate module with their own aggregates/repositories. Design-time entities are untouched.
- **Performance**: Runtime data is only queried when the runtime layer is explicitly active. Badge data is pre-aggregated.

## Alternativas descartadas

### Option 1: Separate Operations Dashboard
- **Pro:** Simple, familiar UX. No canvas changes.
- **Con:** Defeats the visual-first principle. Forces context-switching. Doesn't leverage the spatial model (can't see which *department's* workflow is failing).

### Option 2: Hybrid Dashboard + Canvas Annotations
- **Pro:** Best of both worlds potentially.
- **Con:** Two UIs to maintain. Annotations are second-class. Users won't know where to look.

## Referencias
- `docs/14-operations-canvas-v1-spec.md` — Full specification
- `docs/11-visual-grammar-v1-spec.md` — Visual Grammar v1 (mentions runtime as future layer)
- `docs/03-backlog-completo.md` — Epic 35 definition
