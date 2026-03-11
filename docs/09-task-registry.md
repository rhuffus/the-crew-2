# Task Registry — Verticaler + Polish

## Leyenda
- status: todo | in-progress | done | blocked
- mode: plan | edit
- fresh-session: yes | no
- parallel-group: tareas del mismo grupo que pueden ejecutarse en paralelo si no comparten archivos o decisiones bloqueantes

| task-id | epic | status | mode | fresh-session | parallel-group | depends-on | objetivo |
|---|---:|---|---|---|---|---|---|
| VRT-001 | 46 | todo | plan | yes | A | - | Redactar y fijar la especificación canónica de Verticaler como empresa de referencia viva y documentar su regla de sincronización con spec/backlog. |
| VRT-002 | 47 | todo | plan | yes | A | VRT-001 | Auditar el estado real de persistencia/bootstrapping del repo y definir una estrategia honesta para crear Verticaler mediante migraciones o data bootstrap idempotente. |
| VRT-003 | 46 | todo | edit | yes | B | VRT-001, VRT-002 | Implementar la creación automática de Verticaler cuando la instancia arranca vacía, en el punto correcto de bootstrap. |
| VRT-004 | 46 | todo | edit | yes | B | VRT-003 | Poblar Verticaler con company model, departments, capabilities, roles, agents, skills, contracts, workflows, policies y artifacts mínimos coherentes con el canvas spec. |
| VRT-005 | 49 | todo | plan | yes | C | VRT-001, VRT-004 | Crear una matriz de cobertura entre `docs/18-canvas-editor-v2-spec.md` y Verticaler para garantizar que la empresa de referencia cubre las vistas y recorridos principales. |
| POL-001 | 48 | todo | plan | yes | D | - | Revisar el estado actual del repo y fijar una lista priorizada de correcciones de polish sin nuevas funcionalidades de producto. |
| POL-002 | 48 | todo | edit | yes | E | POL-001 | Limpiar documentación principal (`CLAUDE.md`, backlog, registry, README si aplica) para reflejar la nueva fase Verticaler + Polish. |
| POL-003 | 48 | todo | edit | yes | E | POL-001 | Mejorar la higiene del repo: ignores, artefactos generados, packaging y ruido no deseado, sin tocar la superficie funcional. |
| POL-004 | 47 | todo | edit | yes | F | VRT-002 | Ajustar textos UX/documentación donde hoy se sugiera persistencia durable cuando todavía haya componentes in-memory o comportamiento efímero. |
| POL-005 | 49 | todo | edit | yes | F | VRT-004, VRT-005 | Crear un checklist manual de smoke testing sobre Verticaler para validar el arranque y el recorrido visual principal de TheCrew. |

## Contrato de uso con Claude Code
- `/tc-next` debe leer este archivo y devolver la siguiente tarea desbloqueada sin pedir prompt extra.
- `/tc-run <task-id>` debe ejecutar la tarea indicada sin pedir prompt extra, salvo bloqueo real.
- Si `fresh-session = yes` y la sesión actual ya arrastra otra tarea o mucho contexto, Claude debe indicarlo al principio y recomendar reinicio inmediato antes de seguir.

## Estado actual
Se abre una nueva fase del producto: **Verticaler + Polish**.
La prioridad inmediata es evitar que TheCrew arranque vacío y dejar una historia coherente de bootstrap, documentación y pulido.
