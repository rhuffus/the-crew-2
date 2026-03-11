---
name: tc-run
description: Ejecuta una tarea concreta del task registry Canvas Editor v2 de forma autosuficiente
argument-hint: "<task-id>"
---

Objetivo: ejecutar la tarea `$ARGUMENTS`.

Instrucciones:
1. Resolver `$ARGUMENTS` en `docs/09-task-registry.md`.
2. Leer la tarea, dependencias y modo recomendado.
3. Leer solo el contexto mínimo necesario entre:
   - `docs/17-canvas-editor-v2-gap-analysis.md`
   - `docs/18-canvas-editor-v2-spec.md`
   - `docs/19-canvas-editor-v2-acceptance-checklist.md`
   - archivos del repo tocados por la tarea
4. Si la tarea no existe, responder pidiendo un task-id válido del registry.
5. Si faltan dependencias, no implementar. Explicar el bloqueo de forma concreta.
6. Si `fresh-session` es `yes` y la sesión actual no es adecuada, decirlo al principio de forma explícita y recomendar reiniciar con el wrapper correcto.
7. Si la tarea es ejecutable en la sesión actual:
   - ejecutar el alcance sin pedir prompt adicional
   - mantener el enfoque visual-first
   - no desviarse a tareas vecinas no incluidas
   - ejecutar `/quality-gate` al final
   - actualizar `docs/09-task-registry.md` si cambia el estado real
8. Al empezar, responder con este bloque:
   - `task:` task-id
   - `status:` executable|blocked
   - `mode:` plan|edit
   - `fresh-session-required:` yes|no
   - `scope-docs:` lista corta de ficheros leídos
   - `execution-contract:` self-contained
9. Solo pedir intervención humana adicional si existe una decisión de producto no resuelta, una dependencia externa real o un bloqueo técnico fuera del repo.
10. El cierre debe incluir:
   - qué se ha hecho
   - qué no se ha hecho
   - resultados del quality gate
   - si conviene nueva sesión antes de la siguiente tarea
