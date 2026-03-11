# Verticaler × Canvas Spec v2 — Matriz de cobertura

## Propósito

Este documento mapea cada capacidad principal definida en `docs/18-canvas-editor-v2-spec.md` contra las entidades, relaciones y datos de Verticaler (`docs/25-verticaler-reference-company-spec.md`) para garantizar que la empresa de referencia cubre los recorridos visuales del producto.

**Leyenda de cobertura:**
- **covered** — Verticaler spec define entidades/datos suficientes para ejercer esta capacidad.
- **partial** — Verticaler spec cubre la estructura pero faltan datos o el producto aún no lo implementa completamente.
- **gap** — No hay datos definidos en Verticaler para ejercer esta capacidad; requiere acción futura.

---

## 1. Tipos de nodo

Referencia: Canvas spec §"Nodos v2 mínimos" / Verticaler spec §8.

| Nodo canvas spec | Ejemplo Verticaler | Sección spec | Cobertura |
|---|---|---|---|
| company | Verticaler (SaaS B2B ascensores) | §6, §8.1 | covered |
| department | 9 departamentos (Executive, Product, Engineering, Design, Operations, Customer Success, Sales, Finance & Admin, Compliance & Quality) | §8.2 | covered |
| team / unit container | Platform, Backend, Frontend, QA, Dispatch, Field Service, Incident Management, Discovery, Product Ops, Delivery Planning, Regulatory, Inspection Standards, Audit Readiness | §7.2, §7.3 | covered |
| role | 14 roles (CEO, Head of Product, PM, Head of Eng, Tech Lead, FE/BE Engineer, QA Lead, Head of Ops, Dispatch Coord, Compliance Mgr, CS Lead, Sales Lead, Finance Mgr) | §8.4 | covered |
| agent archetype | 14 agentes (CEO Agent, Product Strategist, Product Ops, Design Lead, Eng Manager, FE/BE Builder, QA Reviewer, Release Coordinator, Ops Coordinator, Compliance Reviewer, CS Agent, Sales Ops, Finance Ops) | §8.5 | covered |
| agent assignment | Los 14 agentes anteriores como assignments | §8.5 | covered |
| capability | 16 capacidades (Product Discovery → Compliance Monitoring) | §8.3 | covered |
| skill | 14 skills (Draft PRD → Update Artifact Metadata) | §8.6 | covered |
| workflow | 4 workflows (Product Delivery, Incident Management, Maintenance Contract Lifecycle, Inspection/Compliance) | §8.8 | covered |
| workflow stage | 27 stages totales (8+7+6+6) | §8.12 | covered |
| contract | 7 contratos inter-departamentales (Product→Design, Design→Eng, Eng→QA, QA→Release, Sales→Finance, CS→Ops, Ops→Compliance) | §8.7 | covered |
| policy | 5 policies (release approval, production change gate, compliance retention, incident escalation, contract acceptance) | §8.9 | covered |
| artifact | 12 artifacts (PRD, Design Spec, Tech Spec, Delivery Plan, QA Report, Release Note, Incident Report, Work Order, Maintenance Contract, Inspection Evidence, Billing Activation Record, Compliance Finding) | §8.10 | covered |

**Nodos futuros del canvas spec** (no requeridos aún):
| Nodo | Estado en Verticaler |
|---|---|
| decision | gap — no definido, previsto como futuro |
| approval gate | gap — no definido, previsto como futuro |
| run | gap — operations overlay futuro |
| queue | gap — operations overlay futuro |
| incident | gap — operations overlay futuro |
| integration endpoint | gap — no definido, previsto como futuro |

---

## 2. Tipos de relación

Referencia: Canvas spec §"Relaciones v2 mínimas" / Verticaler spec §8.11.

| Relación canvas spec | Ejemplo Verticaler | Cobertura |
|---|---|---|
| reports_to | Head of Engineering → CEO | covered |
| owns | Engineering owns Software Implementation | covered |
| assigned_to | Frontend Builder Agent → Frontend Engineer role | covered |
| contributes_to | Design contributes_to Product Discovery | covered |
| has_skill | Backend Builder Agent has_skill Implement Feature | covered |
| compatible_with | Tech Lead compatible_with Review Code | covered |
| provides | Engineering provides candidate build (contract con QA) | covered |
| consumes | QA consumes candidate build | covered |
| bound_by | Product Delivery bound_by release approval policy | covered |
| participates_in | Product Manager participates_in Product Delivery | covered |
| hands_off_to | Design hands_off_to Engineering (design package) | covered |
| governs | Compliance retention policy governs Inspection/Compliance workflow | covered |

