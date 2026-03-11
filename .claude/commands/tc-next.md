---
name: tc-next
description: Sincroniza el backlog Canvas Editor v2 y devuelve la siguiente tarea ejecutable sin pedir prompt adicional
argument-hint: ""
---

Objetivo: decidir la siguiente tarea de TheCrew de forma consistente con Canvas Editor v2.

Instrucciones:
1. Leer `CLAUDE.md`.
2. Leer `docs/17-canvas-editor-v2-gap-analysis.md`.
3. Leer `docs/18-canvas-editor-v2-spec.md`.
4. Leer `docs/03-backlog-completo.md`.
5. Leer `docs/09-task-registry.md`.
6. Identificar la siguiente tarea desbloqueada.
7. Responder **exactamente** con este formato:
   - `next-task:` task-id
   - `why-now:` explicación corta
   - `depends-on:` dependencias ya satisfechas o faltantes
   - `recommended-mode:` plan|edit
   - `fresh-session:` yes|no
   - `parallelizable-now:` lista de task-id que puedan desarrollarse a la vez sin bloquearse mutuamente, o `none`
   - `run-now:` `/tc-run <task-id>`
   - `restart-with:` `.claude/bin/tc-plan` | `.claude/bin/tc-edit` | `not-needed`
   - `notes:` riesgos y foco
8. No pedir ninguna aclaración ni prompt adicional.
9. No empezar a implementar nada. Solo sincronizar y decidir.
10. Si detectas desalineación entre backlog y task registry, incluirla en `notes:`.
