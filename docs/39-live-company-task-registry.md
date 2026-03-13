# Task Registry — Live Company Pivot

## Leyenda
- status: todo | in-progress | done | blocked
- mode: plan | edit
- fresh-session: yes | no

| task-id | epic | status | mode | fresh-session | parallel-group | depends-on | objetivo |
|---|---:|---|---|---|---|---|---|
| LCP-001 | 50 | done | plan | yes | A | - | Adoptar formalmente el pivot Live Company: sincronizar README, CLAUDE, backlog y task registry con la nueva dirección. |
| LCP-002 | 50 | done | plan | yes | A | LCP-001 | Completar ADR y análisis preserve/adapt/deprecate con mapeo explícito old→new. |
| LCP-003 | 51 | done | plan | yes | B | LCP-001 | Definir lenguaje de producto y UI para sustituir el modelo mental de layers por organización + trabajo + overlays. |
| LCP-004 | 52 | done | plan | yes | B | LCP-002 | Diseñar el nuevo dominio base: project seed, constitution, UO, coordinator/specialist agents, objective/event/external source, proposal, decision, runtime execution. |
| LCP-005 | 53 | done | plan | yes | C | LCP-003, LCP-004 | Redactar el canvas v3 implementation plan: toolbar, nodos, enlaces, overlays, drilldown y panel derecho. |
| LCP-006 | 54 | done | plan | yes | C | LCP-004 | Diseñar el flujo CEO-first bootstrap para proyectos nuevos. |
| LCP-007 | 55 | done | plan | yes | D | LCP-004, LCP-006 | Diseñar Organizational Growth Engine y approval model. |
| LCP-008 | 56 | done | plan | yes | D | LCP-004, LCP-005 | Diseñar runtime/live mode implementation plan y modelo de observabilidad. |
| LCP-009 | 57 | done | plan | yes | E | LCP-004, LCP-006, LCP-008 | Replantear Verticaler como empresa viva de referencia y actualizar su spec. |
| LCP-010 | 51 | done | edit | yes | F | LCP-003 | Aplicar primeros cambios documentales y de labels no invasivos sobre la UX/documentación existente. |
| LCP-011 | 52 | done | edit | yes | F | LCP-004 | Introducir tipos/documentación puente old→new sin romper el runtime actual. |
| LCP-012 | 53 | done | edit | yes | G | LCP-005 | Primer refactor del canvas hacia la vista base centrada en UO + agentes. |
| LCP-013 | 54 | done | edit | yes | G | LCP-006 | Implementar bootstrap seed + CEO-only project creation path. |
| LCP-014 | 55 | done | edit | yes | H | LCP-007 | Implementar proposals y reglas básicas de crecimiento organizativo. |
| LCP-015 | 56 | done | edit | yes | H | LCP-008 | Implementar live mode básico: timeline, activity y runtime state overlay. |
| LCP-016 | 57 | done | edit | yes | I | LCP-009, LCP-013, LCP-015 | Convertir Verticaler en demo viva del nuevo paradigma. |
| LCP-017 | 58 | done | edit | yes | J | LCP-016 | Proxy bootstrap, proposals y growth-engine a través del API Gateway. |
| LCP-018 | 58 | done | edit | yes | J | LCP-016 | Crear controllers REST para UOs y agents en backend + proxy en API Gateway. |
| LCP-019 | 58 | done | edit | yes | K | LCP-017, LCP-018 | Crear API clients y TanStack hooks frontend para todas las entidades Live Company. |
| LCP-020 | 58 | done | edit | yes | K | LCP-017, LCP-018 | Extender graph projection (SnapshotCollector + node-mapper + edge-extractor) para mapear UOs, agents y proposals al canvas. |
| LCP-021 | 58 | done | edit | yes | L | LCP-019 | Reemplazar CreateProjectDialog con wizard CEO-first bootstrap + fase de madurez en TopBar. |
| LCP-022 | 58 | done | edit | yes | L | LCP-020 | Actualizar layout engine + drilldown para team (L3) y agent-detail (L4). |
| LCP-023 | 58 | done | edit | yes | M | LCP-019 | Crear ProposalsStore + panel Proposals en Explorer con acciones approve/reject. |
| LCP-024 | 58 | done | edit | yes | M | LCP-019, LCP-021 | Transformar ChatDock en interfaz de conversación CEO con proposal cards interactivas. |
| LCP-025 | 58 | done | edit | yes | N | LCP-019, LCP-023 | Dashboard de salud organizacional + paneles de detalle en Inspector para UO, Agent y Proposal. |
| LCP-026 | 58 | done | edit | yes | N | LCP-020, LCP-022 | Actualizar EntityTree y overlays del Explorer para jerarquía UO+agents y filtrado por nuevos tipos. |
| LCP-027 | 58 | done | edit | yes | O | LCP-021..LCP-026 | Tests E2E del flujo completo Live Company + actualización del task registry y backlog. Post-crash integrity audit: fixed 9 failing tests, 1 component bug, 2 domain bugs, 2 localStorage crashes, doc numbering conflicts. |

