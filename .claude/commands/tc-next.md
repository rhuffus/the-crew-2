---
name: tc-next
description: Sincroniza el backlog actual de TheCrew y devuelve la siguiente tarea ejecutable sin pedir prompt adicional
argument-hint: ""
---

Objetivo: decidir la siguiente tarea correcta de la fase activa.

Instrucciones:
1. Leer `CLAUDE.md`.
2. Detectar la fase activa:
   - si el proyecto está en **Live Company Pivot**, leer `docs/39-live-company-task-registry.md` y `docs/38-live-company-backlog-v5.md`
   - si no, usar el registry/backlog activos anteriores
3. Leer además, cuando aplique:
   - `docs/31-live-company-pivot-decision.md`
   - `docs/33-live-company-domain-model.md`
   - `docs/34-live-company-canvas-v3-spec.md`
   - `docs/35-live-company-growth-protocol.md`
   - `docs/36-live-company-runtime-live-mode-spec.md`
4. Identificar la siguiente tarea desbloqueada.
5. Responder exactamente con este formato:
   - `next-task:` task-id
   - `why-now:` explicación corta
   - `depends-on:` dependencias satisfechas o faltantes
   - `recommended-mode:` plan|edit
   - `fresh-session:` yes|no
   - `parallelizable-now:` lista de task-id o `none`
   - `run-now:` `/tc-run <task-id>`
   - `restart-with:` `.claude/bin/tc-plan` | `.claude/bin/tc-edit` | `not-needed`
   - `notes:` riesgos, foco y sincronización documental requerida
6. No pedir prompt adicional.
7. No empezar a implementar nada.
