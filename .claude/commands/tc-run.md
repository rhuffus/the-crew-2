---
name: tc-run
description: Ejecuta una tarea concreta del task registry activo de forma autosuficiente
argument-hint: "<task-id>"
---

Objetivo: ejecutar la tarea `$ARGUMENTS`.

Instrucciones:
1. Resolver `$ARGUMENTS` primero en `docs/71-visual-shell-task-registry.md`.
2. Si no existe ahi, mirar `docs/66-ai-runtime-task-registry.md` y registries anteriores.
3. Leer la tarea, dependencias y modo recomendado.
4. Leer solo el contexto minimo necesario entre:
   - `docs/69-visual-shell-redesign-spec.md`
   - `docs/70-visual-shell-backlog-v7.md`
   - `docs/59-ceo-interactive-bootstrap-runtime-spec.md`
   - `docs/60-foundation-documents-spec.md`
   - `docs/61-markdown-document-system-spec.md`
   - `docs/62-claude-container-runtime-spec.md`
   - `docs/63-temporal-orchestration-spec.md`
   - `docs/64-basic-autonomous-work-spec.md`
   - archivos del repo afectados
5. Si faltan dependencias, no implementar y explicar el bloqueo.
6. Si `fresh-session` es `yes`, indicarlo al principio.
7. Ejecutar el alcance sin pedir prompt adicional.
8. Ejecutar `/quality-gate` al final.
9. Si la tarea cambia el estado real del roadmap, actualizar registry/backlog/docs relacionadas.

Bloque inicial obligatorio:
- `task:`
- `status: executable|blocked`
- `mode:`
- `fresh-session-required:`
- `scope-docs:`
- `execution-contract: self-contained`

Cierre obligatorio:
- que se ha hecho
- que no se ha hecho
- resultados del quality gate
- si conviene nueva sesion antes de la siguiente tarea
