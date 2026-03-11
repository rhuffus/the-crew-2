# Flujo operativo con Claude Code

## Comando `/tc-next`
Debe hacer esto siempre:
1. leer `CLAUDE.md`
2. leer `docs/03-backlog-completo.md`
3. leer `docs/09-task-registry.md`
4. detectar siguiente tarea desbloqueada
5. indicar:
   - task-id
   - objetivo
   - dependencias
   - modo recomendado (`plan` o `edit`)
   - si conviene fresh session
   - tareas paralelizables
   - comando exacto a ejecutar después
6. no pedir prompt humano adicional

## Comando `/tc-run <task-id>`
Debe hacer esto siempre:
1. resolver la tarea en `docs/09-task-registry.md`
2. comprobar dependencias
3. comprobar si requiere plan previo
4. ejecutar la tarea en el scope acordado
5. ejecutar quality gate
6. actualizar documentación/task registry
7. dejar claro qué quedó hecho y qué no
8. no pedir prompt humano adicional salvo bloqueo real

## Política de sesiones
### Abrir sesión nueva
Sí, recomendado cuando:
- cambia el task-id
- la tarea es grande
- hubo mucha exploración previa
- el contexto ya mezcla varias tareas
- `/tc-next` lo indique como recomendado

### Mantener la misma sesión
Solo cuando:
- la tarea es pequeña
- el contexto sigue limpio
- no ha habido desvíos grandes

## Modo plan vs modo edición
### Plan
Usar si:
- cambia arquitectura
- cambia el canvas
- cambia el DTO de grafo
- la tarea toca muchos archivos
- hay dudas fuertes de diseño

### Edit
Usar si:
- la tarea es muy concreta
- ya existe un plan claro
- el scope es pequeño

## Scripts incluidos
- `.claude/bin/tc-plan`
- `.claude/bin/tc-edit`

Estos scripts no cambian el modo de una sesión ya abierta.
Sirven para arrancar la sesión correcta desde el principio.
