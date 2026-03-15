# Backlog — Documentation, Context & Entity Workspace

## Epic 74A — HIERARCHICAL DOCUMENT MODEL (Backend + Types)

Objetivo: Extender el modelo de documentos para soportar carpetas y jerarquia, y el modelo de agentes para contexto.

### Hitos
- `ProjectDocumentDto` + `parentId`, `isFolder`, `sortOrder` en shared-types
- `LcpAgentDto` + `contextDocumentIds` en shared-types
- `DocumentTreeNode` type en shared-types
- Prisma schema: `ProjectDocument` + parentId, isFolder, sortOrder
- Prisma schema: `LcpAgent` + contextDocumentIds
- Migracion Prisma ejecutada
- Dominio/Repo/Service/Controller/Mapper actualizados en company-design
- `move(id, parentId, sortOrder)` con validacion anti-ciclos
- Delete validation: no delete folder con hijos
- Frontend API client + hooks: `useMoveProjectDocument()`
- Token estimation: `js-tiktoken` en shared-types o paquete dedicado
- Tests unitarios para todos los cambios

### Spec de referencia
- `docs/74-documentation-context-system-spec.md`

---

## Epic 74B — DOCUMENT TREE EN EXPLORER

Objetivo: Tab "docs" en Explorer con arbol de carpetas/archivos navegable.

### Hitos
- `explorer/documents-panel.tsx`: arbol recursivo, expand/collapse, status badges, source icons
- `explorer/create-document-dialog.tsx`: crear doc/folder con parent selector
- `explorer.tsx`: tab `docs` con icono `FileText`
- i18n: keys para tab docs en en/es
- `useProjectDocuments(projectId)` → `buildDocumentTree()` client-side
- Click doc → `openDocumentView(doc.id)`
- Click folder → expand/collapse
- Context menu: rename, delete, move
- Folders primero, luego files, por `sortOrder`
- Tests unitarios e integracion

### Spec de referencia
- `docs/74-documentation-context-system-spec.md`

---

## Epic 74C — WIKI-LINKS EN MARKDOWN

Objetivo: Links inter-documento navegables en editor y chat.

### Hitos
- `lib/remark-wiki-links.ts`: plugin remark para `[[slug]]` → link nodes
- `documents/wiki-link.tsx`: componente clickable, resuelve slug, navega
- `documents/wiki-link-autocomplete.tsx`: autocomplete al escribir `[[`
- `document-embedded-view.tsx`: plugin wiki-link + toolbar button
- `markdown-content.tsx`: extender preprocessor para `[[...]]`
- Soporte para `[[slug]]`, `[[slug|Display Text]]`, `[[slug#heading]]`
- Tests unitarios

### Spec de referencia
- `docs/74-documentation-context-system-spec.md`

---

## Epic 74D — SISTEMA DE CONTEXTO DE AGENTES

Objetivo: Agentes referencian documentos de contexto con budget visual de tokens.

### Hitos
- `inspector/agent-context-picker.tsx`: popover searchable de docs
- `inspector/context-budget-bar.tsx`: barra progreso con colores semaforo
- `hooks/use-document-token-estimates.ts`: token counts via tiktoken
- `inspector/agent-detail-panel.tsx`: seccion "Context Files" con tokens, budget bar, add/remove
- `inspector/agent-chat-inspector-panel.tsx`: context files del agente
- Budget visualization: verde (<70%), amarillo (70-90%), rojo (>90%)
- Per-file breakdown con token count individual
- Tests unitarios

### Spec de referencia
- `docs/74-documentation-context-system-spec.md`

---

## Epic 74E — ENTITY WORKSPACE (Centro multi-tab)

Objetivo: Click en agente/UO en Explorer abre workspace con tabs en el centro. Cambio arquitectural mas grande de esta fase.

### Hitos
- `visual-workspace-store.ts`: `CenterView` union extendida con `entity-workspace`
- `WorkspaceTab` type: `'detail' | 'canvas' | 'chat' | 'tasks' | 'decisions' | 'flows' | 'log'`
- Acciones: `openEntityWorkspace()`, `setWorkspaceTab()`
- `visual-shell/entity-workspace.tsx`: container con tab bar + content switch
- `visual-shell/entity-workspace-tabs.tsx`: tab bar dinamica segun entityType
- `visual-shell/workspace-tabs/detail-tab.tsx`: editor markdown de la definicion
- `visual-shell/workspace-tabs/canvas-tab.tsx`: canvas scoped al agente/UO
- `visual-shell/workspace-tabs/chat-tab.tsx`: chat del agente (reusa ChatConversationContent)
- `visual-shell/workspace-tabs/tasks-tab.tsx`: placeholder "Coming soon"
- `visual-shell/workspace-tabs/decisions-tab.tsx`: placeholder "Coming soon"
- `visual-shell/workspace-tabs/flows-tab.tsx`: placeholder "Coming soon"
- `center-panel.tsx`: case `entity-workspace` → `<EntityWorkspace />`
- `explorer/entity-tree.tsx`: click en agent/UO → `openEntityWorkspace()`
- `inspector/inspector.tsx`: panel contextual para entity-workspace
- `top-bar.tsx`: indicator con nombre de entidad
- Tests unitarios e integracion

### Spec de referencia
- `docs/74-documentation-context-system-spec.md`

---

## Epic 74F — TASKS TAB (futuro)
Placeholder. Se implementa cuando la infraestructura de tareas de agentes este lista.

## Epic 74G — DECISIONS TAB (futuro)
Placeholder. Se implementa cuando el sistema human-in-the-loop este definido.

## Epic 74H — FLOWS TAB (futuro)
Placeholder. Se implementa cuando los workflows tengan canvas visual propio.

## Epic 74I — LOG TAB (futuro)
Placeholder. Historico de acciones del agente.

---

## Epic 74J — BACKLINKS COMPUTADOS

Objetivo: Saber que documentos apuntan a un documento dado.

### Hitos
- `lib/document-backlinks.ts`: `computeBacklinks(docs, targetSlug)`
- `document-inspector-panel.tsx`: seccion "Backlinks" clickable
- Tests unitarios

### Spec de referencia
- `docs/74-documentation-context-system-spec.md`

---

## Grafo de dependencias entre epics

```
Epic 74A (Backend model) ──┬──> Epic 74B (Document Tree)
                           ├──> Epic 74C (Wiki-links) ──> Epic 74J (Backlinks)
                           ├──> Epic 74D (Agent Context)
                           └──> Epic 74E (Entity Workspace) ──┬──> Epic 74F (Tasks)
                                                              ├──> Epic 74G (Decisions)
                                                              ├──> Epic 74H (Flows)
                                                              └──> Epic 74I (Log)
```

**Epics 74B, 74C, 74D pueden ser paralelas** tras Epic 74A.
**Epic 74E** puede empezar tras 74A pero se beneficia de 74D (context system).
**Epics 74F-74I** son placeholders futuros.
