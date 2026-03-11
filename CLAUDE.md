# TheCrew

TheCrew es una plataforma visual-first para diseñar, gobernar y operar empresas autónomas versionadas.
Cada proyecto representa una empresa concreta.
El canvas es la interfaz principal de navegación y edición.

## Fase actual: Verticaler + Polish

No se abren funcionalidades nuevas. El foco es:

1. **Verticaler** — empresa de referencia canónica que se crea automáticamente en instancia vacía;
2. **Bootstrap honesto** — persistencia y migraciones coherentes con la arquitectura real;
3. **Polish** — corregir inconsistencias, limpiar documentación y repo sin ampliar superficie funcional.

Progreso: ver `docs/09-task-registry.md`.

## Fuente de verdad

- Entidades de dominio → verdad semántica.
- Canvas → interfaz principal.
- Verticaler → empresa de referencia para validar el producto de punta a punta.

## Regla de sincronización documental

Cuando cambie cualquiera de estos documentos:
- `docs/18-canvas-editor-v2-spec.md`
- `docs/03-backlog-completo.md`
- `docs/09-task-registry.md`

Claude debe comprobar si también necesita actualizar:
- `docs/25-verticaler-reference-company-spec.md`

## Limitaciones conocidas

Estas limitaciones están documentadas y tienen tareas asignadas. No corregir ad hoc.

| Limitación | Impacto | Tarea asociada |
|---|---|---|
| 100% de repositorios son in-memory (33 repos entre platform y company-design) | Todo estado se pierde al reiniciar un servicio | VRT-002, POL-004 |
| Auth no implementada — permisos hardcodeados en dev mode | `permissions.controller.ts` devuelve roles fijos; `permission-provider.tsx` usa `DEV_MANIFEST` | No corregir hasta auth real |
| Autor de comentarios hardcodeado (`'current-user'`) | `comments-tab.tsx:39` | No corregir hasta auth real |

Detalle completo en `docs/26-current-state-polish-review.md`.

## Flujo de trabajo con Claude Code

- `/tc-next`: sincroniza backlog y propone la siguiente tarea
- `/tc-run <task-id>`: ejecuta una tarea concreta
- `/quality-gate`: gate de calidad antes de cerrar tarea

### Contrato `/tc-next`

- Leer `CLAUDE.md`, `docs/03-backlog-completo.md`, `docs/09-task-registry.md`, `docs/25-verticaler-reference-company-spec.md`
- Proponer la siguiente tarea desbloqueada
- Indicar si conviene sesión nueva
- No pedir prompt humano adicional

### Contrato `/tc-run <task-id>`

- Resolver la tarea en el registry
- Leer solo el contexto mínimo suficiente
- Ejecutar el alcance de forma autosuficiente
- Mantener sincronizados backlog/registry/specs si la tarea lo requiere
- No abrir nuevas funcionalidades no pedidas

## Higiene de sesión

- Preferir una tarea por sesión.
- Si `/tc-next` indica `fresh-session: yes`, cerrar la sesión y abrir otra.
- Si hay mucha deriva de contexto, empezar sesión nueva.
