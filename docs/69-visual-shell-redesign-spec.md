# Visual Shell Redesign — Dynamic Center View

## Contexto y motivacion

El visual shell actual tiene tres problemas de UX criticos:

1. **Chat dock estrecho**: El chat del CEO ocupa solo 208px (`h-52`) fijado debajo del canvas, haciendo las conversaciones largas muy incomodas. El usuario tiene que scrollear constantemente en un area minima.

2. **Documentos en modal overlay**: Los documentos Markdown se abren como `Dialog` overlay sobre el canvas, rompiendo el flujo de trabajo y ocultando contexto visual relevante.

3. **Centro acoplado al canvas**: El panel central del shell esta exclusivamente dedicado al canvas + chat dock, sin posibilidad de mostrar otras vistas.

## Solucion: modelo de 3 paneles con centro dinamico

```
+------------------------------------------------------------------+
|                          TopBar                                   |
+----------+-------------------------------+-----------------------+
|          |                               |                       |
| Explorer |        Centro dinamico        |      Inspector        |
|   (izq)  |   canvas | chat | document   |   (derecha, adaptivo) |
|          |                               |                       |
+----------+-------------------------------+-----------------------+
```

- **Explorer (izquierda)**: Navegacion y acciones. Es el driver de lo que se muestra en el centro.
- **Centro**: Area de contenido dinamica. Puede mostrar: canvas, chat a pantalla completa, o editor de documentos embebido.
- **Inspector (derecha)**: Detalle contextual que se adapta segun la vista central activa.

## Arquitectura tecnica

### Nuevo concepto: `CenterView`

Tipo discriminado en `visual-workspace-store.ts`:

```typescript
type CenterView =
  | { type: 'canvas' }
  | { type: 'chat'; threadId: string | null; chatMode: 'generic' | 'ceo' }
  | { type: 'document'; documentId: string }
```

**Default**: `{ type: 'canvas' }` — el canvas sigue siendo la vista principal.

### State additions en visual-workspace-store

```typescript
// Nuevos campos
centerView: CenterView              // vista central activa
centerViewHistory: CenterView[]     // stack para back navigation

// Nuevas acciones
setCenterView(view: CenterView): void
openChatView(threadId?: string | null, chatMode?: 'generic' | 'ceo'): void
openDocumentView(documentId: string): void
openCanvasView(): void
goBackCenterView(): void

// Deprecados (mantener como getters derivados para backward compat)
chatDockOpen → derivado de centerView.type === 'chat'
openDocumentId → derivado de centerView.type === 'document' ? centerView.documentId : null
toggleChatDock → setCenterView si no es chat, openCanvasView si ya es chat
openDocument(id) → openDocumentView(id)
closeDocument() → openCanvasView()
```

### Nuevo componente: CenterPanel

`apps/web/src/components/visual-shell/center-panel.tsx`

Switch que renderiza segun `centerView.type`:
- `canvas` → `{children ?? <CanvasViewport />}` (comportamiento actual)
- `chat` → `<ChatFullView />` (chat a altura completa del panel)
- `document` → `<DocumentEmbeddedView />` (MDXEditor embebido, sin modal)

### ChatFullView

`apps/web/src/components/visual-shell/chat-dock/chat-full-view.tsx`

Componente full-height que reusa la logica existente de ChatDock y CeoConversationDock:
- Extraer logica compartida a `ChatConversationContent`
- ChatFullView renderiza ChatConversationContent en un contenedor full-height
- Mantiene: permission checks, auto-start, proposals, growth button
- Elimina: toggle button, h-52 constraint

### DocumentEmbeddedView

`apps/web/src/components/documents/document-embedded-view.tsx`

MDXEditor full-height sin Dialog wrapper:
- Toolbar con visual/source toggle
- Save button
- Status badges
- Basado en el contenido actual de DocumentEditorModal
- Sin Dialog/DialogContent wrapper

### Inspector adaptativo

El inspector discrimina por `centerView.type`:
- `canvas` → inspector actual (nodos, edges, tabs dinamicos) — sin cambios
- `chat` → `ChatInspectorPanel`:
  - Estado bootstrap (status, phase)
  - Documentos del proyecto (links clickeables)
  - Proposals pendientes
  - Runtime execution summary