**Relaciones futuras del canvas spec** (no requeridas aún):
| Relación | Estado en Verticaler |
|---|---|
| produces_artifact | partial — artifacts definidos pero relación no formalizada explícitamente |
| consumes_artifact | partial — artifacts definidos pero relación no formalizada explícitamente |
| transforms_into | gap |
| blocks | gap |
| approves | gap |
| escalates_to | gap |
| depends_on | gap |
| triggers | gap |

---

## 3. Vistas / presets del canvas

Referencia: Canvas spec §"Presets v2 mínimos" / Verticaler spec §9.

| Vista | Nodos necesarios | Relaciones necesarias | Datos Verticaler | Cobertura |
|---|---|---|---|---|
| Organization View | company, departments, roles, agent archetypes, agent assignments | reports_to, assigned_to | 1 company + 9 depts + 14 roles + 14 agents | covered |
| Capability View | departments, capabilities, roles, skills | owns, contributes_to, compatible_with, has_skill | 9 depts + 16 capabilities + 14 roles + 14 skills | covered |
| Workflow View | workflows, workflow stages, participants, contracts, handoffs | participates_in, hands_off_to, bound_by | 4 workflows + 27 stages + 7 contracts | covered |
| Contract View | departments/capabilities, contracts, bound workflows | provides, consumes, bound_by | 7 contracts + 4 workflows vinculados | covered |
| Artifact Flow View | artifacts, producers, consumers, transformations, contractual handoffs | provides, consumes, hands_off_to | 12 artifacts + 7 contracts con handoffs | covered |
| Governance View | policies, approvals, blocked paths, exceptions | governs, bound_by | 5 policies + vinculos a workflows | covered |
| Operations View | runs, queues, incidents, live state overlays | — | Estructura documental preparada pero datos runtime no definidos | partial |

---

## 4. Navegación multinivel

Referencia: Canvas spec §"Modelo de navegación multinivel" / Verticaler spec §10.

| Nivel | Scope type | Ejemplo Verticaler | Recorrido | Cobertura |
|---|---|---|---|---|
| L0 | platform / lista de empresas | Lista de proyectos (solo Verticaler al inicio) | selección de proyecto → L1 | covered |
| L1 | empresa general | Verticaler company view (9 departamentos, CEO) | vista global → drilldown | covered |
| L2 | departamento / unidad | Engineering (con subdepts Platform, Backend, Frontend, QA) | dept → teams/workflows | covered |
| L3 | workflow / sub-sistema | Product Delivery (8 stages) | workflow → stages | covered |
| L4 | detalle profundo | Stage "Implementation" (artifacts in/out, participant, handoffs) | stage → artifacts/contracts | covered |

### Recorridos de drilldown verificables

| Recorrido | Datos Verticaler |
|---|---|
| empresa → departamento | Verticaler → Engineering |
| empresa → capability map filtrado | Verticaler → 16 capabilities agrupadas por owner |
| departamento → subdepartamento/team | Engineering → Platform, Backend, Frontend, QA |
| departamento → workflow | Operations → Incident Management |
| workflow → stage map | Product Delivery → 8 stages |
| workflow → artifact flow | Product Delivery → PRD, Design Spec, Tech Spec, QA Report, Release Note |
| contract → contract internals | Eng→QA contract → candidate build, acceptance criteria, SLA |

### Recorridos de drillout verificables

| Capacidad | Datos Verticaler | Cobertura |
|---|---|---|
| breadcrumb navegable | Verticaler > Engineering > Product Delivery > Implementation | covered |
| back/forward coherente | cualquier recorrido L1→L4→L1 | covered |
| focus restore al volver | posición de nodo en scope padre | covered |

---

## 5. Sidebar izquierdo

Referencia: Canvas spec §"Sidebar izquierdo".

