---
name: tc-next
description: Sincroniza backlog/task registry y devuelve la siguiente tarea ejecutable sin pedir prompt adicional
argument-hint: ""
---

Objetivo: decidir la siguiente tarea de TheCrew de forma consistente con el pivot visual-first.

Instrucciones:
1. Leer `CLAUDE.md`.
2. Leer `docs/03-backlog-completo.md`.
3. Leer `docs/09-task-registry.md`.
4. Si hace falta contexto adicional, leer `docs/06-analisis-estado-actual.md`.
5. Identificar la siguiente tarea desbloqueada.
6. Responder **exactamente** con este formato:
   - `next-task:` task-id
   - `why-now:` explicación corta
   - `depends-on:` dependencias ya satisfechas o faltantes
   - `recommended-mode:` plan|edit
   - `fresh-session:` yes|no
   - `parallelizable-now:` lista de task-id que puedan desarrollarse a la vez sin bloquearse mutuamente, o `none`
   - `run-now:` `/tc-run <task-id>`
   - `restart-with:` `.claude/bin/tc-plan` | `.claude/bin/tc-edit` | `not-needed`
   - `notes:` riesgos y foco
7. No pedir ninguna aclaración ni prompt adicional.
8. No empezar a implementar nada. Solo sincronizar y decidir.
9. Si detectas desalineación entre backlog y task registry, incluirla en `notes:`.
