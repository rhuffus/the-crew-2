# Playbook de Claude Code para TheCrew (visual-first, sin prompts manuales)

## Objetivo
Usar Claude Code como sistema de ejecución disciplinado para desarrollar TheCrew por tareas pequeñas, con una sesión limpia por tarea siempre que merezca la pena, y con un flujo donde el usuario solo tenga que lanzar slash commands.

## Principio operativo
El usuario no debería tener que redactar prompts de coordinación.
El contrato deseado es:
- `/tc-next` decide
- `/tc-run <task-id>` ejecuta

## Reglas operativas
1. Antes de implementar, ejecutar `/tc-next` o recibir un task-id explícito.
2. No empezar una tarea grande en modo edición si antes no pasó por plan.
3. Preferir una tarea por sesión.
4. Si la tarea toca muchos archivos, canvas + BFF + tests, abrir una sesión nueva.
5. Antes de cerrar, ejecutar `/quality-gate`.
6. Si cambian roadmap, arquitectura o semántica visual, actualizar docs.
7. `/tc-run` no debe pedir prompt adicional salvo bloqueo real.

## Comandos recomendados
- `/tc-next`
- `/tc-run <task-id>`
- `/quality-gate`
- `/domain-check`
- `/release-readiness`

## Modo de sesión recomendado
### Planificación
Usar `.claude/bin/tc-plan`

Cuándo:
- tareas nuevas
- refactors amplios
- cambios de arquitectura
- canvas / semantic zoom / graph model

### Implementación
Usar `.claude/bin/tc-edit`

Cuándo:
- tarea pequeña y clara
- slice vertical bien definida
- cambio localizado

## Criterio de done
Una tarea está done si:
- código implementado
- lint/typecheck verdes
- tests verdes
- cobertura del scope al 100%
- docs actualizadas si cambió comportamiento o roadmap
- estado de la tarea actualizado en `docs/09-task-registry.md`

## Qué debe hacer `/tc-next`
- leer backlog y task registry
- detectar siguiente tarea desbloqueada
- indicar dependencias
- indicar si conviene fresh session
- indicar si la tarea debe empezar en Plan Mode o puede ir en Edit Mode
- listar tareas paralelizables si las hay
- devolver `run-now: /tc-run <task-id>`
- no pedir una instrucción humana adicional

## Qué debe hacer `/tc-run <task-id>`
- resolver la tarea en `docs/09-task-registry.md`
- validar dependencias
- leer solo el contexto mínimo relevante
- seguir el criterio de implementación de esa tarea
- respetar gates de calidad
- actualizar docs/registry al terminar
- no pedir un prompt adicional salvo bloqueo real

## Respuesta esperada de `/tc-next`
```text
next-task: VIS-001
why-now: ...
depends-on: ...
recommended-mode: plan
fresh-session: yes
parallelizable-now: VIS-002, VIS-004
run-now: /tc-run VIS-001
restart-with: .claude/bin/tc-plan
notes: ...
```

## Respuesta esperada de `/tc-run <task-id>` al inicio
```text
task: VIS-001
status: executable
mode: plan
fresh-session-required: yes|no
scope-docs: ...
execution-contract: self-contained
```

## Subagentes principales
- architect
- domain-designer
- graph-read-modeler
- diagram-editor-lead
- frontend-lead
- backend-lead
- test-guardian
- delivery-orchestrator

## Notas importantes
La documentación oficial actual de Claude Code describe memoria de proyecto con `CLAUDE.md`, comandos/skills definidos en Markdown, hooks de `SessionStart`, y que cada sesión empieza con contexto nuevo. También documenta el arranque en plan mode por CLI y los cambios de permission mode en la interfaz interactiva. Eso hace viable este flujo basado en memoria + slash commands + higiene de sesión. 