| Tab sidebar | Qué necesita | Datos Verticaler | Cobertura |
|---|---|---|---|
| Explorer | Árbol de entidades por scope | 9 depts + 13 teams + roles + agents + capabilities en árbol | covered |
| Artifacts | Listado de artifacts | 12 artifacts tipados | covered |
| Search | Entidades buscables por nombre/tipo/owner/relación/status | Todas las entidades nombradas y tipadas | covered |
| Layers / Views | Capas activables + presets | Datos cubren las 7 capas mínimas | covered |
| Validation | Errores/warnings del scope | Requiere reglas de validación ejecutándose sobre datos Verticaler | partial |
| Saved Views | Vistas guardadas | No hay saved views pre-pobladas en el seed | gap |
| Runtime / Operations | Runs, incidentes, colas, bloqueos | No hay datos runtime en seed actual | partial |

---

## 6. Barra superior

Referencia: Canvas spec §"Barra superior".

| Elemento | Dato Verticaler necesario | Cobertura |
|---|---|---|
| selector de proyecto | Proyecto Verticaler | covered |
| nombre del proyecto + release activa | "Verticaler" + release inicial | partial — release mencionada en §14 spec pero no detallada en seed |
| breadcrumbs del scope actual | Scopes multinivel definidos | covered |
| selector de vista/perspectiva | 7 presets con datos | covered |
| selector draft/published/diff | Requiere release publicada | partial — falta release seed explícita |
| búsqueda global | Entidades nombradas | covered |
| estado del workspace (dirty/saving/synced) | Funcionalidad de producto, no de datos | covered |

---

## 7. Inspector por tipo de entidad

Referencia: Canvas spec §"Inspector — especificación por tipo" / Verticaler spec §11.

| Tipo | Tabs con contenido real | Cobertura |
|---|---|---|
| Department | nombre, descripción, mandato, parent, leadership, capabilities, workflows, contratos, políticas, artifacts | covered |
| Role | nombre, descripción, accountability, authority, department, capabilities, skills, workflows | covered |
| Agent Archetype | nombre, descripción, role, department, skills, constraints/policies | covered |
| Agent Assignment | nombre, archetype, status, placement, scope | covered |
| Capability | definición, propósito, owner, contributors, consumers, contracts, workflows, metrics | covered |
| Skill | definición, categoría, tags, roles compatibles, archetypes, límites | covered |
| Workflow | nombre, descripción, owner department, trigger, contracts, participants, stages, artifacts, gates | covered |
| Workflow Stage | nombre, orden, participant owner, artifacts in/out, validaciones, handoffs | covered |
| Contract | nombre, tipo, provider, consumer, SLA, acceptance criteria, workflows, artifacts | covered |
| Policy | nombre, scope, department/global, tipo, enforcement, condition, override/exceptions | covered |
| Artifact | nombre, tipo, productor, consumidores, schema, quality criteria, estado, versiones | covered |

---

## 8. Interacciones del canvas

Referencia: Canvas spec §"Interacciones mínimas" y §"Modos de interacción".

| Interacción | Depende de datos Verticaler | Cobertura |
|---|---|---|
| click selecciona nodo | Nodos existentes | covered |
| shift+click multiselección | Múltiples nodos | covered |
| doble click → drilldown | Nodos drillable (depts, workflows) | covered |
| drag desde handle → crear relación | Nodos conectables | covered |
| context menu sobre nodo/edge/canvas | Nodos y edges existentes | covered |
| drop desde palette → crear nodo | Scope válido | covered |
| fit view / focus selected | Nodos con layout | covered |
| collapse / expand container | Departamentos con hijos | covered |

### Modos de interacción

| Modo | Datos necesarios | Cobertura |
|---|---|---|
| Select | Nodos/edges existentes | covered |
| Pan | Canvas con contenido | covered |
| Connect | Nodos compatibles | covered |
| Add Node | Scope con tipos permitidos | covered |
| Add Relationship | Nodos seleccionables | covered |
| Comment / Review | (futuro cercano) | gap |

---

## 9. Context menu

Referencia: Canvas spec §"Context menu".

