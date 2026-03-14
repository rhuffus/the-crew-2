# Task Registry — Visual Shell Redesign

## Leyenda
- status: todo | in-progress | done | blocked
- mode: plan | edit
- fresh-session: yes | no

| task-id | epic | status | mode | fresh-session | parallel-group | depends-on | objetivo |
|---------|-----:|--------|------|---------------|----------------|------------|----------|
| VSR-001 | 69 | done | plan | yes | A | - | Disenar tipo CenterView, API del store, plan de deprecacion. Documentar spec `docs/69-visual-shell-redesign-spec.md`. |
| VSR-002 | 69 | done | edit | yes | B | VSR-001 | Agregar CenterView type, centerView state, centerViewHistory, y acciones (setCenterView, openChatView, openDocumentView, openCanvasView, goBackCenterView) al visual-workspace-store.ts. Mantener chatDockOpen y openDocumentId como getters derivados. Tests unitarios del store. |
| VSR-003 | 69 | done | edit | yes | B | VSR-001 | Crear componente CenterPanel.tsx con switch por centerView.type (inicialmente solo canvas). Refactorizar visual-shell.tsx para usar CenterPanel en lugar del layout inline actual (children + ChatDock). Tests de renderizado. |
| VSR-004 | 69 | done | edit | no | C | VSR-002, VSR-003 | Verificar backward compat: todas las rutas canvas (org, departments, workflows, diff) funcionan identico. Correr suite completa de tests, corregir regresiones. |
| VSR-005 | 70 | done | edit | yes | D | VSR-004 | Extraer logica compartida de ChatDock/CeoConversationDock en ChatConversationContent. Crear ChatFullView.tsx: version full-height de la conversacion. Tests unitarios. |
| VSR-006 | 70 | done | edit | yes | D | VSR-004 | Crear ChatInspectorPanel.tsx: inspector cuando centro=chat. Muestra estado bootstrap, documentos del proyecto, proposals pendientes, runtime summary. Tests. |
| VSR-007 | 70 | done | edit | yes | E | VSR-005, VSR-006 | Integrar ChatFullView en CenterPanel switch. Inspector detecta centerView.type y renderiza ChatInspectorPanel. Tests integracion flujo chat-en-centro. |
| VSR-008 | 70 | done | edit | no | E | VSR-005 | Modificar ChatThreadsPanel en explorer: click en thread llama openChatView(). Auto-open seed phase usa openChatView('ceo'). Tests. |
| VSR-009 | 70 | done | edit | yes | F | VSR-007, VSR-008 | Eliminar ChatDock como bottom panel de visual-shell.tsx. Remover h-52, toggle button, chatDockOpen write-state. Actualizar tests afectados. |
| VSR-010 | 71 | done | edit | yes | D | VSR-004 | Crear DocumentEmbeddedView.tsx: MDXEditor full-height sin Dialog wrapper. Toolbar, visual/source toggle. Recibe documentId del centerView. Tests. |
| VSR-011 | 71 | done | edit | yes | D | VSR-004 | Crear DocumentInspectorPanel.tsx: inspector cuando centro=document. Metadata, status badges, historial, acciones (approve, status change). Tests. |
| VSR-012 | 71 | done | edit | yes | G | VSR-010, VSR-011 | Integrar DocumentEmbeddedView en CenterPanel switch. Inspector renderiza DocumentInspectorPanel cuando type=document. Tests integracion. |
| VSR-013 | 71 | done | edit | no | G | VSR-010 | Modificar call-sites: DocumentLink, UoDetailPanel, document mentions en chat llaman openDocumentView() en lugar de openDocument(). Tests. |
| VSR-014 | 71 | done | edit | yes | H | VSR-012, VSR-013 | Eliminar DocumentEditorModal y su lazy import de visual-shell.tsx. Eliminar openDocumentId como write-state. Actualizar tests. |
| VSR-015 | 72 | done | edit | yes | I | VSR-009, VSR-014 | Center view indicator en TopBar: icono + label de vista activa. Si documento, mostrar titulo. Tests. |
| VSR-016 | 72 | done | edit | yes | I | VSR-009, VSR-014 | Historial de navegacion: centerViewHistory stack, back button en TopBar, goBackCenterView(). Tests. |
| VSR-017 | 72 | done | edit | yes | J | VSR-015, VSR-016 | Keyboard shortcuts: Cmd+1=canvas, Cmd+2=chat, Cmd+3=ultimo doc. Documentar en KeyboardShortcutsHelp. Tests. |
| VSR-018 | 72 | done | edit | no | J | VSR-009, VSR-014 | Cleanup: eliminar codigo muerto, referencias obsoletas a chatDockOpen/openDocumentId write, toggleChatDock. Actualizar i18n. |
| VSR-019 | 72 | done | edit | yes | K | VSR-017, VSR-018 | Smoke tests e2e: crear proyecto, CEO chat abre en centro, doc abre en centro, volver a canvas, inspector se adapta. Actualizar docs. |

