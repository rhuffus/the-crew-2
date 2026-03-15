# Visual Shell Redesign — Dynamic Center View

## Contexto y motivacion

El visual shell actual tiene tres problemas de UX criticos:

1. **Chat dock estrecho**: El chat del CEO ocupa solo 208px (`h-52`) fijado debajo del canvas, haciendo las conversaciones largas muy incomodas. El usuario tiene que scrollear constantemente en un area minima.

2. **Documentos en modal overlay**: Los documentos Markdown se abren como `Dialog` overlay sobre el canvas, rompiendo el flujo de trabajo y ocultando contexto visual relevante.

3. **Centro acoplado al canvas**: El panel central del shell esta exclusivamente dedicado al canvas + chat dock, sin posibilidad de mostrar otras vistas.

---

## Sistema de navegacion: 3 paneles con centro dinamico

```
+------------------------------------------------------------------+
|                          TopBar                                   |
|  [<-] TheCrew > Project > Scope   [L1]  [vista activa]           |
+----------+-------------------------------+-----------------------+
|          |                               |                       |
| Explorer |        Centro dinamico        |      Inspector        |
|   (izq)  |   canvas | chat | document   |   (derecha, adaptivo) |
|          |                               |                       |
+----------+-------------------------------+-----------------------+
```

### Panel izquierdo: Explorer

El Explorer es el **driver de navegacion**. Contiene tabs que permiten al usuario acceder a distintas facetas del proyecto:

| Tab | Funcion | Accion sobre el centro |
|-----|---------|----------------------|
| Entity tree | Arbol de entidades (UOs, agentes, workflows) | Selecciona nodos en el canvas |
| Chat threads | Lista de hilos de conversacion | `openChatView(threadId)` — abre chat generico en el centro |
| Documents | Lista de documentos del proyecto | `openDocumentView(docId)` — abre editor en el centro |
| Proposals | Proposals agrupadas por estado | Selecciona nodo proposal en el canvas |
| Filters | Filtros de overlay, tipo de nodo, status | Modifica el canvas directamente |

**Comportamiento clave**: Un click en el Explorer cambia la vista central. El Explorer no tiene contenido propio de "detalle" — todo detalle se muestra en el centro o en el inspector.

### Panel central: CenterPanel

`apps/web/src/components/visual-shell/center-panel.tsx`

El panel central renderiza **una sola vista a la vez**, determinada por `centerView.type`:

| Vista | Componente | Cuando se activa |
|-------|-----------|-----------------|
| `canvas` | `CanvasViewport` | Default. Click en Entity tree. `Cmd+1`. |
| `chat` | `ChatFullView` → `ChatConversationContent` | Click en thread. `Cmd+2`. Auto-open en seed phase. |
| `document` | `DocumentEmbeddedView` (lazy) | Click en documento. `Cmd+3` (ultimo abierto). |

**Auto-open en seed phase**: Cuando un proyecto esta en fase `seed`, el `CenterPanel` abre automaticamente el chat del CEO como vista central al montar (una sola vez por sesion via `seedChatAutoOpened` flag en store).

### Panel derecho: Inspector

`apps/web/src/components/visual-shell/inspector/inspector.tsx`

El inspector se **adapta contextualmente** segun la seleccion actual y la vista central:

```
                   +--------------------+
seleccion activa?  |                    |
  +-si--->         | Node/Edge tabs     |  (edit, relations, validation, etc.)
  |                |                    |
  +-no---> tipo    +--------------------+
     de centro?
     |
     +-- canvas  --> CanvasSummary       (resumen de nodos y edges)
     |
     +-- chat    --> con agentId?
     |                +-si--> AgentChatInspectorPanel  (info agente + bootstrap + docs + runtime)
     |                +-no--> ChatInspectorPanel       (bootstrap + docs + proposals + runtime)
     |
     +-- document -> DocumentInspectorPanel  (metadata, status, acciones)
     |
     +-- diff    --> DiffSummaryPanel    (resumen de cambios entre releases)
```

#### AgentChatInspectorPanel (nuevo)

Se muestra cuando el chat tiene un `agentId` asociado. Combina:
- **Agent info**: nombre, rol, skills, responsibilities, budget, status (via `useLcpAgent`)
- **Bootstrap status**: fase de madurez y estado de la conversacion
- **Documents**: documentos del proyecto con links clickeables a `openDocumentView`
- **Runtime**: estado de conexion, ejecuciones activas/bloqueadas/fallidas, costos AI

#### ChatInspectorPanel

Se muestra cuando el chat es generico (sin `agentId`). Incluye:
- Bootstrap status y fase
- Documentos del proyecto
- Proposals pendientes (via `useProposalsStore`)
- Runtime summary