| Context menu | Elementos Verticaler | Cobertura |
|---|---|---|
| Sobre canvas vacío: add node, paste, fit view, auto layout, save layout, create frame/group | Scope vacío disponible | covered |
| Sobre nodo: inspect, edit, drilldown, create relationship, duplicate, delete, focus related, open chat | Cualquier nodo Verticaler | covered |
| Sobre edge: inspect relation, edit metadata, delete, highlight source/target | Cualquier edge Verticaler | covered |

---

## 10. Capas y filtros

Referencia: Canvas spec §"Capas y filtros".

| Capa mínima | Datos Verticaler | Cobertura |
|---|---|---|
| organization | 9 depts + roles + agents + reports_to | covered |
| capabilities | 16 capabilities + owns + contributes_to | covered |
| workflows | 4 workflows + 27 stages + participates_in | covered |
| contracts | 7 contracts + provides + consumes | covered |
| artifacts | 12 artifacts + productores/consumidores | covered |
| governance | 5 policies + governs + bound_by | covered |
| operations | Sin datos runtime | partial |

### Filtros mínimos

| Filtro | Datos Verticaler | Cobertura |
|---|---|---|
| por tipo de nodo | 13 tipos de nodo poblados | covered |
| por tipo de relación | 12 tipos de relación poblados | covered |
| por owner department | 9 departamentos como owners | covered |
| por estado/validación | Depende de reglas de validación activas | partial |
| por release/diff status | Requiere release publicada | partial |
| por texto | Todas las entidades tienen nombre | covered |
| por scope | Scopes L1→L4 definidos | covered |
| por runtime state | Sin datos runtime | partial |

---

## 11. Diff y release awareness

Referencia: Canvas spec §"Diff y release awareness".

| Capacidad | Datos Verticaler | Cobertura |
|---|---|---|
| draft vs published | Verticaler creada en draft por bootstrap | partial — falta release publicada explícita |
| compare between releases | Requiere al menos 2 releases | gap |
| visual diff | Requiere cambios entre releases | gap |
| changes only filter | Requiere diff con base | gap |
| before/after in inspector | Requiere 2 versiones de entidad | gap |

**Nota:** El seed debería incluir una release inicial publicada (`v0.1.0`) para habilitar al menos un baseline de diff. Esto permitiría crear cambios en draft y ver el diff contra la release. Actualmente es un gap significativo.

---

## 12. Chat contextual persistente

Referencia: Canvas spec §"Chat contextual persistente".

| Scope de chat | Entidad Verticaler | Cobertura |
|---|---|---|
| company / CEO | Verticaler company | covered |
| department | Cualquiera de los 9 departamentos | covered |
| workflow | Cualquiera de los 4 workflows | covered |
| selected node | Cualquier nodo seleccionado | covered |

**Nota:** Los datos de chat (historial, mensajes) no se pre-pueblan en el seed — solo la estructura de scopes está cubierta.

---

## 13. Validación visual

Referencia: Canvas spec §"Validación visual".

| Capacidad | Datos Verticaler | Cobertura |
|---|---|---|
| badges en nodo | Requiere reglas de validación ejecutándose | partial |
| edges inválidos destacados | Requiere edges con errores | partial |
| lista navegable en sidebar | Tab Validation con datos | partial |
| panel derecho con detalle y quick fixes | Inspector Validation tab | partial |
| validación por scope | Scopes multinivel definidos | covered |
| validación pre-publicación | Requiere flujo draft→publish | partial |

**Nota:** Las reglas de validación son funcionalidad de producto. Verticaler provee la estructura de datos para que tengan sentido, pero el seed no incluye errores intencionales. Se podrían incluir violaciones conocidas para demostrar la validación (p.ej., un rol sin department, un contract sin SLA).

---

## 14. Layout y persistencia visual

Referencia: Canvas spec §"Layout y persistencia visual".

| Capacidad | Datos Verticaler | Cobertura |
|---|---|---|
| auto-layout | Nodos suficientes para layout automático | covered |
| manual positioning | Nodos movibles | covered |
| guardar/restaurar posiciones | Funcionalidad de producto | covered |
| layout por scope y por preset | Scopes + presets definidos | covered |
| layout estable tras refetch | Nodos con IDs estables | covered |

---

## 15. Multi-select y bulk actions

