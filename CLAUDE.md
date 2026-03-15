# TheCrew

TheCrew ha completado el pivot **Live Company**, la fase **AI Runtime Enablement**, la fase **Visual Shell Redesign**, y está en la fase **Documentation, Context & Entity Workspace**:

## Estado actual

La fase AI Runtime Enablement (Epics 59–65, 67) está **completada**.
La fase Visual Shell Redesign (Epics 69–72) está **completada**.
La fase Documentation, Context & Entity Workspace (Epics 74A–74J) está **en progreso**:
- ⏳ Hierarchical document model (Epic 74A)
- ⏳ Document tree en Explorer (Epic 74B)
- ⏳ Wiki-links en markdown (Epic 74C)
- ⏳ Sistema de contexto de agentes (Epic 74D)
- ⏳ Entity Workspace (Epic 74E)
- ⏳ Backlinks computados (Epic 74J)

## Arquitectura de comunicacion (OBLIGATORIO)

ADR: `docs/73-redis-streams-cqrs-architecture-adr.md`

### Reglas inquebrantables

1. **NO hay llamadas HTTP directas entre microservicios** — toda comunicacion inter-servicio es via **Redis Streams** con mensajes tipados
2. **Cada microservicio tiene su propia base de datos Redis** — es su fuente de verdad. Ningun servicio lee la base de datos de otro
3. **web-bff es el UNICO backend que habla con web-admin** — expone REST (commands) y WebSocket (events)
4. **web-bff usa MongoDB** para vistas materializadas — proyecciones de lectura construidas a partir de eventos de Redis Streams
5. **Optimistic updates son OBLIGATORIOS** — el frontend nunca espera confirmacion del backend para actualizar la UI
6. **WebSocket es el UNICO canal para eventos servidor→cliente** — el web-admin recibe actualizaciones en tiempo real via WebSocket
7. **Todos los mensajes inter-servicio DEBEN estar tipados** — definidos en `shared-types`
8. **DDD + CQRS** — comando (write) separado de query (read). Redis es write-side, MongoDB es read-side

### Flujo de datos

```
web-admin (React)
    | REST (commands)     ^ WebSocket (domain events)
    v                     |
  web-bff (NestJS + MongoDB)
    |                     ^
    v                     |
  Redis Streams ──────────────────
    |       |       |       |
  svc-A   svc-B   svc-C   svc-D
  (Redis)  (Redis) (Redis) (Redis)
```

### Patron de interaccion web-admin ↔ web-bff

1. Usuario hace accion → **optimistic update inmediato** en la UI
2. web-admin envia REST POST/PUT/DELETE a web-bff → web-bff publica comando en Redis Stream
3. Microservicio destino procesa comando → publica evento de dominio en Redis Stream
4. web-bff recibe evento → actualiza vista materializada en MongoDB → filtra y reenvia al web-admin via WebSocket
5. web-admin recibe evento WebSocket → reconcilia con estado optimista (confirma o rollback)

## Persistencia

- **Redis** — base de datos por microservicio (source of truth per bounded context)
- **MongoDB** — vistas materializadas en web-bff (read-only projections)
- **Redis Streams** — bus de eventos entre microservicios
- InMemory repos solo para unit tests directos (sin DI)

## Autenticacion IA

- **Claude Max (suscripcion)** — UNICO metodo de autenticacion para funciones IA
- Auth type: `oauth-token`, env var: `CLAUDE_CODE_OAUTH_TOKEN`, provider: `claude-max`
- NUNCA usar API keys de Anthropic

## Documentos canonicos de la fase activa
Claude debe tratar como fuente de verdad principal:

- `docs/74-documentation-context-system-spec.md` (spec completa)
- `docs/75-documentation-context-backlog.md` (backlog epics 74A-74J)
- `docs/76-documentation-context-task-registry.md` (task registry DCS)
- `docs/73-redis-streams-cqrs-architecture-adr.md` (ADR arquitectura Redis Streams + CQRS)

## Documentos canonicos de fases anteriores
- `docs/69-visual-shell-redesign-spec.md` (spec VSR, completada)
- `docs/70-visual-shell-backlog-v7.md` (backlog VSR, completado)
- `docs/71-visual-shell-task-registry.md` (task registry VSR, completado)
- `docs/57-ai-runtime-epic-decision.md`
- `docs/58-ai-runtime-gap-analysis.md`
- `docs/59-ceo-interactive-bootstrap-runtime-spec.md`
- `docs/60-foundation-documents-spec.md`
- `docs/61-markdown-document-system-spec.md`
- `docs/62-claude-container-runtime-spec.md`
- `docs/63-temporal-orchestration-spec.md`
- `docs/64-basic-autonomous-work-spec.md`
- `docs/65-ai-runtime-backlog-v6.md`
- `docs/66-ai-runtime-task-registry.md`
- `docs/67-prisma-migration-adr.md`
- `docs/68-single-postgres-instance-adr.md`

## Regla de producto
No construir una "demo fake" de IA.
El chat del CEO, la generacion de documentos y la creacion minima de estructura deben apoyarse en ejecucion real del runtime.

## Regla de alcance
Para esta fase:
- si se permite trabajo real con IA
- no hace falta todavia cerrar toda la plataforma multiagente final
- si hace falta una primera cadena funcional end-to-end:
  - crear proyecto
  - abrir canvas con empresa
  - CEO conversa
  - se generan documentos Markdown base
  - el usuario puede abrir/editar/revisar documentos
  - el CEO puede empezar a proponer/crear estructura minima
  - Temporal orquesta al menos algunos workflows basicos
  - Claude Code corre dentro de contenedores Docker para tareas acotadas

## Flujo con Claude Code
- `/tc-next` debe priorizar `docs/76-documentation-context-task-registry.md`
- `/tc-run <task-id>` debe resolver primero en `docs/76-documentation-context-task-registry.md`, luego en registries anteriores
- una tarea por sesion cuando sea posible
- si una tarea toca visual shell, sincronizar con `docs/74-documentation-context-system-spec.md`

## Regla de honestidad tecnica
- si una parte depende de limitaciones del runtime de Claude Code, dejarlo explicito
- no vender como "produccion lista" algo que en esta fase solo es valido para local/dev
- distinguir claramente:
  - local trusted dev
  - multiusuario
  - produccion
