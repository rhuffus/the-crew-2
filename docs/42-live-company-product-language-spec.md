# Product Language & UI Spec — From Layers to Overlays

## Estado
Draft — LCP-003

## Objetivo
Definir el lenguaje de producto y la experiencia UI que sustituye el modelo mental de "layers equivalentes" por una lectura basada en **estructura organizativa + overlays contextuales**.

---

## 1. Principio rector

El usuario no debe percibir la empresa como un conjunto de capas abstractas apilables.
Debe percibirla como una **organización de trabajo viva** sobre la que se pueden activar **perspectivas adicionales** (overlays) para ver dimensiones específicas.

### Metáfora
- **Old:** "La empresa tiene 7 capas: organización, capabilities, workflows..."
- **New:** "La empresa tiene estructura (quién existe, quién lidera qué) y puedes activar perspectivas para ver trabajo, entregables, reglas o estado en vivo."

---

## 2. Vocabulario de producto

### 2.1 Términos que DESAPARECEN del producto

| Término old | Contexto | Razón |
|-------------|----------|-------|
| Layer / Layers | Panel de explorer, toolbar, documentación | Sugiere capas equivalentes y abstractas. No hay jerarquía natural |
| Capabilities | Tipo de nodo, layer, preset | Concepto absorbido por skills de agentes y funciones de UOs |
| Role (como entidad) | Tipo de nodo, CRUD | Absorbido como propiedad del Agent |
| Agent Archetype | Tipo de nodo, CRUD | Reemplazado por Coordinator/Specialist Agent |
| Agent Assignment | Tipo de nodo, CRUD | Fusionado en Agent |
| Skill (como entidad) | Tipo de nodo, CRUD | Embebido en Agent |

### 2.2 Términos que SE INTRODUCEN

| Término new | Definición de producto | Ejemplo de uso en UI |
|-------------|----------------------|---------------------|
| Overlay | Perspectiva activable sobre la vista base. No es una capa; es un filtro visual temático | "Activa el overlay de Work para ver los workflows" |
| Organization (overlay) | Estructura base: UOs y agentes. Siempre visible | Vista por defecto del canvas |
| Work (overlay) | Workflows, handoffs, colaboración entre agentes | "Overlay: Work" en el selector |
| Deliverables (overlay) | Artefactos, documentos, outputs producidos | "Overlay: Deliverables" |
| Rules (overlay) | Contratos, policies, restricciones | "Overlay: Rules" |
| Live Status (overlay) | Estado runtime, actividad, errores, esperas, locks | "Overlay: Live Status" |
| Coordinator Agent | Agente que razona, planifica, decide, escala | Nodo en canvas: "CEO", "VP Engineering" |
| Specialist Agent | Agente que ejecuta, analiza, produce, revisa | Nodo en canvas: "Frontend Engineer", "QA" |
| Team | UO de nivel 3 que agrupa specialists bajo un lead | Nodo contenedor en canvas |
| Objective | Meta estratégica u operativa que motiva trabajo | Nodo trigger en canvas |
| Event Trigger | Señal externa o interna que inicia un workflow | Nodo trigger en canvas |
| External Source | Fuente de información o contexto fuera de la empresa | Nodo contextual en canvas |
| Handoff | Punto de transferencia entre participantes de un workflow | Nodo intermedio en workflow detail |
| Proposal | Cambio organizativo propuesto por un agente | Nodo en overlay Rules o en inspector |
| Decision | Decisión trazable con autor, aprobación e impacto | Nodo en overlay Rules o en inspector |
| Design Mode | Modo donde se define y modifica la estructura | Toggle en toolbar |
| Live Mode | Modo donde se observa la operación en tiempo real | Toggle en toolbar |

### 2.3 Términos que SE PRESERVAN

| Término | Notas |
|---------|-------|
| Company | UO raíz |
| Department | UO nivel 2 |
| Workflow | Se enriquece pero el nombre se mantiene |
| Workflow Stage | Se preserva |
| Contract | Se preserva, se ancla a partes reales |
| Policy | Se preserva, se extiende scope |
| Artifact | Se preserva, se ancla a productores |
| Inspector | Panel derecho, sin cambios de nombre |
| Explorer | Panel izquierdo, sin cambios de nombre |
| Canvas | Superficie principal |
| Saved View | Vista guardada con overlays y filtros |