- `document` → `DocumentInspectorPanel`:
  - Metadata del documento (titulo, slug, tipo, status)
  - Status badges
  - Historial de cambios
  - Acciones: approve, change status, delete

### Integracion Explorer

- Tab "chat" en explorer: click en thread → `openChatView(threadId)` en lugar de navegar + toggle
- Links a documentos: click → `openDocumentView(docId)` en lugar de `openDocument(docId)`
- Auto-open CEO en seed phase → `openChatView(null, 'ceo')` en center view

### TopBar changes

- Center view indicator: icono + label de la vista activa
- Back button cuando `centerViewHistory.length > 0`
- Si vista es document, mostrar titulo del documento

### Keyboard shortcuts

- `Cmd+1` / `Ctrl+1`: Ir a canvas
- `Cmd+2` / `Ctrl+2`: Ir a chat
- `Cmd+3` / `Ctrl+3`: Ir al ultimo documento abierto

## Archivos criticos

| Archivo | Cambio |
|---------|--------|
| `apps/web/src/stores/visual-workspace-store.ts` | Agregar `CenterView`, `centerView`, `centerViewHistory`, acciones nuevas, deprecar `chatDockOpen`/`openDocumentId` |
| `apps/web/src/components/visual-shell/visual-shell.tsx` | Reemplazar layout inline por `CenterPanel`, eliminar ChatDock bottom, eliminar DocumentEditorModal lazy |
| `apps/web/src/components/visual-shell/center-panel.tsx` | **Nuevo** — switch por centerView.type |
| `apps/web/src/components/visual-shell/chat-dock/chat-full-view.tsx` | **Nuevo** — chat full-height |
| `apps/web/src/components/visual-shell/chat-dock/chat-conversation-content.tsx` | **Nuevo** — logica compartida extraida |
| `apps/web/src/components/visual-shell/inspector/inspector.tsx` | Wrapper que discrimina por `centerView.type` |
| `apps/web/src/components/visual-shell/inspector/chat-inspector-panel.tsx` | **Nuevo** — inspector cuando centro=chat |
| `apps/web/src/components/visual-shell/inspector/document-inspector-panel.tsx` | **Nuevo** — inspector cuando centro=document |
| `apps/web/src/components/documents/document-embedded-view.tsx` | **Nuevo** — MDXEditor sin modal |
| `apps/web/src/components/documents/document-editor-modal.tsx` | **Eliminar** al final |
| `apps/web/src/components/visual-shell/chat-dock/chat-dock.tsx` | **Eliminar** como bottom panel |
| `apps/web/src/components/visual-shell/chat-dock/ceo-conversation-dock.tsx` | Hacer reusable para full-view |
| `apps/web/src/components/visual-shell/chat-dock/document-link.tsx` | Cambiar `openDocument()` → `openDocumentView()` |
| `apps/web/src/components/visual-shell/explorer/chat-threads-panel.tsx` | Navegar a center view en lugar de toggle dock |
| `apps/web/src/components/visual-shell/top-bar.tsx` | Center view indicator + back button |

## Riesgos y mitigaciones

1. **Routes pasan children a VisualShell**: `CenterPanel` solo renderiza children cuando `centerView.type === 'canvas'`. En chat/document ignora children.

2. **Estado conversacional del CEO**: Vive en React Query cache, no en estado local — persiste entre cambios de vista. No hay riesgo de perder conversacion.

3. **MDXEditor pesado**: Lazy import con Suspense, igual que el modal actual. No se carga hasta que el usuario abre un documento.

4. **Auto-open seed phase**: Migrar `useEffect` de ChatDock a CenterPanel para llamar `openChatView(null, 'ceo')`. Mantener guard ref para evitar re-open.

5. **Backward compat durante migracion**: chatDockOpen y openDocumentId se mantienen como getters derivados del centerView state. Codigo existente que lea estos valores sigue funcionando.

## Verificacion

Para validar el rediseno completo:

1. `pnpm turbo run typecheck` — sin errores de tipos
2. `pnpm turbo run lint` — sin warnings nuevos
3. `pnpm turbo run test -- --run` — toda la suite verde
4. Manual: crear proyecto seed → CEO chat abre en centro (no bottom dock) → escribir → doc generado → click doc abre en centro → inspector adapta → Cmd+1 vuelve a canvas → inspector vuelve a nodos
5. Smoke test automatizado cubre el flujo anterior