## Documentos entregables

| Tarea | Documento |
|---|---|
| LCP-001 | Sincronización de README, CLAUDE.md, backlog y task registry. Marcas SUPERSEDED en docs/03 y docs/09. Nota de transición en docs/25. |
| LCP-002 | `docs/41-live-company-adr-preserve-adapt-deprecate.md` |
| LCP-003 | `docs/42-live-company-product-language-spec.md` |
| LCP-004 | `docs/33-live-company-domain-model.md` (rewritten as implementable spec with concrete TypeScript types, value objects, domain events, invariants, module structure, DTOs, relationship taxonomy, migration notes, and bootstrap sequence) |
| LCP-005 | `docs/43-canvas-v3-implementation-plan.md` (full implementation plan: 16 node types, 20 edge types, 5 overlays, 5 edge categories, 4 scope types, toolbar/inspector/explorer redesign, connection rules, layout algorithms, backend mapping changes, migration sequence) |
| LCP-006 | `docs/45-live-company-ceo-first-bootstrap-spec.md` |
| LCP-007 | `docs/44-live-company-growth-engine-spec.md` (full growth engine design: growth signals, proposal evaluation pipeline, approval routing with phase overrides, delegation model, implementation patterns for all 10 proposal types, context minimization, budget enforcement, org health checks, phase transition engine, API endpoints, constitution extensions) |
| LCP-008 | `docs/46-live-company-runtime-implementation-plan.md` (full runtime/live mode plan: RuntimeExecution aggregate, RuntimeEvent entity with 27 event types, SSE architecture, NestJS EventEmitter2 event bus, NodeRuntimeStatus projection with priority escalation, canvas badge integration, cost tracking model with budget enforcement, Design↔Live mode behavioral spec, RuntimeStatusStore, timeline panel, inspector Runtime tab, 7-phase implementation sequence for LCP-015) |
| LCP-009 | `docs/25-verticaler-reference-company-spec.md` (full v2 rewrite as Live Company reference: CEO-first bootstrap narrative with 5 department proposals, growth story through 4 phase transitions seed→formation→structured→operating, 27 agents across 8 UOs, 4 workflows with enriched stages/handoffs/SLAs/metrics, 7 contracts with new party model, 5 policies with expanded scope, 12 anchored artifacts, 3 event triggers, 3 external sources, 4 proposals + 3 decisions, runtime demo data with executions/events/cost/badges, all 20 edge types with concrete examples, 5 overlay views, L1-L4 navigation, inspector tab coverage, migration strategy via CeoFirstBootstrapService) |
| LCP-010 | Overlay model in shared-types (`OverlayDefinition`, `OVERLAY_DEFINITIONS`, mapping helpers, `DEFAULT_OVERLAYS_PER_LEVEL`). UI: `overlays-panel.tsx` replaces layers-panel, toolbar shows "Overlays:" label, store gains `toggleOverlay`/`setActiveOverlays`. Organization overlay locked as always-on. |
| LCP-011 | `packages/shared-types/src/live-company-types.ts` (all new LCP union types + DTOs), deprecation markers on old types in `index.ts`, `ReleaseSnapshotDto` extended with optional new entity fields, 129 tests passing |
| LCP-012 | Canvas v3 type system refactor: NodeType (12→21), EdgeType (14→31), EdgeCategory (8→12), ScopeType (4→6), NodeCategory system, EDGE_CATEGORY_STYLES, CONNECTION_RULES_V3, native overlay state in store (`activeOverlays` + `designMode`), overlay-aware filtering helpers, v3 scope navigation (team/agent-detail), all frontend Record<> maps updated, backend legacy bridge (LEGACY_ZOOM_TO_SCOPE), 2859 tests passing. |
| LCP-013 | 4 new domain modules (`project-seed/`, `constitution/`, `organizational-units/`, `lcp-agents/`) with aggregates, repos, mappers, NestJS modules. `CeoFirstBootstrapService` + `BootstrapController` (POST/GET bootstrap endpoints). `bootstrap-defaults.ts` constants. Old bootstrap renamed to `LegacyBootstrapService`/`LegacyBootstrapModule`. 155 new tests passing, 41 legacy tests still passing. |
| LCP-014 | 2 new domain modules (`proposals/`, `growth-engine/`). `Proposal` aggregate with full lifecycle (draft→proposed→under-review→approved→rejected→implemented→superseded). Growth engine: `evaluateProposal` domain service with 10 validation rules (phase guard, depth/fanout limits, expansion rules, duplicate check, justification, budget). `computeApprovalRoute` with phase overrides (all-founder in seed, structural-founder in formation, constitution-rules from structured). `validateBudget` with threshold alerts. `buildHealthReport` with depth/fanout/pending metrics. `PHASE_CAPABILITIES` const and `PHASE_GUARDS` for all 10 proposal types. REST controller (submit/list/get/approve/reject/health/phase-capabilities). Growth DTOs in shared-types. 72 new tests, 1105 total in company-design. |
| LCP-015 | Full live mode stack: `RuntimeExecution` aggregate + `RuntimeEvent` entity in `runtime/domain/`. In-memory repos. `RuntimeService` with execution lifecycle, event emission, SSE stream via EventEmitter2, status projection with priority escalation, cost tracking. `RuntimeController` with REST + SSE endpoints. API Gateway proxy (`RuntimeProxyController`). Frontend: `runtime-api.ts` client, `RuntimeStatusStore` (Zustand + EventSource SSE), `RuntimeBadges` component, `TimelinePanel` in Explorer, `RuntimeTab` in Inspector. Canvas toolbar Live mode toggle. Design↔Live behavioral enforcement in explorer tabs and inspector. Runtime DTOs in shared-types (29 event types, 6 badge types, execution lifecycle, cost summary). 51 new backend tests (domain + service + projector), 10 new frontend component tests, 6 store tests. 3015 total tests passing. |
| LCP-016 | `VerticalerDemoSeeder` replaces legacy Verticaler seed with CEO-first bootstrap path. `verticaler-demo-data.ts` defines 12 UOs (1 company + 5 departments + 6 teams), 27 agents (1 CEO + 11 coordinators + 15 specialists), 26 proposals (5 create-department + 6 create-team + 15 create-specialist, all pre-approved showing full governance flow). Growth story: seed→formation→structured→operating phase transitions. Runtime demo: 2 executions (workflow-run + agent-task with cost tracking), 13 timeline events (diverse types including agent-activated, proposal lifecycle, handoff, artifact, budget-alert, incident). Stable IDs prefixed `vert-` for test/reference predictability. `BootstrapModule` extended to import ProposalsModule + RuntimeModule. Legacy bootstrap preserved for graph-projection backward compatibility. 33 new tests, 3048 total tests passing across monorepo. |
| LCP-017 | 3 proxy controllers in API Gateway (`bootstrap.controller.ts`, `proposals.controller.ts`, `growth-engine.controller.ts`). `CompanyDesignClient` extended with ~12 methods for bootstrap, proposals, growth-engine. All registered in `CompanyModelModule`. |
| LCP-018 | 2 REST controllers in backend (`OrganizationalUnitsController`, `LcpAgentsController`) with CRUD operations + DTO mappers. 2 proxy controllers in API Gateway (`organizational-units.controller.ts`, `lcp-agents.controller.ts`). `CompanyDesignClient` extended with ~10 methods. |
| LCP-019 | 5 API client modules (`bootstrap-api.ts`, `proposals-api.ts`, `growth-api.ts`, `organizational-units-api.ts`, `lcp-agents-api.ts`). 5 TanStack Query hook modules (`use-bootstrap.ts`, `use-proposals.ts`, `use-growth.ts`, `use-organizational-units.ts`, `use-lcp-agents.ts`). |
| LCP-020 | `SnapshotCollector` extended to collect UOs, LcpAgents, and Proposals. `node-mapper.ts` maps UO→company/department/team, LcpAgent→coordinator-agent/specialist-agent, Proposal→proposal nodes. `edge-extractor.ts` extracts contains, led_by, belongs_to, proposed_by edges. `scope-filter.ts` updated for team/agent-detail scopes. `breadcrumb-builder.ts` updated for UO hierarchy. |
| LCP-021 | `CreateProjectDialog` rewritten as 3-step CEO-first bootstrap wizard (name+mission, company type+vision, growth pace+approval level). `BootstrapStatusBadge` component shows maturity phase in TopBar. |
| LCP-022 | `team` added to `DRILLABLE_NODE_TYPES`. `layoutTeamGraph` in `graph-to-flow.ts`. `SCOPE_LAYOUTS` updated. `entity-route-resolver.ts` extended for team/agent-detail routes. |
| LCP-023 | `ProposalsStore` (Zustand) with proposals list, loading, filters by status/type, actions load/approve/reject, `getFilteredProposals`/`getProposalsByStatus` selectors. `proposals-panel.tsx` as Explorer tab #9 with status-grouped proposal cards and approve/reject actions. |
| LCP-024 | `CeoConversationDock` component with CEO welcome message, phase indicator, pending proposals as interactive cards, recently approved section. `ProposalCard` component with expand/collapse details, approve button, reject with reason input. `ChatDock` extended with mode switching (CEO mode for seed/formation phases). |
| LCP-025 | `CanvasSummary` extended with maturity phase indicator, org health metrics (semaphore), pending proposals count, phase capabilities display. 3 new inspector panels: `UoDetailPanel` (mandate, purpose, functions, coordinator), `AgentDetailPanel` (role, skills, responsibilities, budget), `ProposalDetailPanel` (full detail + approve/reject actions). Inspector routing dispatches to appropriate v3 panel based on node type. `use-entity-detail.ts` extended with v3 API path mappings. |
| LCP-026 | `EntityTree` already supported v3 node types from LCP-012. `FilterPanel` already had checkboxes for all v3 types. `OVERLAY_DEFINITIONS` already correct. Verified complete — no additional changes needed. |
| LCP-027 | `live-company-flow.test.tsx` (NEW): 25 tests covering CeoConversationDock, ProposalCard, ProposalsPanel, ProposalsStore. `live-company-canvas.test.tsx` (NEW): 15 tests covering CanvasSummary with Live Company data, EntityTree with v3 types, BootstrapStatusBadge. `mapping.test.ts` extended with ~20 v3 node/edge mapping tests. Existing tests updated for wizard rewrite, new tab count, v3 entity types. All 1746 tests passing across 162 test files. |