---

## 3. Modelo conceptual UI

### 3.1 Vista base del canvas

La vista base (sin overlays adicionales) muestra siempre:

```
Company
├── CEO (coordinator agent)
├── Department A
│   ├── Executive A (coordinator agent)
│   ├── Team A1
│   │   ├── Lead A1 (coordinator agent)
│   │   ├── Specialist 1
│   │   └── Specialist 2
│   └── Team A2
│       └── ...
└── Department B
    └── ...
```

Esto es el overlay **Organization**, que está siempre activo.

### 3.2 Overlays activables

Los overlays se activan/desactivan sobre la vista base. Cada uno **añade** nodos y/o aristas relevantes sin reemplazar la estructura organizativa.

| Overlay | Qué añade visualmente |
|---------|----------------------|
| Organization | (siempre activo) UOs, agentes, relaciones estructurales |
| Work | Workflows, workflow stages, handoffs, aristas de colaboración (requests_from, delegates_to, hands_off_to, reviews, approves, escalates_to) |
| Deliverables | Artifacts, documentos, aristas produces/consumes |
| Rules | Contracts, policies, proposals, decisions, aristas governed_by/constrained_by/approved_by |
| Live Status | Badges de estado runtime, actividad reciente, errores, esperas, locks, ejecuciones activas |

### 3.3 Regla de visibilidad

- **Organization** es obligatorio — no se puede desactivar.
- Los demás overlays son opcionales y combinables.
- Cada nivel de navegación tiene defaults sensatos:
  - L1 (Company): Organization only
  - L2 (Department): Organization + Work
  - L3 (Team): Organization + Work
  - L4 (Agent/Workflow detail): Organization + Work + Deliverables

### 3.4 Diferencia clave respecto a layers

| Aspecto | Old (Layers) | New (Overlays) |
|---------|-------------|----------------|
| Modelo mental | 7 capas equivalentes | 1 base fija + 4 perspectivas opcionales |
| Jerarquía | Todas las capas tienen el mismo peso | Organization es primaria; las demás son secundarias |
| Activación | Cualquier layer se puede desactivar | Organization siempre activa |
| Combinación | Las capas se apilan sin guía | Los overlays se diseñan para complementar la base |
| Lectura | "¿Qué capa estoy viendo?" | "¿Qué perspectiva quiero añadir a la estructura?" |

---

## 4. Spec de UI components

### 4.1 Explorer panel: de "Layers" a "Overlays"

**Antes:**
```
Layers
☑ Organization
☑ Capabilities
☐ Workflows
☐ Contracts
☐ Governance
☐ Artifacts
☐ Operations
```

**Después:**
```
Overlays
☑ Organization (locked, always on)
☐ Work
☐ Deliverables
☐ Rules
☐ Live Status
```

- El checkbox de Organization aparece como activo y no se puede desactivar (visual: locked icon o estilo dimmed).
- Los demás son toggles estándar.
- Reducción de 7 opciones a 5 (de las cuales 1 es fija).

### 4.2 Toolbar: overlay status

**Antes:**
```
Active layers: Organization, Capabilities
```

**Después:**
```
Overlays: Work, Rules          (Organization no se menciona, es implícita)
```

- Solo se muestran los overlays opcionales activos.
- Si ninguno está activo, se muestra: `Overlays: —` o simplemente nada.
- El label cambia de "Active layers" a "Overlays".

### 4.3 Toolbar: mode toggle

Nuevo toggle explícito en la toolbar:

```
[Design Mode] | [Live Mode]
```

- **Design Mode**: permite crear, editar y eliminar estructura.
- **Live Mode**: muestra el overlay Live Status por defecto, desactiva creación/edición, enfoca en observabilidad.
- Switching a Live Mode activa automáticamente el overlay Live Status.
- Switching a Design Mode desactiva Live Status (a menos que el usuario lo reactive manualmente).

### 4.4 Toolbar: creation actions

**Antes:** Create Department, Create Role, Create Agent Archetype, Create Capability, Create Skill, Create Workflow...

**Después (prioridad):**
1. Create Department
2. Create Team
3. Create Coordinator Agent
4. Create Specialist Agent
5. Create Objective
6. Create Event Trigger
7. Create Workflow
8. Create External Source
9. (secondary) Create Contract, Create Policy, Create Artifact