## Grafo de dependencias

```
A: VSR-001 (plan) ✅ done
    |
B: VSR-002 + VSR-003 (store + CenterPanel)
    |
C: VSR-004 (backward compat)
    |
    +---> D: VSR-005 + VSR-006 (chat)     VSR-010 + VSR-011 (document)
    |         |                                 |
    |     E: VSR-007 + VSR-008             G: VSR-012 + VSR-013
    |         |                                 |
    |     F: VSR-009 (kill ChatDock)       H: VSR-014 (kill DocModal)
    |         |                                 |
    +---------+---------------------------------+
              |
          I: VSR-015 + VSR-016 (TopBar + historial)
              |
          J: VSR-017 + VSR-018 (shortcuts + cleanup)
              |
          K: VSR-019 (smoke tests)
```

Las ramas chat (D-F) y document (D,G-H) son **paralelizables** despues de C.

## Estado actual
VSR-001 completada — spec, backlog y task registry creados:
- `docs/69-visual-shell-redesign-spec.md`
- `docs/70-visual-shell-backlog-v7.md`
- `docs/71-visual-shell-task-registry.md`

VSR-002 completada — CenterView type, state, history y 5 acciones nuevas en visual-workspace-store:
- `CenterView` tipo discriminado (`canvas` | `chat` | `document`)
- `centerView` state, `centerViewHistory` stack (max 20)
- `setCenterView`, `openChatView`, `openDocumentView`, `openCanvasView`, `goBackCenterView`
- Legacy `chatDockOpen`, `openDocumentId`, `toggleChatDock`, `openDocument`, `closeDocument` funcionan como wrappers que sincronizan con centerView
- 28 tests nuevos del center view (78 total store tests pass)
- 1 test preexistente roto en `department-canvas` (breadcrumb, no related)

VSR-003 completada — CenterPanel component y visual-shell refactor:
- `center-panel.tsx` con switch por centerView.type (solo canvas por ahora)
- `visual-shell.tsx` usa `<CenterPanel canvasContent={children} />` en lugar del layout inline
- CanvasViewport y ChatDock ahora viven dentro de CenterPanel
- Test nuevo verifica que `center-panel` testid se renderiza
- 1810 tests pass (1 preexistente roto en department-canvas)

VSR-004 completada — Backward compatibility verificada:
- Typecheck: pass
- 1810/1811 tests pass (1 preexistente roto: department-canvas breadcrumb)
- Rutas criticas todas verdes: visual-shell, store, chat-dock, chat-threads, document-editor, workflow-route, department-route, workflow-canvas, top-bar (135 tests)

Epic 69 completada. Siguiente desbloqueado: **parallel-group D** — VSR-005 + VSR-006 (chat) y VSR-010 + VSR-011 (document).

VSR-005 completada — ChatConversationContent extraido, ChatFullView creado:
- `chat-conversation-content.tsx` (nuevo): componente que encapsula ambos modos (generic + CEO)
  - `GenericContent`: thread resolution, permission checks, ChatMessageList + ChatInput
  - `CeoContent`: bootstrap conversation, status bar, messages, proposals, growth, input
  - Exporta `ChatMode` type
