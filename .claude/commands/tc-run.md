---
name: tc-run
description: Ejecuta una tarea concreta del task registry actual de forma autosuficiente
argument-hint: "<task-id>"
---

Objetivo: ejecutar la tarea `$ARGUMENTS`.

Instrucciones:
1. Resolver `$ARGUMENTS` en el registry de la fase activa:
   - priorizar `docs/39-live-company-task-registry.md` si la fase es Live Company Pivot
   - si no, usar el registry anterior
2. Leer la tarea, dependencias y modo recomendado.
3. Leer solo el contexto mínimo necesario entre:
   - `docs/31-live-company-pivot-decision.md`
   - `docs/32-live-company-repo-analysis.md`
   - `docs/33-live-company-domain-model.md`
   - `docs/34-live-company-canvas-v3-spec.md`
   - `docs/35-live-company-growth-protocol.md`
   - `docs/36-live-company-runtime-live-mode-spec.md`
   - `docs/37-live-company-migration-strategy.md`
   - archivos del repo afectados por la tarea
4. Si la tarea no existe, responder pidiendo un task-id válido.
5. Si faltan dependencias, no implementar y explicar el bloqueo.
6. Si `fresh-session` es `yes` y la sesión actual no es adecuada, decirlo al principio.
7. Si la tarea es ejecutable:
   - ejecutar el alcance sin pedir prompt adicional
   - no abrir nuevas funcionalidades ajenas al pivot actual
   - mantener sincronizada la documentación afectada
   - ejecutar `/quality-gate` al final
   - actualizar registry/backlog si cambia el estado real
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
