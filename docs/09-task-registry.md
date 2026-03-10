# Task Registry — Visual-First Pivot

## Leyenda
- status: todo | in-progress | done | blocked
- mode: plan | edit
- fresh-session: yes | no
- parallel-group: tareas del mismo grupo que pueden ejecutarse en paralelo si no comparten archivos o decisiones bloqueantes

| task-id | epic | status | mode | fresh-session | parallel-group | depends-on | objetivo |
|---|---:|---|---|---|---|---|---|
| VIS-001 | 19 | done | plan | yes | A | - | Formalizar la adopción incremental del enfoque visual-first y congelar el CRUD actual como fallback administrativo. |
| VIS-002 | 20 | done | plan | yes | A | VIS-001 | Definir nodos, edges, reglas de conexión, capas y semantic zoom v1. |
| VIS-003 | 21 | done | plan | yes | B | VIS-002 | Definir el contrato del graph projection / visual read model v1. |
| VIS-004 | 22 | done | plan | yes | B | VIS-001 | Diseñar la nueva shell visual: canvas central, explorer, inspector, chat dock. |
| VIS-005 | 22 | done | edit | yes | C | VIS-003, VIS-004 | Implementar la ruta visual principal del workspace con placeholders reales y tests. |
| VIS-006 | 23 | done | edit | yes | C | VIS-005 | Implementar Company Org Canvas v1 con navegación básica. |
| VIS-007 | 24 | done | edit | yes | D | VIS-005 | Implementar Inspector v1 para nodos seleccionados. |
| VIS-008 | 25 | done | plan | yes | D | VIS-003, VIS-007 | Definir y luego implementar relación tipada v1 con edición desde inspector. Deliverables: ADR-006, docs/14-relationship-editing-v1-spec.md |
| VIS-008a | 25 | done | edit | yes | J | VIS-008 | Connection Validator + Mutation Resolver (pure utils, 145 tests) |
| VIS-008b | 25 | done | edit | yes | J | VIS-008a | Canvas connection handling: onConnect, handles, drag feedback, picker, metadata input (37 tests) |
| VIS-008c | 25 | done | edit | yes | K | VIS-008a | useRelationshipMutation hook + API integration (26 tests) |
| VIS-008d | 25 | done | edit | yes | K | VIS-008b, VIS-008c | Edge deletion + inspector editing: confirm dialog, delete button, editable metadata (35 tests) |
| VIS-008e | 25 | done | edit | yes | K | VIS-008d | Add-relationship from inspector: dialog, entity search, metadata form (20 tests) |
| VIS-009 | 26 | done | edit | yes | E | VIS-006, VIS-007 | Implementar drilldown de Department Canvas v1. |
| VIS-010 | 27 | done | edit | yes | E | VIS-003, VIS-005 | Implementar Workflow Canvas v1. |
| VIS-011 | 28 | done | plan | yes | F | VIS-006, VIS-009, VIS-010 | Diseñar semantic zoom y nested navigation v1. Deliverable: docs/15-semantic-zoom-v1-spec.md |
| VIS-011a | 28 | done | edit | yes | L | VIS-011 | Navigation store + breadcrumb enhancement (~30 tests) |
| VIS-011b | 28 | done | edit | yes | L | VIS-011a | Drilldown affordance + keyboard navigation (36 tests) |
| VIS-011c | 28 | done | edit | yes | M | VIS-011b | Transition animations (24 tests) |
| VIS-011d | 28 | done | edit | yes | L | VIS-011a | Collapse/expand container nodes (32 tests) |
| VIS-011e | 28 | done | edit | yes | L | VIS-011a | Cross-reference navigation (44 tests) |
| VIS-012 | 29 | done | edit | yes | F | VIS-007, VIS-010 | Implementar overlays de validación visual. |
| VIS-013 | 30 | done | edit | yes | G | VIS-006 | Añadir capas, filtros y persistencia básica de vista. |
| VIS-014 | 32 | done | edit | yes | G | VIS-005 | Sincronizar explorer y canvas. |
| VIS-015 | 33 | done | plan | yes | H | VIS-003, VIS-013 | Diseñar diff visual por release. Deliverables: ADR-007, docs/16-visual-diff-v1-spec.md |
| VIS-015a | 33 | done | edit | yes | N | VIS-015 | Shared types + pure visual-diff function + tests (34 tests) |
| VIS-015b | 33 | done | edit | yes | N | VIS-015a | GraphProjectionService.projectDiff + controller + module wiring + tests (23 tests) |
| VIS-015c | 33 | done | edit | yes | O | VIS-015b | Gateway BFF proxy for visual diff + tests (5 tests) |
| VIS-015d | 33 | done | edit | yes | N | VIS-015a | Frontend API + useVisualDiff hook + tests (8 tests) |
| VIS-015e | 33 | done | edit | yes | O | VIS-015c, VIS-015d | Diff canvas route + DiffSelector + layout + node/edge rendering + tests (40 tests) |
| VIS-015f | 33 | done | edit | yes | O | VIS-015e | Explorer diff badges + inspector Changes tab + store + filters + persistence + tests (39 tests) |
| VIS-016 | 31 | done | plan | yes | H | VIS-004 | Diseñar scopes de chat persistente y su modelo de datos. |
| VIS-017 | 34 | done | plan | yes | I | VIS-004 | Replantear permisos para canvas actions y chats por scope. |
| VIS-018 | 35 | done | plan | yes | I | VIS-010 | Diseñar cómo aparece runtime/operations sobre el canvas. |

## Contrato de uso con Claude Code
- `/tc-next` debe leer este archivo y devolver la siguiente tarea desbloqueada sin pedir prompt extra.
- `/tc-run <task-id>` debe ejecutar la tarea indicada sin pedir prompt extra, salvo bloqueo real.
- Si `fresh-session = yes` y la sesión actual ya arrastra otra tarea o mucho contexto, Claude debe indicarlo al principio y recomendar reinicio inmediato antes de seguir.

## Siguiente tarea recomendada hoy
- Epic 33 (Release-Aware Visual Diff) fully complete.
- All implementation tasks (VIS-015a through VIS-015f) done.
- Next: plan new tasks for Epics 31 (Scoped Chat), 34 (Auth), 35 (Operations), or 36 (Hardening).

## Primer bloque paralelizable realista
No pending implementation tasks. Need to plan new task slices.
