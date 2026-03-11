# TheCrew

TheCrew es una plataforma multi-proyecto para diseñar, gobernar y operar empresas autónomas versionadas.
Cada proyecto representa una empresa concreta.

## Reenfoque actual
TheCrew ya no debe evolucionar como un panel CRUD con visualizaciones.
La prioridad actual es **Canvas Editor v2**.

## Principio rector de producto
El canvas debe convertirse en la interfaz principal desde la que se gestiona la empresa completa.
No es una vista secundaria.
No es una ilustración.
Es un editor visual semántico multinivel.

## Fuente de verdad
- Las entidades de dominio siguen siendo la verdad semántica.
- El canvas es la verdad de navegación y edición visual.
- El layout visual nunca introduce semántica.
- Las conexiones sí representan relaciones reales y tipadas.

## Prioridad actual
1. reparar la base actual del canvas
2. convertir el canvas en editor real
3. romper la rigidez org/department/workflow
4. introducir artifacts, chat y operations como piezas de primer nivel

## Regla dura
No seguir añadiendo features superficiales al canvas sin cerrar primero los defectos estructurales documentados en `docs/17-canvas-editor-v2-gap-analysis.md`.

## Flujo de trabajo con Claude Code
- `/tc-next`: sincroniza backlog y propone la siguiente tarea y paralelización posible
- `/tc-run <task-id>`: ejecuta una tarea concreta siguiendo gates y documentación
- `/quality-gate`: gate de calidad antes de cerrar tarea

## Contrato operativo de slash commands
### `/tc-next`
Debe:
- leer backlog y task registry actuales
- decidir la siguiente tarea desbloqueada
- indicar si conviene sesión nueva
- indicar si debe arrancarse en plan o edit
- listar tareas paralelizables
- devolver el comando exacto siguiente
- no pedir prompt humano adicional

### `/tc-run <task-id>`
Debe:
- resolver y validar la tarea en el registry
- leer el contexto mínimo suficiente
- ejecutar el alcance de la tarea sin pedir un prompt adicional
- bloquearse solo si faltan dependencias reales o hay una decisión externa imprescindible
- ejecutar quality gate al final
- actualizar el task registry si cambia el estado real

## Higiene de sesión
- Preferir una tarea por sesión.
- Si `/tc-next` indica `fresh-session: yes`, cerrar la sesión y abrir otra.
- Usar `.claude/bin/tc-plan` para planificación o tareas grandes.
- Usar `.claude/bin/tc-edit` para implementación cuando la tarea ya está clara.
- Si el contexto ya está contaminado, usar `/clear` o empezar una sesión nueva.
