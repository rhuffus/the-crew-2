# Task Registry — Canvas Editor v2

## Leyenda
- status: todo | in-progress | done | blocked
- mode: plan | edit
- fresh-session: yes | no
- parallel-group: tareas del mismo grupo que pueden ejecutarse en paralelo si no comparten archivos o decisiones bloqueantes

| task-id | epic | status | mode | fresh-session | parallel-group | depends-on | objetivo |
|---|---:|---|---|---|---|---|---|
| CAV-001 | 36 | done | plan | yes | A | - | Documentar el gap real del canvas actual y fijar la baseline de Canvas Editor v2. |
| CAV-002 | 36 | done | plan | yes | A | CAV-001 | Redactar la especificación exhaustiva del Canvas Editor v2. |
| CAV-003 | 36 | done | plan | yes | A | CAV-001, CAV-002 | Reescribir backlog y task registry para la fase Canvas Editor v2. |
| CAV-004 | 36 | done | edit | yes | B | CAV-003 | Reparar la base actual del canvas: wiring real de relationship mutations, contrato correcto de capas/fetch en todos los scopes, eliminación del límite artificial de navegación y feedback consistente de estado pendiente. |
| CAV-005 | 37 | done | edit | yes | C | CAV-004 | Implementar modos de interacción del canvas y una toolbar avanzada (select/pan/connect/add-node/add-edge), sustituyendo la toolbar mínima actual. |
| CAV-006 | 37 | done | edit | yes | C | CAV-004 | Implementar paleta tipada de nodos y paleta tipada de relaciones como fuente única de creación desde canvas. |
| CAV-007 | 38 | done | edit | yes | D | CAV-004 | Convertir el inspector en un motor de formularios tipados para nodos y edges, de forma que toda la configuración editable viva en el panel derecho. |
| CAV-008 | 37 | done | edit | yes | D | CAV-005, CAV-006 | Añadir context menus, quick actions y acciones de selección/multiselección con semántica real. |
| CAV-009 | 37 | done | edit | yes | E | CAV-005 | Añadir keyboard shortcuts y undo/redo del editor visual. |
| CAV-010 | 39 | done | plan | yes | F | CAV-004 | Diseñar el scope model genérico que reemplace la rigidez org/department/workflow y defina multi-level real. Output: `docs/20-generic-scope-model-spec.md`. |
| CAV-011 | 39 | done | edit | yes | F | CAV-010 | Implementar navegación multinivel genérica, L4 real y breadcrumbs/historial profundos. |
| CAV-012 | 40 | done | plan | yes | G | CAV-007, CAV-010 | Diseñar presets de vista (organization, capabilities, workflows, contracts, artifacts, governance, operations) y el modelo de artifact flow. Output: `docs/22-view-presets-artifact-flow-spec.md`. |
| CAV-013 | 40 | done | edit | yes | G | CAV-012 | Implementar view presets y artefactos como nodos/capa/inspector de primer nivel. |
| CAV-014 | 41 | done | edit | yes | H | CAV-004 | Sustituir el pseudo auto-layout por layout real y persistencia de posiciones/layout por scope. |
| CAV-015 | 41 | done | edit | yes | H | CAV-014 | Llevar saved views a persistencia compartida de proyecto y desacoplarlas de localStorage como único soporte. |
| CAV-016 | 42 | done | plan | yes | I | CAV-007, CAV-010 | Diseñar el modelo real de chat persistente por scope (company, department, workflow, node). Output: `docs/21-persistent-chat-spec.md`. |
| CAV-017 | 42 | done | edit | yes | I | CAV-016 | Implementar el chat persistente real y sustituir el dock placeholder actual. |
| CAV-018 | 43 | done | plan | yes | J | CAV-011, CAV-013 | Diseñar el operations overlay sobre el canvas. Output: `docs/23-operations-overlay-spec.md`. |
| CAV-019 | 43 | done | edit | yes | J | CAV-018 | Implementar runs/queues/incidents/live states como overlays visuales. |
| CAV-020 | 44 | done | edit | yes | K | CAV-007, CAV-017 | Implementar enforcement real de permisos de canvas y chat. |
| CAV-021 | 44 | done | edit | yes | K | CAV-020 | Añadir colaboración básica: comentarios/review/locks y señales de presencia si se considera dentro de scope. |
| CAV-022 | 45 | done | plan | yes | L | CAV-011, CAV-014, CAV-017, CAV-019, CAV-020 | Hardening final: performance, accessibility, recovery/autosave y refuerzo e2e/playwright. Plan: `docs/24-cav-022-hardening-plan.md`. |
| CAV-022a | 45 | done | edit | yes | L | CAV-022 (plan) | Performance hardening: memoize canvas-viewport node/edge arrays, Zustand selectors en rutas, single-pass workflow layout filter. |
| CAV-022b | 45 | done | edit | yes | L | CAV-022 (plan) | Accessibility hardening: dialog roles + focus traps, tab semantics (inspector/explorer), context menu roles, toggle states, form labels. |
| CAV-022c | 45 | done | edit | yes | L | CAV-022 (plan) | Recovery & robustness: error boundary, mutation error feedback, beforeunload warning, workflow route persistence parity. |
| CAV-022d | 45 | done | edit | yes | L | CAV-022 (plan) | E2E test foundation: Playwright setup + 5–8 critical-path canvas tests. |

## Contrato de uso con Claude Code
- `/tc-next` debe leer este archivo y devolver la siguiente tarea desbloqueada sin pedir prompt extra.
- `/tc-run <task-id>` debe ejecutar la tarea indicada sin pedir prompt extra, salvo bloqueo real.
- Si `fresh-session = yes` y la sesión actual ya arrastra otra tarea o mucho contexto, Claude debe indicarlo al principio y recomendar reinicio inmediato antes de seguir.

## Estado actual
Todos los slices de CAV-022 están completados. **Canvas Editor v2 está completo.**

### Resumen de CAV-022 slices
- **CAV-022a** DONE — performance: useMemo en canvas-viewport (nodesWithState/edgesWithSelection/effectivePendingConnection), Zustand selectors individuales en rutas (org/dept/workflow/workflow-canvas), single-pass layoutWorkflowGraph
- **CAV-022b** DONE — accessibility: ARIA roles, focus traps, tab semantics
- **CAV-022c** DONE — recovery: error boundary, mutation errors, beforeunload
- **CAV-022d** DONE — e2e: Playwright setup + critical-path tests