Las acciones de creación reflejan la estructura organizativa primero, luego triggers, luego workflows, luego soporte.

### 4.5 View presets

**Antes (7 presets):**
Organization, Capabilities, Workflows, Contracts, Artifact Flow, Governance, Operations

**Después (5 presets):**

| Preset | Overlays activos | Descripción |
|--------|-----------------|-------------|
| Organization | (only base) | "Company structure: units, agents, hierarchy" |
| Work | Organization + Work | "Workflows, collaboration, handoffs" |
| Deliverables | Organization + Deliverables | "Artifacts, documents, outputs" |
| Rules | Organization + Rules | "Contracts, policies, governance" |
| Live Status | Organization + Live Status | "Runtime activity, errors, queue state" |

Cada preset activa Organization (implícito) + su overlay correspondiente.

### 4.6 Node palette

**Node types presentados al usuario:**

| Category | Nodes | Icon suggestion |
|----------|-------|----------------|
| Organization | Company, Department, Team | Building2, Users, UsersRound |
| Agents | Coordinator Agent, Specialist Agent | BrainCircuit, Bot |
| Triggers | Objective, Event Trigger, External Source | Target, Zap, Globe |
| Workflow | Workflow, Workflow Stage, Handoff | Workflow, GitBranch, ArrowRightLeft |
| Support | Contract, Policy, Artifact, Decision, Proposal | FileText, Shield, Package, Gavel, MessageSquarePlus |

### 4.7 Edge labels (user-facing)

| Edge type | User label | Category |
|-----------|-----------|----------|
| contains | Contains | Structural |
| belongs_to | Belongs to | Structural |
| reports_to | Reports to | Structural |
| led_by | Led by | Responsibility |
| accountable_for | Accountable for | Responsibility |
| supervises | Supervises | Responsibility |
| requests_from | Requests from | Collaboration |
| delegates_to | Delegates to | Collaboration |
| reviews | Reviews | Collaboration |
| approves | Approves | Collaboration |
| hands_off_to | Hands off to | Collaboration |
| escalates_to | Escalates to | Collaboration |
| produces | Produces | Flow |
| consumes | Consumes | Flow |
| informs | Informs | Flow |
| triggers | Triggers | Flow |
| governed_by | Governed by | Governance |
| constrained_by | Constrained by | Governance |
| proposed_by | Proposed by | Governance |
| approved_by | Approved by | Governance |

### 4.8 Edge categories (simplified)

| Old (8) | New (5) |
|---------|---------|
| hierarchical | structural |
| ownership | structural |
| assignment | responsibility |
| capability | *(removed)* |
| contract | governance |
| workflow | collaboration + flow |
| governance | governance |
| artifact | flow |

---

## 5. Overlay membership: qué nodos/aristas pertenecen a cada overlay

### Organization (always on)
- **Nodes:** company, department, team, coordinator-agent, specialist-agent
- **Edges:** contains, belongs_to, reports_to, led_by, accountable_for, supervises

### Work
- **Nodes:** workflow, workflow-stage, handoff, objective, event-trigger, external-source
- **Edges:** requests_from, delegates_to, reviews, approves, hands_off_to, escalates_to, triggers, informs

### Deliverables
- **Nodes:** artifact
- **Edges:** produces, consumes

### Rules
- **Nodes:** contract, policy, proposal, decision
- **Edges:** governed_by, constrained_by, proposed_by, approved_by

### Live Status
- **Nodes:** (no new nodes; badges/overlays on existing nodes)
- **Badges/decorators:** runtime state, active runs, errors, queue depth, locks, review markers, incident indicators

---

## 6. Reglas de producto para el lenguaje

### 6.1 En la UI
- Nunca usar "layer" o "capa" como término visible.
- Usar "overlay" para las perspectivas activables.
- La estructura organizativa no es un overlay que se elige: es la base.
- "Organization" como overlay solo aparece en la lista para indicar que es la base — pero visualmente se muestra como locked/siempre activo.

### 6.2 En documentación de usuario
- "Activa el overlay de Work para ver los workflows de tu empresa."
- "El canvas muestra la estructura de tu empresa. Los overlays te permiten ver más: trabajo, entregables, reglas o estado en vivo."
- "Cambia a Live Mode para ver qué está ocurriendo ahora mismo."

