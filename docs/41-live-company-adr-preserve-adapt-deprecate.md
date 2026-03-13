# ADR — Live Company: Preserve / Adapt / Deprecate Mapping

## Estado
Accepted

## Contexto
Con el pivot Live Company formalmente adoptado (LCP-001), este documento detalla el mapeo explícito entre el modelo actual del repo y el nuevo paradigma. Cada pieza del sistema se clasifica como **preserve**, **adapt** o **deprecate**, con la ruta old→new cuando aplica.

Documentos de referencia:
- `docs/31-live-company-pivot-decision.md` (decisión de producto)
- `docs/32-live-company-repo-analysis.md` (análisis del repo)
- `docs/33-live-company-domain-model.md` (nuevo dominio)
- `docs/34-live-company-canvas-v3-spec.md` (canvas v3)
- `docs/37-live-company-migration-strategy.md` (estrategia de migración)

---

## 1. PRESERVE — Se conserva tal cual

### 1.1 Infraestructura

| Pieza | Ubicación | Notas |
|-------|-----------|-------|
| Monorepo pnpm + Turborepo | raíz | Sin cambios |
| Node >= 22, TypeScript everywhere | raíz | Sin cambios |
| apps/web (shell visual) | apps/web | Shell se preserva, contenido se adapta |
| apps/api-gateway (BFF) | apps/api-gateway | Sin cambios |
| services/platform | services/platform | Se extiende, no se reescribe |
| services/company-design | services/company-design | Se extiende y adapta internamente |
| packages/domain-core | packages/domain-core | Entity, AggregateRoot, ValueObject, DomainEvent, Repository |
| packages/tsconfig, eslint-config | packages/* | Sin cambios |
| k3d + Tilt | infra/ | Sin cambios |
| Testing (Vitest) | todo el repo | Sin cambios |
| Claude Code workflow | .claude/ | Ya actualizado en LCP-001 |

### 1.2 Frontend foundation

| Pieza | Ubicación | Notas |
|-------|-----------|-------|
| React Flow / XYFlow canvas base | apps/web | Motor visual se preserva |
| Explorer panel | visual-shell/explorer | Estructura se preserva, tabs se adaptan |
| Inspector panel | visual-shell/inspector | Estructura se preserva, tabs/contenido se adaptan |
| Chat dock | visual-shell + chat module | Se preserva, scope model se adapta |
| Visual diff surface | diff route + graph-to-flow | Se preserva, types se adaptan |
| Layout persistence | lib/layout-persistence.ts | Se preserva |
| Saved views store | saved-views module | Se preserva, presets se adaptan |
| Canvas toolbar structure | canvas-toolbar.tsx | Se preserva, items se adaptan |
| Context menus | canvas-viewport.tsx | Se preserva |
| Keyboard shortcuts | visual-workspace-store.ts | Se preserva |

### 1.3 Backend foundation

| Pieza | Ubicación | Notas |
|-------|-----------|-------|
| Project aggregate | platform/projects | Se preserva y extiende |
| BootstrapService pattern | platform/bootstrap + company-design/bootstrap | Patrón se preserva, seed data se adapta |
| DDD module structure | company-design/*/domain, application, infra | Patrón se reutiliza para nuevos módulos |
| In-memory repository pattern | */infra/in-memory-*.repository.ts | Se preserva hasta fase de persistencia |
| AuditEntry + AuditService | audit module | Se preserva |
| Release + SnapshotCollector + SnapshotDiffer | releases module | Se preserva, snapshot schema se extiende |
| ValidationEngine | validations module | Se preserva, reglas se extienden |
| GraphProjectionService | graph-projection module | Se preserva, mapping se adapta |

### 1.4 Collaboration & governance

| Pieza | Ubicación | Notas |
|-------|-----------|-------|
| Comments (CommentDto, CommentService) | comments module | Sin cambios |
| ReviewMarker (ReviewMarkerDto) | collaboration module | Sin cambios |
| EntityLock (EntityLockDto) | collaboration module | Sin cambios |
| CollaborationSummary | collaboration module | Sin cambios |
| Permission system (PlatformRole, ProjectRole, ROLE_PERMISSIONS) | shared-types + frontend | Se preserva |

### 1.5 Operations (runtime base)

| Pieza | Ubicación | Notas |
|-------|-----------|-------|
| WorkflowRun, StageExecution | operations module | Se preserva y extiende para Live Mode |
| Incident, ContractCompliance | operations module | Se preserva |
| QueueDepth, OperationBadge | operations module | Se preserva |
| OperationsSummary, EntityOperationStatusDto | shared-types | Se preserva |

---

## 2. ADAPT — Se transforma con mapeo explícito

### 2.1 Domain entities: old → new

