# TheCrew — Claude Code Ready Pack (visual-first)

Este paquete deja preparado el flujo para que **no necesites escribir ningún prompt manual adicional**.

## Flujo esperado
1. Abres una sesión de Claude Code en el repo.
2. Ejecutas `/tc-next`.
3. Claude lee `CLAUDE.md`, el backlog y el task registry, y te devuelve:
   - siguiente tarea desbloqueada
   - modo recomendado (`plan` o `edit`)
   - si conviene sesión nueva
   - tareas paralelizables ahora mismo
   - comando exacto a ejecutar a continuación (`/tc-run <task-id>`)
4. Ejecutas `/tc-run <task-id>`.
5. Claude resuelve la tarea sin pedirte un prompt extra, salvo que exista un bloqueo real de dependencias, una decisión de producto no resuelta o un problema externo.

## Idea clave
En Claude Code, el propio slash command es la entrada de trabajo. Por eso aquí el objetivo es que:
- `/tc-next` sea autosuficiente para decidir
- `/tc-run <task-id>` sea autosuficiente para ejecutar

## Qué incluye
- `CLAUDE.md` actualizado al pivot visual-first
- `docs/03-backlog-completo.md`
- `docs/06-analisis-estado-actual.md`
- `docs/09-task-registry.md`
- `docs/02-playbook-claude-code.md`
- `docs/10-flujo-operativo-sin-prompts.md`
- `.claude/commands/tc-next.md`
- `.claude/commands/tc-run.md`
- `.claude/settings.json`
- hooks y wrappers de arranque

## Límite práctico importante
Claude Code puede leer memoria de proyecto, ejecutar comandos custom y usar hooks al inicio de sesión.
Lo que este paquete deja automatizado es la **decisión** y la **ejecución por tarea**.
Lo que no puede forzarse desde aquí es cerrar por sí mismo una sesión ya abierta y relanzarla en otro modo; por eso `/tc-next` lo indica explícitamente cuando conviene reiniciar.