### TopBar

`apps/web/src/components/visual-shell/top-bar.tsx`

La barra superior integra:
- **Breadcrumb de navegacion**: TheCrew > Proyecto > Scope (L1 filtrado, cubierto por el nombre del proyecto)
- **Zoom level badge**: `L1`, `L2`, `L3`
- **Center view indicator**: Icono + label de la vista activa:
  - Canvas → icono grid + "Canvas"
  - Chat sin agentId → icono message + "Chat"
  - Chat con agentId → icono message + "Agent Chat"
  - Document → icono file + titulo del documento (o "Document" si cargando)
- **Back button**: Aparece cuando `centerViewHistory.length > 0`. Click ejecuta `goBackCenterView()`.
- **Visual/Admin toggle** y **User menu**

---

## Arquitectura tecnica

### `CenterView` — tipo discriminado

Definido en `visual-workspace-store.ts`:

```typescript
type CenterView =
  | { type: 'canvas' }
  | { type: 'chat'; threadId: string | null; agentId?: string }
  | { type: 'document'; documentId: string }
```

- `agentId` es opcional. Si esta presente, el chat se conecta al agente especifico y el inspector muestra `AgentChatInspectorPanel`.
- Si `agentId` no esta presente, el chat es generico (scope-based, con permission checks) y el inspector muestra `ChatInspectorPanel`.
- **Default**: `{ type: 'canvas' }`

### Acciones del store

```typescript
setCenterView(view: CenterView): void
openChatView(threadId?: string | null, agentId?: string): void
openDocumentView(documentId: string): void
openCanvasView(): void
goBackCenterView(): void
```

**History management**: `setCenterView` pushea la vista actual al `centerViewHistory` stack (max 20 entradas) cuando cambia de tipo. Cambios dentro del mismo tipo (e.g. chat a chat) no generan entrada en history.

### Chat unificado: `ChatConversationContent`

`apps/web/src/components/visual-shell/chat-dock/chat-conversation-content.tsx`

Un solo componente que se bifurca internamente segun `agentId`:

```
ChatConversationContent({ projectId, agentId?, currentScope })
  |
  +-- agentId? --> AgentContent
  |                 usa useAgentChat({ projectId, agentId })
  |                 status bar con nombre del agente
  |                 AI provider warning
  |                 thinking indicators
  |                 SIN boton "Propose Structure"
  |                 SIN proposals section
  |
  +-- no agentId --> GenericContent
                      usa useChatThread + useSendMessage
                      permission checks (read/write por scope)
                      read-only indicator si no tiene permiso
```

### Hook `useAgentChat`

`apps/web/src/hooks/use-agent-chat.ts`

Encapsula la logica de decidir que backend usar:
- Consulta `useBootstrapConversation` para obtener `ceoAgentId`
- Si el `agentId` pasado coincide con `ceoAgentId` → usa `useSendBootstrapMessage` (genera respuesta IA)
- Si no coincide → usa `useSendMessage` (chat generico)
- Gestiona thinking time tracking (refs + useEffect)
- Auto-start de conversacion bootstrap si no existe
- Expone: `agent`, `isAgentChat`, `isCeoAgent`, `send`, `messages`, `isSending`, `bootstrapStatus`, `hasNoProvider`, etc.

### ChatFullView

`apps/web/src/components/visual-shell/chat-dock/chat-full-view.tsx`

Componente minimo que lee `centerView.agentId` del store y lo pasa a `ChatConversationContent`.

### CeoConversationDock

`apps/web/src/components/visual-shell/chat-dock/ceo-conversation-dock.tsx`

Wrapper que resuelve `ceoAgentId` via `useBootstrapStatus` y lo pasa como `agentId` a `ChatConversationContent`. Usado por tests de integracion.

### Fuentes de `agentId`

| Caller | Como obtiene `agentId` |
|--------|----------------------|
| Auto-open seed phase (`center-panel.tsx`) | `bootstrapStatus?.ceoAgentId` |
| Keyboard shortcut `Cmd+2` (`visual-shell.tsx`) | `queryClient.getQueryData(['bootstrap', 'status', projectId])?.ceoAgentId` |
| Create project (`create-project-dialog.tsx`) | `bootstrapApi.bootstrap()` result → `result.ceoAgentId` |
| Explorer chat thread click | Sin agentId (chat generico) |
| `CeoConversationDock` wrapper | `useBootstrapStatus(projectId).data?.ceoAgentId` |

### Keyboard shortcuts