| Old entity | Old location | New entity | Action | Notes |
|------------|-------------|------------|--------|-------|
| CompanyModel | company-model module | **ProjectSeed** + **CompanyConstitution** | Split | CompanyModel.purpose/type/scope → ProjectSeed. CompanyModel.principles → CompanyConstitution.operationalPrinciples. Nuevos campos: mission, vision, restrictions, budget, founder preferences |
| Department | departments module | **OrganizationalUnit** (type: department) | Rename + generalize | Añadir `uoType: 'company' \| 'department' \| 'team'`, `coordinatorAgentId`, `parentUoId`. Mantener name, description, mandate |
| *(no existe)* | — | **OrganizationalUnit** (type: team) | New | Teams no existían como entidad. Serán UOs con type='team' |
| Role | roles module | *(absorber en Agent)* | Deprecate entity, merge concept | roleId queda como campo del Agent. Role como entidad CRUD separada desaparece |
| AgentArchetype | agent-archetypes module | **CoordinatorAgent** or **SpecialistAgent** | Replace | El split archetype/assignment se unifica. agentType: 'coordinator' \| 'specialist'. Campos: uoId, role, skills, inputs, outputs, budget, runtimeState |
| AgentAssignment | agent-assignments module | *(merge en Agent)* | Absorb | assignment.name → agent.name, assignment.status → agent.status. No más split archetype/assignment |
| Capability | capabilities module | *(redistribute)* | Deprecate entity | Capabilities se redistribuyen como skills de agentes o funciones de UOs. No se mantiene como entidad de primer nivel |
| Skill | skills module | **Agent.skills[]** | Absorb | Skills pasan a ser propiedad del agente, no entidad independiente con CRUD |
| Workflow | workflows module | **Workflow** | Preserve + enrich | Añadir: workflowType (strategic/operational/service-internal/event-driven/external-response), definitionOfDone, escalationRules, metrics. stages → richer con handoff model |
| WorkflowStage | workflows VO | **WorkflowStage** | Preserve + enrich | Añadir: participantOwnerId, inputArtifacts, outputArtifacts, handoffs |
| Contract | contracts module | **Contract** | Adapt anchoring | Cambiar party model: de providerId/consumerId genéricos a partes tipadas (UO↔UO, Agent↔Agent, UO↔Agent, Stage↔Stage). Mantener type, status, acceptance criteria |
| Policy | policies module | **Policy** | Extend scope | Añadir target types: UO, agent, workflow, handoff, artifact, proposal. Mantener tipo, enforcement, condition |
| Artifact | artifacts module | **Artifact** | Enrich anchoring | Mantener producer/consumer. Añadir: workflowId, handoffId, decisionId, policyId. Nada existe aislado |
| Release + Snapshot | releases module | **Release** | Extend snapshot | ReleaseSnapshotDto debe incluir nuevas entidades: UOs, agents (coordinator/specialist), proposals, decisions |

### 2.2 Visual grammar: old → new

| Old type | Old values | New type | New values | Action |
|----------|-----------|----------|-----------|--------|
| NodeType | company, department, role, agent-archetype, agent-assignment, capability, skill, workflow, workflow-stage, contract, policy, artifact | **NodeType** | company, department, **team**, **coordinator-agent**, **specialist-agent**, **objective**, **event-trigger**, **external-source**, workflow, workflow-stage, **handoff**, contract, artifact, policy, **decision**, **proposal** | Redefine: remove 4, add 8 |
| EdgeType | reports_to, owns, assigned_to, contributes_to, has_skill, compatible_with, provides, consumes, bound_by, participates_in, hands_off_to, governs, produces_artifact, consumes_artifact | **EdgeType** | **contains**, **belongs_to**, reports_to, **led_by**, **accountable_for**, **supervises**, **requests_from**, **delegates_to**, **reviews**, **approves**, hands_off_to, **escalates_to**, **produces**, **consumes**, **informs**, **triggers**, **governed_by**, **constrained_by**, **proposed_by**, **approved_by** | Redefine: remove 8, add 14 |
| EdgeCategory | hierarchical, ownership, assignment, capability, contract, workflow, governance, artifact | **EdgeCategory** | **structural**, **responsibility**, **collaboration**, **flow**, **governance** | Simplify from 8 to 5 |
| LayerId | organization, capabilities, workflows, contracts, governance, artifacts, operations | **OverlayId** | **organization**, **work**, **deliverables**, **rules**, **live-status** | Rename + simplify from 7 to 5 |
| ZoomLevel | L1, L2, L3, L4 | **ZoomLevel** | L1, L2, L3, L4 | Preserve |
| ScopeType | company, department, workflow, workflow-stage | **ScopeType** | company, department, **team**, **agent-detail** | Redefine L3/L4 |

### 2.3 Visual registries: old → new

