# Backlog v7 — Visual Shell Redesign

## Epic 69 — DYNAMIC CENTER VIEW INFRASTRUCTURE ✅

Objetivo: Introducir `CenterView` en el store y el componente `CenterPanel` sin cambiar comportamiento visible.

### Hitos
- Tipo `CenterView` definido en visual-workspace-store
- State + acciones en visual-workspace-store: `centerView`, `centerViewHistory`, `setCenterView`, `openChatView`, `openDocumentView`, `openCanvasView`, `goBackCenterView`
- `chatDockOpen` y `openDocumentId` deprecados como getters derivados del centerView
- Componente `CenterPanel` con switch (solo renderiza canvas inicialmente)
- `visual-shell.tsx` refactorizado para usar `CenterPanel` en el panel central
- Tests unitarios del store y renderizado
- Backward compatibility verificada en todas las rutas canvas

### Spec de referencia
- `docs/69-visual-shell-redesign-spec.md`

---

## Epic 70 — CHAT AS CENTER VIEW ✅

Objetivo: Mover la conversacion CEO y chat generico de bottom-dock a vista central completa.

### Hitos
- Logica compartida extraida de ChatDock/CeoConversationDock a `ChatConversationContent`
- `ChatFullView` componente full-height usando ChatConversationContent
- `ChatInspectorPanel` para inspector adaptativo (estado bootstrap, docs, proposals, runtime)
- `CenterPanel` switch renderiza `ChatFullView` cuando `centerView.type === 'chat'`
- Inspector detecta `centerView.type` y renderiza `ChatInspectorPanel`
- Explorer tab chat navega al centro con `openChatView()`
- Auto-open seed phase redirige a center view en lugar de toggle dock
- ChatDock bottom eliminado del shell
- Toggle button y `h-52` eliminados
- Tests unitarios e integracion

### Spec de referencia
- `docs/69-visual-shell-redesign-spec.md`
- `docs/59-ceo-interactive-bootstrap-runtime-spec.md`

---

## Epic 71 — DOCUMENT EDITOR AS CENTER VIEW ✅

Objetivo: Migrar editor de documentos de modal overlay a vista central embebida.

### Hitos
- `DocumentEmbeddedView` basado en DocumentEditorModal sin Dialog wrapper
- Toolbar con visual/source toggle y save button
- `DocumentInspectorPanel` con metadata, status badges, historial, acciones
- `CenterPanel` switch renderiza `DocumentEmbeddedView` cuando `centerView.type === 'document'`
- Inspector renderiza `DocumentInspectorPanel`
- Links a documentos (DocumentLink, UoDetailPanel, chat mentions) abren en centro
- DocumentEditorModal eliminado
- Tests unitarios e integracion

### Spec de referencia
- `docs/69-visual-shell-redesign-spec.md`
- `docs/60-foundation-documents-spec.md`
- `docs/61-markdown-document-system-spec.md`

---

## Epic 72 — SHELL POLISH & NAVIGATION ✅

Objetivo: Pulir navegacion entre vistas centrales, topbar, shortcuts, y cleanup.

### Hitos
- ✅ Center view indicator en TopBar con icono + label de vista activa
- ✅ Historial de navegacion (back button) con `centerViewHistory` stack
- ✅ Keyboard shortcuts: Cmd+1=canvas, Cmd+2=chat, Cmd+3=ultimo doc
- ✅ Cleanup: eliminar codigo muerto, referencias obsoletas a chatDockOpen/openDocumentId write, toggleChatDock
- ✅ Actualizar i18n keys
- ✅ Smoke tests e2e (28 tests)

### Spec de referencia
- `docs/69-visual-shell-redesign-spec.md`

---

## Grafo de dependencias entre epics

```
Epic 69 (Infraestructura) ✅
    |
    +-----> Epic 70 (Chat) ✅
    |
    +-----> Epic 71 (Documentos) ✅
    |
    +-----> (ambos completados)
                |
                v
            Epic 72 (Polish) ✅
```

**Fase Visual Shell Redesign COMPLETADA** — todas las epics y tareas cerradas.
