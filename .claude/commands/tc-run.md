---
name: tc-run
description: Ejecuta una tarea concreta del task registry de forma autosuficiente
argument-hint: "<task-id>"
---

Objetivo: ejecutar la tarea `$ARGUMENTS`.

Instrucciones:
1. Resolver `$ARGUMENTS` en `docs/09-task-registry.md`.
2. Leer la tarea, dependencias y modo recomendado.
3. Si la tarea no existe, responder pidiendo un task-id válido del registry.
4. Si faltan dependencias, no implementar. Explicar el bloqueo de forma concreta.
5. Si `fresh-session` es `yes` y la sesión actual no es adecuada, decirlo al principio de forma explícita y recomendar reiniciar con el wrapper correcto.
6. Si la tarea es ejecutable en la sesión actual:
   - leer solo el contexto mínimo relevante
   - ejecutar el alcance de la tarea sin pedir prompt adicional
   - mantener el enfoque visual-first
   - no desviarse a tareas vecinas no incluidas
   - ejecutar `/quality-gate` al final
   - actualizar `docs/09-task-registry.md` si cambia el estado real
7. Al empezar, responder con este bloque:
   - `task:` task-id
   - `status:` executable|blocked
   - `mode:` plan|edit
   - `fresh-session-required:` yes|no
   - `scope-docs:` lista corta de ficheros leídos
   - `execution-contract:` self-contained
8. Solo pedir intervención humana adicional si existe una decisión de producto no resuelta, una dependencia externa real o un bloqueo técnico fuera del repo.
9. El cierre debe incluir:
   - qué se ha hecho
   - qué no se ha hecho
   - resultados del quality gate
   - si conviene nueva sesión antes de la siguiente tarea
