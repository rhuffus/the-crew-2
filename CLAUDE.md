# TheCrew

TheCrew es una plataforma multi-proyecto para diseñar, gobernar y operar empresas autónomas versionadas.
Cada proyecto representa una empresa concreta.

## Reenfoque actual
TheCrew es **visual-first**.
La prioridad ya no es añadir entidades nuevas, sino dejar el producto coherente, navegable y demostrable desde el canvas.

## Nueva prioridad inmediata
Además del backlog existente del canvas, ahora hay una fase nueva:

## **Verticaler + Polish**

Objetivos:
1. introducir una empresa de referencia permanente llamada **Verticaler**;
2. garantizar que una instancia vacía de TheCrew arranca con un proyecto demostrable;
3. mantener la documentación de Verticaler siempre sincronizada con el canvas spec y el backlog;
4. pulir y corregir el producto actual sin abrir superficie funcional nueva, salvo el propio proyecto de referencia.

## Regla de sincronización documental
Cada vez que cambie cualquiera de estos documentos:
- `docs/18-canvas-editor-v2-spec.md`
- `docs/03-backlog-completo.md`
- `docs/09-task-registry.md`

Claude debe comprobar si también necesita actualizar:
- `docs/25-verticaler-reference-company-spec.md`

Verticaler es el ejemplo canónico vivo de TheCrew.
No es solo seed data.
Es documentación ejecutable del producto.

## Fuente de verdad
- Las entidades de dominio siguen siendo la verdad semántica.
- El canvas es la interfaz principal de navegación y edición.
- Verticaler es la empresa de referencia para validar que el producto es usable de punta a punta.

## Flujo de trabajo con Claude Code
- `/tc-next`: sincroniza backlog y propone la siguiente tarea
- `/tc-run <task-id>`: ejecuta una tarea concreta
- `/quality-gate`: gate de calidad antes de cerrar tarea

## Contrato operativo
### `/tc-next`
Debe:
- leer `CLAUDE.md`
- leer `docs/03-backlog-completo.md`
- leer `docs/09-task-registry.md`
- leer `docs/25-verticaler-reference-company-spec.md`
- proponer la siguiente tarea desbloqueada
- indicar si conviene sesión nueva
- no pedir prompt humano adicional

### `/tc-run <task-id>`
Debe:
- resolver la tarea en el registry
- leer solo el contexto mínimo suficiente
- ejecutar el alcance de forma autosuficiente
- mantener sincronizados backlog/registry/specs si la tarea lo requiere
- no abrir nuevas funcionalidades no pedidas

## Higiene de sesión
- Preferir una tarea por sesión.
- Si `/tc-next` indica `fresh-session: yes`, cerrar la sesión y abrir otra.
- Si hay mucha deriva de contexto, empezar sesión nueva.