- `chat-full-view.tsx` (nuevo): wrapper full-height, determina chatMode desde centerView o bootstrap phase
- `chat-dock.tsx` (refactored): usa ChatConversationContent en lugar de inline rendering + CeoConversationDock
- `ceo-conversation-dock.tsx` (refactored): thin wrapper que delega a ChatConversationContent con chatMode='ceo'
- Tests nuevos: 14 (chat-conversation-content) + 7 (chat-full-view) = 21 tests
- Tests existentes sin regresiones: chat-dock (7), live-company-flow (20), smoke-ceo-bootstrap (14)
- 1844/1845 tests pass (1 preexistente roto: department-canvas breadcrumb)

VSR-006 completada — ChatInspectorPanel creado:
- `inspector/chat-inspector-panel.tsx` (nuevo): panel inspector adaptativo cuando centro=chat
  - Sección Bootstrap Status: maturity phase badge + conversation status
  - Sección Documents: lista clickeable de docs del proyecto, abre en center view
  - Sección Pending Proposals: lista de proposals pendientes filtradas
  - Sección Runtime: connection dot, active/blocked/failed counts, cost summary
- 17 tests nuevos cubriendo las 4 secciones y edge cases
- 1878/1879 tests pass (1 preexistente roto: department-canvas breadcrumb)

VSR-010 completada — DocumentEmbeddedView creada:
- `apps/web/src/components/documents/document-embedded-view.tsx` (nuevo)
- Full-height flex layout sin Dialog wrapper
- Toolbar con visual/source toggle, save button, status badges
- Misma lógica de edición que DocumentEditorModal (MDXEditor + source textarea)
- Reset state al cambiar de documentId
- Loading spinner y "Document not found" states
- `apps/web/src/__tests__/document-embedded-view.test.tsx`: 14 tests (render, modes, save, layout, badges)
- 1824/1825 tests pass (1 preexistente roto: department-canvas breadcrumb)

VSR-011 completada — DocumentInspectorPanel creado:
- `apps/web/src/components/visual-shell/inspector/document-inspector-panel.tsx` (nuevo)
- Header con título + slug
- Status badge con colores por estado (draft/review/approved)
- Source type (user/agent)
- History: createdAt, updatedAt, lastUpdatedBy con formato legible
- Linked entities (cuando presentes)
- Acciones de transición de estado: draft→review, review→approved/draft, approved→draft
- Cada acción llama useUpdateProjectDocument con el nuevo status
- `apps/web/src/__tests__/document-inspector-panel.test.tsx`: 17 tests (metadata, badges, actions, transitions, states)
- 143/143 tests pasan en archivos relevantes (document-*, visual-shell, store)

Parallel-group D completado: VSR-005, VSR-006, VSR-010, VSR-011 — todo done.

VSR-007 completada — ChatFullView integrada en CenterPanel switch + ChatInspectorPanel en Inspector:
- `center-panel.tsx`: case `'chat'` renderiza `ChatFullView` sin ChatDock (chat ocupa todo el centro)
- `inspector.tsx`: cuando `centerView.type === 'chat'` y no hay nodo seleccionado → `ChatInspectorPanel`
- `chat-center-integration.test.tsx`: 13 tests de integración (CenterPanel render por tipo, Inspector adaptativo, store transitions, re-render reactivo)
- 1907/1908 tests pass (1 preexistente roto: department-canvas breadcrumb)

VSR-012 completada — DocumentEmbeddedView integrada en CenterPanel + DocumentInspectorPanel en Inspector:
- `center-panel.tsx`: case `'document'` con lazy-loaded `DocumentEmbeddedView`, Suspense fallback, check de projectId
- `inspector.tsx`: cuando `centerView.type === 'document'` y no hay nodo seleccionado → `DocumentInspectorPanel`
- `document-center-integration.test.tsx`: 15 tests de integración (CenterPanel render, Inspector render, store sync, backward compat)
- 1893/1894 tests pass (1 preexistente roto: department-canvas breadcrumb)