| Shortcut | Accion | Nota |
|----------|--------|------|
| `Cmd/Ctrl + 1` | `openCanvasView()` | Siempre vuelve al canvas |
| `Cmd/Ctrl + 2` | `openChatView(null, ceoAgentId?)` | Abre chat. Si hay ceoAgentId en cache, lo usa |
| `Cmd/Ctrl + 3` | `openDocumentView(lastDocId)` | Abre el ultimo documento del history. No-op si ya esta en documento o no hay documentos previos |

Los shortcuts se ignoran si el foco esta en `INPUT`, `TEXTAREA`, `SELECT` o un elemento `contentEditable`.

---

## Flujo de datos completo: ejemplo CEO chat

```
1. Usuario crea proyecto
   └─> CreateProjectForm.handleSubmit()
       └─> bootstrapApi.bootstrap() → { ceoAgentId: 'abc-123' }
       └─> store.openChatView(null, 'abc-123')
       └─> navigate to /projects/$slug/org

2. CenterPanel monta
   └─> centerView = { type: 'chat', threadId: null, agentId: 'abc-123' }
   └─> renderiza ChatFullView
       └─> renderiza ChatConversationContent(agentId='abc-123')
           └─> AgentContent
               └─> useAgentChat({ projectId, agentId: 'abc-123' })
                   └─> useLcpAgent → datos del agente (nombre, rol, etc.)
                   └─> useBootstrapConversation → { ceoAgentId, threadId, status }
                   └─> agentId === ceoAgentId? → SI → usa useSendBootstrapMessage
                   └─> auto-start si conversacion no existe

3. Inspector monta
   └─> centerView.type === 'chat' && centerView.agentId === 'abc-123'
   └─> renderiza AgentChatInspectorPanel(projectId, agentId='abc-123')
       └─> useLcpAgent → nombre, rol, skills, responsibilities
       └─> useBootstrapStatus → fase, status
       └─> useProjectDocuments → lista de docs
       └─> useRuntimeStatusStore → conexion, ejecuciones, costos

4. Usuario escribe mensaje
   └─> ChatInput.onSend → chat.send(content)
       └─> useAgentChat.send()
           └─> useSendBootstrapMessage.mutate(content)
               └─> optimistic update en messages
               └─> POST /projects/:id/bootstrap-conversation/messages
               └─> invalidate queries

5. Usuario presiona Cmd+1
   └─> store.openCanvasView()
   └─> centerView = { type: 'canvas' }
   └─> centerViewHistory = [..., { type: 'chat', threadId: null, agentId: 'abc-123' }]
   └─> CenterPanel renderiza CanvasViewport
   └─> Inspector renderiza CanvasSummary
   └─> TopBar muestra back button
```

---

## Archivos del sistema de navegacion

| Archivo | Rol |
|---------|-----|
| `stores/visual-workspace-store.ts` | CenterView type, history, acciones de navegacion |
| `components/visual-shell/visual-shell.tsx` | Layout 3 paneles + keyboard shortcuts |
| `components/visual-shell/center-panel.tsx` | Switch por centerView.type + auto-open seed |
| `components/visual-shell/top-bar.tsx` | Breadcrumb, center view indicator, back button |
| `components/visual-shell/explorer/explorer.tsx` | Tabs de navegacion lateral |
| `components/visual-shell/explorer/chat-threads-panel.tsx` | Lista de threads → openChatView |
| `components/visual-shell/chat-dock/chat-full-view.tsx` | Wrapper minimal, lee agentId del store |
| `components/visual-shell/chat-dock/chat-conversation-content.tsx` | Chat unificado: AgentContent o GenericContent |
| `hooks/use-agent-chat.ts` | Logica de chat de agente (bootstrap vs generico) |
| `components/visual-shell/inspector/inspector.tsx` | Discrimina seleccion + centerView para panel contextual |
| `components/visual-shell/inspector/agent-chat-inspector-panel.tsx` | Inspector para chat con agente |
| `components/visual-shell/inspector/chat-inspector-panel.tsx` | Inspector para chat generico |
| `components/visual-shell/inspector/document-inspector-panel.tsx` | Inspector para documentos |
| `components/documents/document-embedded-view.tsx` | MDXEditor embebido (lazy) |

---

## Verificacion

Para validar el sistema de navegacion completo:

1. `pnpm --filter @the-crew/web typecheck` — sin errores de tipos
2. `pnpm --filter @the-crew/web lint` — sin errores (warnings aceptables en tests)
3. `pnpm --filter @the-crew/web test -- --run` — toda la suite verde
4. Manual: crear proyecto seed → CEO chat abre en centro → inspector muestra datos del agente → escribir → doc generado → click doc abre en centro → inspector adapta → Cmd+1 vuelve a canvas → inspector vuelve a nodos → Cmd+2 vuelve a chat
5. Smoke test automatizado: `smoke-visual-shell-redesign.test.tsx`
