# Canvas Editor v3 — Live Company

## Objetivo
Convertir el canvas en el mapa principal de una empresa viva, no en una agregación de capas abstractas.

## Principio UX principal
La vista base del canvas es la **estructura organizativa viva**.

El usuario debe poder entender la empresa preguntándose:
- quién existe
- quién lidera qué
- quién trabaja con quién
- qué está ocurriendo ahora

## Vista base del canvas
La vista por defecto muestra:

- Company UO
- Department UOs
- Team UOs
- Coordinator Agents responsables
- Specialist Agents dentro de equipos
- relaciones estructurales y de colaboración principales

## Regla de legibilidad
No exponer todo a la vez.
Lo no estructural se muestra como:
- overlay
- filtro
- panel derecho
- drill-in
- timeline/runtime

## Nodos principales

### Organizational nodes
- Company
- Department
- Team

### Agent nodes
- CEO
- Department Executive
- Team Lead
- Specialist Agent

### Trigger / context nodes
- Objective
- Event Trigger
- External Source

### Workflow nodes
- Workflow
- Workflow Stage
- Handoff

### Support nodes
- Contract
- Artifact
- Policy
- Decision
- Proposal

## Relaciones visuales

### 1. Estructurales
Persisten siempre y tienen estilo neutro:
- contains
- belongs_to
- reports_to

### 2. Workflow / collaboration
Tienen color por workflow:
- requests_from
- delegates_to
- hands_off_to
- reviews
- approves
- informs
- escalates_to
- triggers

### 3. Governance
Estilo discreto:
- constrained_by
- governed_by
- approved_by

## Regla visual crítica
Separar claramente:
- jerarquía organizativa
- comunicación/workflow

Si no se distinguen visualmente, el canvas se vuelve ilegible.

## Niveles de navegación

### L1 — Company
- Company
- CEO
- Departments
- principales objectives
- principales workflows estratégicos
- señales externas relevantes

### L2 — Department
- Department
- Executive
- Teams
- relaciones con otros departments
- workflows del área
- decisiones y artefactos relevantes

### L3 — Team
- Team
- Team Lead
- Specialists
- handoffs internos y con otros equipos
- eventos y objetivos inmediatos

### L4 — Agent / Workflow Detail
- definición del agente
- tasks
- triggers
- contratos
- outputs
- runs recientes
- logs/resumen

## Panel derecho
Al seleccionar un nodo:
- identidad
- propósito
- owner o responsable
- inputs
- outputs
- workflows
- contratos
- artefactos
- policies
- proposals
- estado runtime

Al seleccionar un enlace de workflow:
- workflow
- tipo de handoff
- contrato
- documentos de ida/vuelta
- DoD
- validaciones
- SLA
- estado vivo
- últimas ejecuciones

## Overlays en lugar de capas principales
El lenguaje recomendado ya no debe ser “layers” como idea central de producto.
Internamente puede seguir habiendo `LayerId`, pero de cara al producto conviene hablar de:

- Organization
- Work
- Deliverables
- Rules
- Live Status

### Organization
estructura base

### Work
workflows y handoffs

### Deliverables
artefactos y documentos

### Rules
contracts y policies

### Live Status
actividad, locks, review, runtime, errores, esperas

## Filtros prioritarios
- por workflow
- por UO
- por agente responsable
- por estado runtime
- por tipo de nodo
- por validaciones
- por propuestas pendientes
- por added/removed/changed en diff

## Toolbar
Debe priorizar:
- crear Department
- crear Team
- crear Coordinator Agent
- crear Specialist Agent
- crear Objective
- crear Event Trigger
- crear Workflow
- crear External Source
- activar overlays
- filtrar workflows
- cambiar a modo live
- fit / layout / saved view

## Modo Design vs Live
El mismo canvas debe soportar dos modos:

### Design Mode
define estructura, relaciones, contratos, documentos, reglas

### Live Mode
muestra:
- runs
- comunicaciones
- outputs generados
- decisiones
- bloqueos
- errores
- actividad en tiempo real

## Cursor Interaction Contract

The canvas cursor behavior is permanent and invariable. It relies on XYFlow's built-in CSS classes with two overrides in `apps/web/src/index.css`.

| State | Cursor | CSS source |
|---|---|---|
| Pane idle | `default` (arrow) | Override: `.react-flow__pane.draggable:not(.dragging) { cursor: default }` |
| Node/edge hover | `pointer` (hand + finger) | Override: `.react-flow__node.draggable:not(.dragging) { cursor: pointer }` + XYFlow `.selectable` |
| Pane panning (click-hold) | `grabbing` (closed hand) | XYFlow: `.react-flow__pane.dragging { cursor: grabbing }` |
| Node dragging (click-hold) | `grabbing` (closed hand) | XYFlow: `.react-flow__node.draggable.dragging { cursor: grabbing }` |

### Cursor rules
- **No Tailwind cursor overrides** on the canvas wrapper div. All cursor behavior is managed via CSS cascade.
- The two override rules use `:not(.dragging)` so they only apply in idle state. During drag, XYFlow's `.dragging { cursor: grabbing }` takes over unopposed.
- E2E tests in `e2e/canvas-cursor.test.ts` validate all five states.

### Node drag position preservation
- ReactFlow handles visual node movement internally during drag — no React state updates per frame.
- `CanvasViewport` uses a `dragPositionsRef` (mutable ref) to capture positions via `onNodeDrag` and `onNodeDragStop`. This ref is only read if something else triggers a re-render mid-drag (e.g. selection change), preventing snap-back without causing flicker.
- The ref is cleared when `externalNodes` changes (new graph data, auto-layout) so fresh positions take effect.
- `onNodeDragStop` persists final positions to the backend when configured.
- **Never use useState for per-frame drag positions** — state updates at 60fps cause full re-renders and visible flicker.

### Click selection
- `onNodeClick` explicitly calls `selectNodes([node.id])` in normal mode (no edge-creation in progress). This ensures the inspector updates immediately on single click.
- `onEdgeClick` explicitly calls `selectEdges([edge.id])` for the same reason.
- `onSelectionChange` remains as a secondary sync mechanism (handles multi-select, deselect, keyboard selection).

### Performance contract
The canvas must stay fluid at 60fps during drag operations. These rules are mandatory:

1. **Individual zustand selectors** — `CanvasViewport` subscribes to each state slice separately (`useStore((s) => s.selectedNodeIds)`) instead of the full store. This prevents re-renders from unrelated mutations (inspector toggle, chat dock, overlays, etc.).

2. **Store mutation guards** — `selectNodes`, `selectEdges`, and `clearSelection` compare against current state and skip `set()` if nothing changed. This prevents cascading re-renders from redundant `onSelectionChange` callbacks.

3. **getState() for actions** — All event handler callbacks access store actions via `useVisualWorkspaceStore.getState()` inside the callback body, not from closure. This gives every callback an empty (or minimal) dependency array, making callback identities stable across renders.

4. **Stable node data references** — `renderNodes` only creates a new `data` object when `connectionDimmed` or `connectionHighlight` actually changed. When no connection is pending (the common case), every node keeps its original `data` reference, and `React.memo` on `VisualNode` can skip re-renders.

5. **Constant object references** — `connectionLineStyle`, `proOptions`, and other static config objects are defined at module scope, not inline in JSX.

## Regla de producto
El usuario no debería sentir que está editando una ontología.
Debe sentir que está viendo y gobernando una empresa.