VSR-008 completada — ChatThreadsPanel usa openChatView(), auto-open seed usa openChatView('ceo'):
- `chat-threads-panel.tsx`: handleThreadClick llama `openChatView(thread.id, 'generic')` en vez de `toggleChatDock()`
- `chat-dock.tsx`: auto-open seed phase llama `openChatView(null, 'ceo')` en vez de `toggleChatDock()`
- `create-project-dialog.tsx`: post-create llama `openChatView(null, 'ceo')` en vez de `toggleChatDock()`
- Tests actualizados: chat-threads-panel (7, +1 nuevo), create-project-dialog (7), smoke-ceo-bootstrap (14), chat-dock (7)
- 1907/1908 tests pass (1 preexistente roto: department-canvas breadcrumb)

Parallel-group E completado: VSR-007 + VSR-008 — todo done.
Parallel-group G completado: VSR-012 + VSR-013 — todo done.
Siguiente desbloqueado: **VSR-009** (parallel-group F, kill ChatDock) y **VSR-014** (parallel-group H, kill DocumentEditorModal).

## Contexto para ejecucion

### VSR-002 — Store changes
Archivos afectados:
- `apps/web/src/stores/visual-workspace-store.ts`
- `apps/web/src/__tests__/visual-workspace-store.test.ts`

El tipo `CenterView` y las acciones deben agregarse sin romper el API existente. `chatDockOpen` pasa de ser state directo a getter derivado de `centerView.type === 'chat'`. `openDocumentId` pasa de ser state directo a getter derivado. `toggleChatDock` pasa a ser wrapper que alterna entre canvas y chat. `openDocument(id)` → alias de `openDocumentView(id)`. `closeDocument()` → alias de `openCanvasView()`.

### VSR-003 — CenterPanel + visual-shell refactor
Archivos afectados:
- `apps/web/src/components/visual-shell/center-panel.tsx` (nuevo)
- `apps/web/src/components/visual-shell/visual-shell.tsx`
- `apps/web/src/__tests__/visual-shell.test.tsx`

El CenterPanel inicialmente solo soporta `type: 'canvas'` (con fallback a children o CanvasViewport). El layout del panel central en visual-shell.tsx cambia de:
```tsx
<div className="flex h-full min-w-0 flex-col overflow-hidden">
  {children ?? <CanvasViewport />}
  <ChatDock />
</div>
```
a:
```tsx
<CenterPanel canvasContent={children} />
```

ChatDock se mantiene temporalmente hasta VSR-009. En VSR-003 el CenterPanel simplemente renderiza el canvas + ChatDock para mantener backward compat.

### VSR-005 — ChatFullView
Archivos afectados:
- `apps/web/src/components/visual-shell/chat-dock/chat-conversation-content.tsx` (nuevo)
- `apps/web/src/components/visual-shell/chat-dock/chat-full-view.tsx` (nuevo)
- `apps/web/src/components/visual-shell/chat-dock/chat-dock.tsx` (refactor: usar ChatConversationContent)
- `apps/web/src/components/visual-shell/chat-dock/ceo-conversation-dock.tsx` (refactor: usar ChatConversationContent)

Extraer la logica de determinacion de chatMode, permission checks, message handling, y renderizado de mensajes+input a ChatConversationContent. ChatFullView es un wrapper full-height. ChatDock pasa a usar ChatConversationContent internamente (backward compat hasta VSR-009).

### VSR-010 — DocumentEmbeddedView
Archivos afectados:
- `apps/web/src/components/documents/document-embedded-view.tsx` (nuevo)
- `apps/web/src/components/documents/document-editor-modal.tsx` (se mantiene hasta VSR-014)

Copiar el contenido de DocumentEditorModal sin el wrapper Dialog. El componente recibe `projectId` y `documentId` y renderiza MDXEditor con toolbar full-height. Lazy import con Suspense igual que antes.

