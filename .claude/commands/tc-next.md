---
name: tc-next
description: Sincroniza el backlog actual de TheCrew y devuelve la siguiente tarea ejecutable sin pedir prompt adicional
argument-hint: ""
---

Objetivo: decidir la siguiente tarea correcta para TheCrew en la fase actual.

Instrucciones:
1. Leer `CLAUDE.md`.
2. Leer `docs/03-backlog-completo.md`.
3. Leer `docs/09-task-registry.md`.
4. Leer `docs/25-verticaler-reference-company-spec.md`.
5. Si la tarea afecta al canvas, leer también `docs/18-canvas-editor-v2-spec.md`.
6. Identificar la siguiente tarea desbloqueada.
7. Responder exactamente con este formato:
   - `next-task:` task-id
   - `why-now:` explicación corta
   - `depends-on:` dependencias satisfechas o faltantes
   - `recommended-mode:` plan|edit
   - `fresh-session:` yes|no
   - `parallelizable-now:` lista de task-id o `none`
   - `run-now:` `/tc-run <task-id>`
   - `restart-with:` `.claude/bin/tc-plan` | `.claude/bin/tc-edit` | `not-needed`
   - `notes:` riesgos, foco y sincronización documental requerida
8. No pedir prompt adicional.
9. No empezar a implementar nada.