| Registry | Action | Notes |
|----------|--------|-------|
| SCOPE_REGISTRY (4 scopes) | Redefine | company (L1), department (L2), team (L3), agent-detail (L4). Drill paths change |
| CONNECTION_RULES (15 rules) | Redefine | New rules for new NodeType/EdgeType combinations |
| LAYER_DEFINITIONS (7 layers) | Replace with OVERLAY_DEFINITIONS (5) | Map node/edge membership to new types |
| DEFAULT_LAYERS_PER_LEVEL | Replace with DEFAULT_OVERLAYS_PER_LEVEL | Align with new overlay model |
| VIEW_PRESET_REGISTRY (7 presets) | Redefine (5 presets) | Organization, Work, Deliverables, Rules, Live Status |

### 2.4 Frontend adaptation

| Component/Store | Adaptation |
|-----------------|-----------|
| VisualWorkspaceStore.activeLayers | Rename to activeOverlays, update values |
| VisualWorkspaceStore.currentScope | Update ScopeType values |
| ExplorerTab.layers | Rename to 'overlays' |
| NODE_TYPE_LABELS, NODE_TYPE_ICONS | Update for new node types |
| ENTITY_EDIT_SCHEMAS | Rewrite for new entity shapes |
| entity-form-schemas | Rewrite for new entity creation forms |
| graph-to-flow.ts | Update layout for new node types, edge types |
| node-mapper.ts (backend) | Rewrite mapping for new types |
| edge-extractor.ts (backend) | Rewrite extraction for new relationship model |
| scope-filter.ts (backend) | Update for new scopes |
| entity-route-resolver.ts | Update routes: add /teams/$teamId, revise agent routes |
| visual-node.tsx | Add new node renderers for coordinator-agent, specialist-agent, team, objective, etc. |
| canvas-toolbar.tsx | Reprioritize: create UO, create Agent, create Objective, create Workflow |

### 2.5 Backend adaptation