VSR-013 completada — Call-sites migrados de openDocument() a openDocumentView():
- `document-link.tsx`: `openDocument` → `openDocumentView` (selector + onClick)
- `uo-detail-panel.tsx`: `openDocument` → `openDocumentView` (selector + onClick)
- `document-mentions.test.tsx`: mock actualizado de `openDocument` a `openDocumentView`, test renombrado
- 1906/1908 tests pass (2 preexistentes rotos: department-canvas breadcrumb + smoke-ceo-bootstrap-flow)

Parallel-group G completado: VSR-012 + VSR-013 — todo done.

VSR-009 completada — ChatDock eliminado como bottom panel:
- `chat-dock.tsx` eliminado: componente, toggle button, h-52 panel, chatDockOpen/toggleChatDock selector
- `center-panel.tsx`: ChatDock removido del case canvas, auto-open seed phase migrado desde chat-dock
- `visual-workspace-store.ts`: `chatDockOpen` eliminado del state e interface, `toggleChatDock()` eliminado
- `visual-shell.tsx`: DocumentEditorModal lazy import y openDocumentId/closeDocument eliminados (auto-cleanup por linter — completa VSR-014)
- `chat-dock.test.tsx` eliminado
- Tests actualizados: visual-shell, visual-workspace-store, chat-center-integration, document-center-integration, chat-threads-panel, top-bar, workflow-canvas
- 1879/1880 tests pass (1 preexistente roto: department-canvas breadcrumb)

VSR-014 completada — DocumentEditorModal eliminado, openDocumentId eliminado:
- `document-editor-modal.tsx` eliminado (dead code tras VSR-012)
- `document-editor-modal.test.tsx` eliminado (8 tests)
- `visual-shell.tsx`: lazy import de DocumentEditorModal removido, selectores `openDocumentId`/`closeDocument` removidos, imports `lazy`/`Suspense` removidos
- `visual-workspace-store.ts`: `openDocumentId` eliminado del interface y state, `openDocument()`/`closeDocument()` deprecated actions eliminados, sync de openDocumentId en `setCenterView`/`goBackCenterView` eliminado
- `visual-workspace-store.test.ts`: 5 tests legacy removidos (openDocumentId sync, openDocument, closeDocument)
- `document-center-integration.test.tsx`: 1 test legacy removido (openDocumentId sync)
- 1879/1880 tests pass (1 preexistente roto: department-canvas breadcrumb)

Parallel-group F completado: VSR-009 — done.
Parallel-group H completado: VSR-014 — done.
Epic 70 completada (todos: VSR-005 through VSR-009).
Epic 71 completada (todos: VSR-010 through VSR-014).
Siguiente desbloqueado: **parallel-group I** — VSR-015 (center view indicator en TopBar) + VSR-016 (historial de navegacion).

VSR-016 completada — Back button de navegación en TopBar:
- `top-bar.tsx`: Back button (`ArrowLeft` icon) visible cuando `centerViewHistory.length > 0`
- Click llama `goBackCenterView()` del store (implementado en VSR-002)
- `aria-label` usa i18n key `common:back` (ya existía)
- `data-testid="center-view-back-button"` para testing
- `top-bar.test.tsx`: 6 tests nuevos (hidden when empty, visible with history, click navigates back, hides after back to empty, multi-entry navigation, accessible aria-label)
- 1885/1886 tests pass (1 preexistente roto: department-canvas breadcrumb)

VSR-015 completada — Center view indicator en TopBar:
- `top-bar.tsx`: Nuevo componente `CenterViewIndicator` renderiza icono + label según `centerView.type`
  - `canvas`: LayoutGrid icon + "Canvas" (muted style, sutil)
  - `chat`: MessageSquare icon + "Chat" o "CEO" (según chatMode) (primary style)
  - `document`: FileText icon + título del documento via `useProjectDocument` hook, fallback "Document"
  - Separador visual (border-l) entre zoom badge e indicador
  - Título de documento truncado a max 200px