Referencia: Canvas spec §"Multi-select y bulk actions".

| Acción | Datos Verticaler | Cobertura |
|---|---|---|
| align/distribute | Múltiples nodos por scope | covered |
| move together | Selección múltiple | covered |
| bulk tag / bulk owner | Entidades con owners | covered |
| bulk delete con guardrails | Entidades existentes | covered |
| bulk group | Nodos agrupables | covered |

---

## 16. Accesibilidad y ergonomía

Referencia: Canvas spec §"Accesibilidad y ergonomía".

| Capacidad | Dependencia de datos | Cobertura |
|---|---|---|
| navegación por teclado | Nodos focusables | covered |
| atajos documentados | Funcionalidad de producto | covered |
| contraste correcto | Funcionalidad de diseño | covered |
| labels accesibles | Nodos con nombres descriptivos | covered |

---

## Resumen de cobertura

| Área | covered | partial | gap |
|---|---|---|---|
| Tipos de nodo (actuales) | 13/13 | 0 | 0 |
| Tipos de nodo (futuros) | 0/6 | 0 | 6 |
| Relaciones (actuales) | 12/12 | 0 | 0 |
| Relaciones (futuras) | 0/8 | 2 | 6 |
| Vistas/presets | 6/7 | 1 | 0 |
| Navegación multinivel | 5/5 | 0 | 0 |
| Sidebar tabs | 5/7 | 1 | 1 |
| Inspector por tipo | 11/11 | 0 | 0 |
| Interacciones canvas | 8/8 | 0 | 0 |
| Capas mínimas | 6/7 | 1 | 0 |
| Diff / releases | 0/5 | 1 | 4 |
| Chat contextual | 4/4 | 0 | 0 |
| Validación visual | 1/6 | 5 | 0 |
| Layout | 5/5 | 0 | 0 |
| **Total (actuales)** | **76** | **9** | **5** |

---

## Gaps accionables

Los gaps identificados se agrupan en acciones futuras concretas, priorizadas por impacto.

### Prioridad alta

| # | Gap | Acción requerida | Impacto |
|---|---|---|---|
| G-01 | Diff/releases sin baseline | Incluir una release publicada inicial (`v0.1.0`) en el seed de Verticaler para habilitar diff | Desbloquea la demostración de diff visual, compare y before/after |
| G-02 | Saved views no pre-pobladas | Definir 2-3 saved views de ejemplo (ej. "Org overview", "Active workflows", "Compliance dashboard") | Demuestra saved views tab en sidebar |

### Prioridad media

| # | Gap | Acción requerida | Impacto |
|---|---|---|---|
| G-03 | Validación sin errores intencionales | Opcionalmente incluir 1-2 violaciones conocidas en el seed (rol sin dept, contract sin SLA) para demostrar validation overlay | Demuestra badges, sidebar validation y quick fixes |
| G-04 | Operations view sin datos runtime | Poblar datos runtime mínimos (1 run, 1 incidente, 1 cola) cuando operations overlay se implemente | Vista Operations completa |
| G-05 | `produces_artifact` y `consumes_artifact` no formalizadas | Formalizar relaciones artifact↔entity explícitas cuando el producto soporte estos tipos de relación | Artifact Flow View más precisa |

### Prioridad baja (futuro)

| # | Gap | Acción requerida |
|---|---|---|
| G-06 | Nodos futuros (decision, approval gate, run, queue, incident, integration endpoint) | Añadir a Verticaler cuando el producto implemente estos nodos |
| G-07 | Relaciones futuras (transforms_into, blocks, approves, escalates_to, depends_on, triggers) | Añadir a Verticaler cuando el producto implemente estas relaciones |
| G-08 | Comment/Review mode | Ejercitar cuando se implemente |

---

## Regla de mantenimiento

Este documento debe actualizarse cuando:
1. Cambie `docs/18-canvas-editor-v2-spec.md` — reevaluar cobertura.
2. Cambie `docs/25-verticaler-reference-company-spec.md` — reevaluar gaps.
3. Se implemente una feature que cierre un gap — marcar como covered.
4. Se añada un nuevo tipo de nodo/relación/vista al canvas spec — añadir fila a la matriz.