### 6.3 En código interno
- `OverlayId` reemplaza `LayerId` como tipo principal.
- `OVERLAY_DEFINITIONS` reemplaza `LAYER_DEFINITIONS`.
- `activeOverlays` reemplaza `activeLayers` en stores.
- `toggleOverlay()` reemplaza `toggleLayer()`.
- `DEFAULT_OVERLAYS_PER_LEVEL` reemplaza `DEFAULT_LAYERS_PER_LEVEL`.
- El tipo `LayerId` puede existir temporalmente como alias deprecated durante migración.

### 6.4 En comunicación interna (docs, PRs, commits)
- Usar "overlay" consistentemente.
- Si se necesita referir al modelo antiguo: "former layer model" o "legacy layers".

---

## 7. Mapeo de migración: code locations

| File | Change | Task |
|------|--------|------|
| `packages/shared-types/src/index.ts` — LayerId type | Rename to OverlayId, reduce from 7 to 5 values | LCP-010/LCP-011 |
| `packages/shared-types/src/index.ts` — LAYER_DEFINITIONS | Replace with OVERLAY_DEFINITIONS | LCP-010/LCP-011 |
| `packages/shared-types/src/index.ts` — DEFAULT_LAYERS_PER_LEVEL | Replace with DEFAULT_OVERLAYS_PER_LEVEL | LCP-010/LCP-011 |
| `packages/shared-types/src/index.ts` — EdgeCategory | Simplify from 8 to 5 | LCP-011 |
| `packages/shared-types/src/index.ts` — VIEW_PRESET_REGISTRY | Redefine 7→5 presets | LCP-010/LCP-011 |
| `apps/web/.../explorer/layers-panel.tsx` | Rename file + heading + logic | LCP-010 |
| `apps/web/.../canvas-toolbar.tsx` | Update overlay label display + mode toggle | LCP-010/LCP-012 |
| `apps/web/src/stores/visual-workspace-store.ts` | activeLayers→activeOverlays, toggleLayer→toggleOverlay | LCP-010 |
| `apps/web/src/lib/palette-data.ts` | Update NODE_TYPE_LABELS, EDGE_TYPE_LABELS | LCP-010/LCP-012 |
| `apps/web/.../node-palette.tsx` | Update NODE_TYPE_ICONS | LCP-010/LCP-012 |

---

## 8. Scope types (navigation levels)

| Old scope | New scope | Level | Canvas view |
|-----------|----------|-------|-------------|
| company | company | L1 | Company + CEO + departments + strategic overlays |
| department | department | L2 | Department + executive + teams + area workflows |
| workflow | *(subsumed)* | — | Workflows appear as overlay or drill-in |
| workflow-stage | *(subsumed)* | — | Stages appear as workflow detail |
| *(new)* | team | L3 | Team + lead + specialists + handoffs |
| *(new)* | agent-detail | L4 | Agent definition + tasks + triggers + contracts + runs |

---

## 9. Interacción con otros docs del pivot

| Doc | Relación con LCP-003 |
|-----|---------------------|
| docs/33 (domain model) | LCP-003 usa los nombres de entidades definidos ahí |
| docs/34 (canvas v3) | LCP-003 concreta las decisiones de lenguaje que docs/34 sugiere |
| docs/41 (ADR preserve/adapt/deprecate) | LCP-003 es la spec que materializa la sección 2.2 de docs/41 |
| docs/35 (growth protocol) | Proposals y decisions se incorporan como nodos en overlay Rules |
| docs/36 (runtime/live mode) | Live Status overlay se alinea con el runtime spec |

---

## 10. Criterios de aceptación

- [ ] Este documento cubre todos los términos de producto old→new.
- [ ] Cada overlay tiene membership explícita (nodos + aristas).
- [ ] Los componentes UI afectados están identificados con su cambio.
- [ ] El vocabulario es consistente con docs/33, docs/34 y docs/41.
- [ ] No se introduce ningún término que contradiga la estructura UO + agents.
- [ ] Los presets se reducen de 7 a 5.
- [ ] Organization es siempre activo y no desactivable.
- [ ] Design Mode / Live Mode están definidos como toggle.
- [ ] El documento es autocontenido para que LCP-010 pueda aplicar los cambios documentales y de labels.