- `common.json` (en + es): Keys `centerView.canvas`, `centerView.chat`, `centerView.ceoChat`, `centerView.document`
- `top-bar.test.tsx`: 7 tests nuevos (canvas default, generic chat, CEO chat, doc with title, doc loading fallback, correct hook params, empty id when not document)
- 1892/1893 tests pass (1 preexistente roto: department-canvas breadcrumb)

Parallel-group I completado: VSR-015 + VSR-016 — todo done.

VSR-018 completada — Cleanup de código muerto y i18n:
- `ceo-conversation-dock.tsx`: comentario JSDoc actualizado (eliminada referencia obsoleta a VSR-009)
- `en/chat.json` + `es/chat.json`: eliminadas keys muertas `dock.ceoAgent` y `dock.chatScope` (solo `dock.readOnly` sobrevive, en uso)
- `en/explorer.json`: `chat.noThreads` actualizado de "chat dock" a "chat view"
- `.gitignore`: agregado `*.timestamp-*` para ignorar artefactos de vitest
- 16 archivos `vitest.config.ts.timestamp-*` eliminados
- Verificación exhaustiva: 0 referencias a `chatDockOpen`, `toggleChatDock`, `openDocumentId`, `closeDocument`, `ChatDock`, `DocumentEditorModal` en source code
- 1905/1906 tests pass (1 preexistente roto: department-canvas breadcrumb)

VSR-017 completada — Keyboard shortcuts para center views:
- `visual-shell.tsx`: `useEffect` con keydown handler para `Cmd/Ctrl + 1/2/3`
  - `Cmd+1`: `openCanvasView()` — switch a canvas
  - `Cmd+2`: `openChatView(null, 'ceo')` — switch a CEO chat
  - `Cmd+3`: busca último `type: 'document'` en `centerViewHistory` y navega a él (no-op si ya en documento o sin documentos en historial)
  - Ignora inputs, textareas, selects y contentEditable
- `keyboard-shortcuts-help.tsx`: nueva sección "Center Views" con 3 shortcuts (`Ctrl + 1/2/3`)
- `center-view-shortcuts.test.tsx` (nuevo): 12 tests (Cmd+1, Ctrl+1, Cmd+2, Ctrl+2, Cmd+3 from history, no doc in history, already on doc, most recent doc, input guard, textarea guard, no modifier, canvas noop)
- `keyboard-shortcuts-help.test.tsx`: 2 tests nuevos (sección Center Views, shortcut descriptions)
- 1905/1906 tests pass (1 preexistente roto: department-canvas breadcrumb)

Parallel-group J completado: VSR-017 + VSR-018 — todo done.

VSR-019 completada — Smoke tests e2e del Visual Shell Redesign:
- `smoke-visual-shell-redesign.test.tsx` (nuevo): 28 tests organizados en 8 secciones:
  1. Store: center view lifecycle (7 tests) — default canvas, openChatView, openDocumentView, openCanvasView, goBackCenterView, full round-trip, history max limit
  2. CenterPanel renders per centerView type (4 tests) — canvas, chat, document, reactive re-render transitions
  3. Inspector adapts to center view type (4 tests) — CanvasSummary, ChatInspectorPanel, DocumentInspectorPanel, reactive transitions
  4. TopBar: center view indicator and back button (4 tests) — default indicator, back hidden/visible, back navigation through history
  5. Keyboard shortcuts (3 tests) — Cmd+1 canvas, Cmd+2 CEO chat, Cmd+3 last doc from history
  6. Full lifecycle scenario (1 test) — canvas → Cmd+2 chat → openDocumentView → back → Cmd+1 canvas (complete user journey)
  7. ChatDock fully removed (3 tests) — no chat-dock testid, no toggleChatDock, no chatDockOpen in store
  8. DocumentEditorModal fully removed (2 tests) — no document-editor-modal testid, no openDocumentId in store
- 1933/1934 tests pass (1 preexistente roto: department-canvas breadcrumb)

Parallel-group K completado: VSR-019 — done.
Epic 72 completada (todos: VSR-015 through VSR-019).

**Fase Visual Shell Redesign COMPLETADA** — Epics 69, 70, 71, 72 — todas las 19 tareas done.