| Module | Adaptation |
|--------|-----------|
| company-model module | Rename/split to project-seed + constitution modules |
| departments module | Generalize to organizational-units module (company, department, team) |
| roles module | Deprecate as standalone module; role becomes agent property |
| agent-archetypes module | Replace with agents module (coordinator + specialist) |
| agent-assignments module | Merge into agents module |
| capabilities module | Deprecate as standalone; redistribute to UO functions + agent skills |
| skills module | Absorb into agents module as embedded collection |
| bootstrap/verticaler-seed.ts | Rewrite: full seed → minimal seed (project + CEO only) |
| graph-projection/mapping/* | Rewrite all mappers for new types |

### 2.6 Chat adaptation

| Old model | New model |
|-----------|----------|
| Chat scoped by ScopeType (company, department, workflow, workflow-stage) | Chat scoped by responsibility: CEO, executive, team-lead, specialist, workflow, company. ScopeType still usable but chat context enriched with agent identity |

### 2.7 Routes adaptation

| Old route | New route | Notes |
|-----------|----------|-------|
| /projects/$projectId/org | /projects/$projectId/org | Preserve (L1) |
| /projects/$projectId/departments/$departmentId | /projects/$projectId/departments/$departmentId | Preserve (L2) |
| /projects/$projectId/workflows/$workflowId | *(move to L3 or sub-route of department)* | Review: workflows may be scoped under department |
| /projects/$projectId/workflows/$workflowId/stages/$stageId | *(review)* | May become handoff detail |
| *(no existe)* | /projects/$projectId/teams/$teamId | New (L3) |
| *(no existe)* | /projects/$projectId/agents/$agentId | New (L4 agent detail) |
| /projects/$projectId/admin/* | /projects/$projectId/admin/* | Preserve but de-prioritize |

---

## 3. DEPRECATE — Se retira conceptualmente

### 3.1 Entities to remove

| Entity | Current location | Reason | Timeline |
|--------|-----------------|--------|----------|
| Role (standalone) | roles module, shared-types RoleDto | Absorbed into Agent model. Role becomes a string property, not a full entity | LCP-004 (domain design) |
| AgentArchetype (standalone) | agent-archetypes module | Replaced by CoordinatorAgent/SpecialistAgent | LCP-004 |
| AgentAssignment (standalone) | agent-assignments module | Merged into Agent entity | LCP-004 |
| Capability (standalone) | capabilities module | Redistributed to UO functions + Agent skills | LCP-004 |
| Skill (standalone CRUD) | skills module | Embedded in Agent, not separate CRUD entity | LCP-004 |

### 3.2 Visual concepts to remove

| Concept | Current location | Replacement |
|---------|-----------------|-------------|
| LayerId 'capabilities' | shared-types, layer definitions | No direct replacement; capabilities concept removed |
| LayerId 'contracts' (standalone) | shared-types | Merged into 'rules' overlay |
| LayerId 'governance' (standalone) | shared-types | Merged into 'rules' overlay |
| LayerId 'artifacts' (standalone) | shared-types | Merged into 'deliverables' overlay |
| NodeType 'role' | shared-types | Removed |
| NodeType 'agent-archetype' | shared-types | Replaced by 'coordinator-agent' / 'specialist-agent' |
| NodeType 'agent-assignment' | shared-types | Merged into agent nodes |
| NodeType 'capability' | shared-types | Removed |
| NodeType 'skill' | shared-types | Removed (skill is agent property) |
| EdgeType 'owns' (dept→capability) | shared-types | Removed with capabilities |
| EdgeType 'assigned_to' | shared-types | Replaced by 'belongs_to' or 'led_by' |
| EdgeType 'contributes_to' | shared-types | Removed with capabilities |
| EdgeType 'has_skill' | shared-types | Removed (embedded in agent) |
| EdgeType 'compatible_with' | shared-types | Removed with capabilities/roles |
| EdgeType 'provides' (old contract model) | shared-types | Rethought as party-based contract edges |
| EdgeType 'consumes' (old contract model) | shared-types | Rethought as party-based contract edges |
| EdgeType 'bound_by' | shared-types | Replaced by 'constrained_by' or 'governed_by' |
| EdgeType 'produces_artifact' | shared-types | Replaced by 'produces' |
| EdgeType 'consumes_artifact' | shared-types | Replaced by 'consumes' |

### 3.3 Mental models to retire

| Concept | Replacement |
|---------|-------------|
| "Layers" as primary product language | "Overlays" — secondary to organizational structure |
| "Full company from day zero" | Incremental growth from seed |
| "CRUD-first primary experience" | Canvas-first, inspector-driven editing |
| "Entity-first abstract taxonomy" | Organization-first human structure |
| "Capabilities as first-class citizens" | Agent skills + UO functions |
| "Role → Archetype → Assignment pipeline" | Direct Agent entity with type + role string |

---

## 4. NEW — Entidades que no existen en el repo actual

| New entity | Module target | Source spec |
|------------|--------------|-------------|
| ProjectSeed | project-seed module (new) or extend company-model | docs/33 §1 |
| CompanyConstitution | constitution module (new) | docs/33 §2 |
| OrganizationalUnit (type: team) | organizational-units module | docs/33 §3 |
| CoordinatorAgent | agents module (new) | docs/33 §4 |
| SpecialistAgent | agents module (new) | docs/33 §4 |
| Objective | objectives module (new) | docs/33 §5 |
| EventTrigger | triggers module (new) | docs/33 §5 |
| ExternalSource | external-sources module (new) | docs/33 §5 |
| Handoff | workflows module (extend) | docs/33 §7 |
| Proposal | proposals module (new) | docs/33 §11 |
| Decision | decisions module (new) | docs/33 §12 |
| RuntimeExecution | runtime module (new or extend operations) | docs/33 §13 |
| RuntimeEvent | runtime module (new) | docs/36 |
| HandoffExecution | runtime module (new) | docs/36 |
| ArtifactVersion | artifacts module (extend) | docs/36 |
| ProposalLifecycle | proposals module (extend) | docs/36 |
| BudgetConsumption | budget module (new) | docs/36 |
| AgentActivityStatus | agents module (extend) | docs/36 |

---

## 5. Migration sequence

The adapt/deprecate changes should follow this order to minimize breakage:

1. **LCP-004** — Design new domain types alongside old ones (coexistence)
2. **LCP-005** — Design canvas v3 type plan (new NodeType/EdgeType/Overlay)
3. **LCP-011** — Introduce bridge types in shared-types (old + new coexist)
4. **LCP-012** — Refactor canvas to use new types
5. **LCP-013** — Implement bootstrap seed + CEO path (new creation flow)
6. Future tasks — Remove deprecated modules once new ones are stable

Old modules and types are NOT deleted until the new ones are proven and tested. Deprecation is conceptual until implementation confirms the replacement.

---

## 6. Risk assessment

| Risk | Mitigation |
|------|-----------|
| Breaking existing tests during type migration | Bridge types (LCP-011) allow coexistence |
| Canvas regression during node/edge type change | Visual regression tests + Verticaler smoke test |
| Losing operational data model during adapt | Operations module is preserved, only extended |
| Confusion between old and new naming | Clear deprecation markers in code + this document as reference |
| Scope creep during adaptation | Each LCP task has bounded scope; no big-bang rewrite |

---

## 7. Decision

This mapping is the authoritative reference for all LCP tasks that touch the domain, visual grammar, or backend modules. Any deviation from this mapping must be documented as an update to this ADR.