## Contrato de uso con Claude Code
- `/tc-next` debe leer este archivo cuando la fase activa sea Live Company Pivot.
- `/tc-run <task-id>` debe resolver tareas aquí antes de mirar registries antiguos.
- Si una tarea cambia el dominio o la UX base, debe comprobar también:
  - `docs/33-live-company-domain-model.md`
  - `docs/34-live-company-canvas-v3-spec.md`
  - `docs/35-live-company-growth-protocol.md`
  - `docs/36-live-company-runtime-live-mode-spec.md`

## Estado actual
Fase **Live Company Pivot** completada incluyendo **Frontend Live Company Adoption**.
**LCP-001 a LCP-027** completadas (todos los grupos A–O cerrados).

El pivot Live Company está completamente integrado backend-to-frontend:
- **Backend**: UOs, LcpAgents, Proposals, Growth Engine, Runtime — todos con controllers REST
- **API Gateway**: proxy completo para todas las entidades Live Company
- **Frontend API**: clients + TanStack Query hooks para bootstrap, proposals, growth, UOs, agents
- **Graph Projection**: SnapshotCollector, node-mapper, edge-extractor mapean entidades v3 al canvas
- **UI**: CEO-first wizard, proposals panel, CEO chat dock, growth dashboard, inspector panels para UO/Agent/Proposal
- **Canvas**: drilldown company→department→team→agent-detail, overlay-aware filtering
- **Tests**: 3222 tests passing across 279 test files

Verticaler es ahora una empresa viva de referencia end-to-end, desde bootstrap hasta runtime observability, con toda la UI conectada.
