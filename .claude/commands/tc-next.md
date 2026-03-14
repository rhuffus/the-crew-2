---
name: tc-next
description: Sincroniza el backlog activo y devuelve la siguiente tarea ejecutable sin prompt adicional
argument-hint: ""
---

Objetivo: decidir la siguiente tarea correcta de la fase activa.

Instrucciones:
1. Leer `CLAUDE.md`.
2. Si la fase activa es **Visual Shell Redesign**, leer:
   - `docs/71-visual-shell-task-registry.md`
   - `docs/70-visual-shell-backlog-v7.md`
   - `docs/69-visual-shell-redesign-spec.md`
3. Si no hay tareas pendientes en el registry activo, buscar en registries anteriores:
   - `docs/66-ai-runtime-task-registry.md`
   - `docs/65-ai-runtime-backlog-v6.md`
4. Leer ademas, cuando aplique:
   - `docs/59-ceo-interactive-bootstrap-runtime-spec.md`
   - `docs/60-foundation-documents-spec.md`
   - `docs/61-markdown-document-system-spec.md`
5. Identificar la siguiente tarea desbloqueada.
6. Responder exactamente con:
   - `next-task:`
   - `why-now:`
   - `depends-on:`
   - `recommended-mode:`
   - `fresh-session:`
   - `parallelizable-now:`
   - `run-now:`
   - `restart-with:`
   - `notes:`
7. No pedir prompt adicional.
8. No empezar implementacion.
