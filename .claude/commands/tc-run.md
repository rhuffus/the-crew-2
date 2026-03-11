---
name: tc-run
description: Ejecuta una tarea concreta del task registry actual de forma autosuficiente
argument-hint: "<task-id>"
---

Objetivo: ejecutar la tarea `$ARGUMENTS`.

Instrucciones:
1. Resolver `$ARGUMENTS` en `docs/09-task-registry.md`.
2. Leer la tarea, dependencias y modo recomendado.
3. Leer solo el contexto mínimo necesario entre:
   - `docs/25-verticaler-reference-company-spec.md`
   - `docs/26-current-state-polish-review.md`
   - `docs/18-canvas-editor-v2-spec.md`
   - `docs/19-canvas-editor-v2-acceptance-checklist.md`
   - archivos del repo afectados por la tarea
4. Si la tarea no existe, responder pidiendo un task-id válido.
5. Si faltan dependencias, no implementar y explicar el bloqueo.
6. Si `fresh-session` es `yes` y la sesión actual no es adecuada, decirlo al principio.
7. Si la tarea es ejecutable:
   - ejecutar el alcance sin pedir prompt adicional
   - no abrir nuevas funcionalidades ajenas a la tarea
   - mantener sincronizada la documentación afectada
   - ejecutar `/quality-gate` al final
   - actualizar `docs/09-task-registry.md` si cambia el estado real
8. Bloque inicial obligatorio:
   - `task:` task-id
   - `status:` executable|blocked
   - `mode:` plan|edit
   - `fresh-session-required:` yes|no
   - `scope-docs:` lista corta de ficheros leídos
   - `execution-contract:` self-contained
9. Cierre obligatorio:
   - qué se ha hecho
   - qué no se ha hecho
   - resultados del quality gate
   - si conviene nueva sesión antes de la siguiente tarea
