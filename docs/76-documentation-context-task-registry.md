# Task Registry — Documentation, Context & Entity Workspace

## Leyenda
- status: todo | in-progress | done | blocked
- mode: plan | edit
- fresh-session: yes | no

| task-id | epic | status | mode | fresh-session | parallel-group | depends-on | objetivo |
|---------|-----:|--------|------|---------------|----------------|------------|----------|
| DCS-001 | 74A | todo | edit | yes | A | - | Extender shared-types: `ProjectDocumentDto` + parentId, isFolder, sortOrder. `CreateProjectDocumentDto` / `UpdateProjectDocumentDto` extendidos. `DocumentTreeNode` type. |
| DCS-002 | 74A | todo | edit | yes | A | - | Extender shared-types: `LcpAgentDto` + contextDocumentIds. `CreateLcpAgentDto` / `UpdateLcpAgentDto` extendidos. |
| DCS-003 | 74A | todo | edit | yes | B | DCS-001, DCS-002 | Prisma migration: ProjectDocument + parentId, isFolder, sortOrder. LcpAgent + contextDocumentIds. Ejecutar migration. |
| DCS-004 | 74A | todo | edit | yes | C | DCS-003 | Dominio company-design: ProjectDocument aggregate + parentId, isFolder, sortOrder. Mapper, repository, service actualizados. Validacion move (anti-ciclos). Delete validation (no folder con hijos). Tests unitarios dominio. |
| DCS-005 | 74A | todo | edit | yes | C | DCS-003 | Dominio company-design: LcpAgent aggregate + contextDocumentIds. Mapper, repository, service actualizados. Tests unitarios dominio. |
| DCS-006 | 74A | todo | edit | yes | D | DCS-004 | Controller company-design: endpoint `PATCH /project-documents/:id/move` con body `{ parentId, sortOrder }`. Validacion de input. Tests e2e del endpoint. |
| DCS-007 | 74A | todo | edit | yes | D | DCS-004, DCS-005 | Frontend API client: `moveProjectDocument(id, parentId, sortOrder)`. Hook `useMoveProjectDocument()`. Actualizar types del API client para nuevos campos. |
| DCS-008 | 74A | todo | edit | yes | A | - | Token estimation: agregar `js-tiktoken` a shared-types (o crear packages/token-utils). Funcion `countTokens(text: string): number`. Tests unitarios. |
| DCS-009 | 74B | todo | edit | yes | E | DCS-007 | Crear `explorer/documents-panel.tsx`: arbol recursivo con expand/collapse, status badges, source icons. `buildDocumentTree()` utility. Click doc abre en centro. Click folder expand/collapse. Tests. |
| DCS-010 | 74B | todo | edit | yes | E | DCS-009 | Integrar tab "docs" en `explorer.tsx`. i18n keys. `create-document-dialog.tsx` con parent selector. Context menu (rename, delete, move). Tests. |
| DCS-011 | 74C | todo | edit | yes | E | DCS-007 | Crear `lib/remark-wiki-links.ts`: plugin remark que parsea `[[slug]]`, `[[slug\|text]]`, `[[slug#heading]]`. Crear `documents/wiki-link.tsx`: componente clickable. Tests unitarios del parser. |
| DCS-012 | 74C | todo | edit | no | F | DCS-011 | Integrar wiki-links en `document-embedded-view.tsx` (plugin + toolbar button) y `markdown-content.tsx` (preprocessor). Tests de renderizado. |
| DCS-013 | 74D | todo | edit | yes | E | DCS-007, DCS-008 | Crear `inspector/agent-context-picker.tsx` (popover searchable) y `inspector/context-budget-bar.tsx` (barra progreso semaforo). `hooks/use-document-token-estimates.ts`. Tests. |
| DCS-014 | 74D | todo | edit | no | F | DCS-013 | Integrar context picker en `agent-detail-panel.tsx` (seccion Context Files). Integrar en `agent-chat-inspector-panel.tsx`. Per-file token breakdown. Tests. |
| DCS-015 | 74E | todo | edit | yes | G | DCS-007 | Extender `visual-workspace-store.ts`: `WorkspaceTab` type, `CenterView` union con `entity-workspace`, acciones `openEntityWorkspace()` y `setWorkspaceTab()`. Tests unitarios del store. |
| DCS-016 | 74E | todo | edit | yes | G | DCS-015 | Crear `entity-workspace.tsx` (container), `entity-workspace-tabs.tsx` (tab bar dinamica). Logica de tabs disponibles por entityType. Tests. |
| DCS-017 | 74E | todo | edit | yes | H | DCS-016 | Crear workspace tabs: `detail-tab.tsx` (editor markdown), `canvas-tab.tsx` (canvas scoped), `chat-tab.tsx` (reusa ChatConversationContent). Tests. |
| DCS-018 | 74E | todo | edit | yes | H | DCS-016 | Crear workspace tabs placeholder: `tasks-tab.tsx`, `decisions-tab.tsx`, `flows-tab.tsx` con UI "Coming soon". Tests. |
| DCS-019 | 74E | todo | edit | yes | I | DCS-017, DCS-018 | Integrar entity-workspace en shell: `center-panel.tsx` case, `entity-tree.tsx` click handler, `inspector.tsx` panel contextual, `top-bar.tsx` indicator. Tests integracion. |
| DCS-020 | 74J | todo | edit | yes | F | DCS-011 | Crear `lib/document-backlinks.ts`: `computeBacklinks(docs, targetSlug)`. Integrar en `document-inspector-panel.tsx` seccion "Backlinks". Tests. |
| DCS-021 | - | todo | edit | yes | J | DCS-010, DCS-012, DCS-014, DCS-019, DCS-020 | Smoke tests e2e: explorer docs tab, wiki-links, agent context, entity workspace, backlinks. Actualizar docs. |

## Grafo de dependencias

```
A: DCS-001 + DCS-002 + DCS-008 (types + tiktoken)
    |
B: DCS-003 (Prisma migration)
    |
C: DCS-004 + DCS-005 (dominio)
    |
D: DCS-006 + DCS-007 (controller + frontend API)
    |
    +---> E: DCS-009 + DCS-010 (doc tree)     DCS-011 (wiki-links)     DCS-013 (context)     DCS-015 + DCS-016 (workspace store + container)
    |         |                                    |                        |                        |
    |     (done)                               F: DCS-012 (integrate)   F: DCS-014 (integrate)  H: DCS-017 + DCS-018 (tabs)
    |                                              |                        |                        |
    |                                          F: DCS-020 (backlinks)       |                    I: DCS-019 (shell integration)
    |                                              |                        |                        |
    +---------+------------------------------------+------------------------+------------------------+
              |
          J: DCS-021 (smoke tests)
```

Las ramas doc-tree (E), wiki-links (E-F), context (E-F), y workspace (G-I) son **paralelizables** despues de D.

## Estado actual
Fase no iniciada. Proxima tarea: **DCS-001** (shared-types: ProjectDocumentDto extension).

## Contexto para ejecucion

### DCS-001 — Extend ProjectDocumentDto
Archivos afectados:
- `packages/shared-types/src/index.ts`

Campos nuevos en `ProjectDocumentDto`: `parentId: string | null`, `isFolder: boolean`, `sortOrder: number`.
Campos nuevos en `CreateProjectDocumentDto`: `parentId?: string | null`, `isFolder?: boolean`, `sortOrder?: number`.
Campos nuevos en `UpdateProjectDocumentDto`: `parentId?: string | null`, `sortOrder?: number` (no se puede cambiar `isFolder` post-creacion).
Tipo nuevo: `DocumentTreeNode extends ProjectDocumentDto { children: DocumentTreeNode[] }`.

### DCS-002 — Extend LcpAgentDto
Archivos afectados:
- `packages/shared-types/src/live-company-types.ts`

Campo nuevo en `LcpAgentDto`: `contextDocumentIds: string[]`.
Campo nuevo en `CreateLcpAgentDto`: `contextDocumentIds?: string[]`.
Campo nuevo en `UpdateLcpAgentDto`: `contextDocumentIds?: string[]`.

### DCS-003 — Prisma migration
Archivos afectados:
- `services/company-design/prisma/schema.prisma`

Agregar a `ProjectDocument`: `parentId String? @map("parent_id")`, `isFolder Boolean @default(false) @map("is_folder")`, `sortOrder Int @default(0) @map("sort_order")`.
Agregar a `LcpAgent`: `contextDocumentIds String[] @default([]) @map("context_document_ids")`.
Ejecutar `pnpm --filter @the-crew/company-design prisma migrate dev --name add-doc-hierarchy-agent-context`.

### DCS-008 — Token estimation
Opcion A: agregar `js-tiktoken` como dependencia de `packages/shared-types`.
Opcion B: crear `packages/token-utils` con su propio `package.json`.
Funcion: `countTokens(text: string, model?: string): number` usando `encodingForModel`.
Tests: verificar que cuenta tokens correctamente para textos simples y complejos.

### DCS-015 — Store: entity-workspace
Archivos afectados:
- `apps/web/src/stores/visual-workspace-store.ts`
- `apps/web/src/__tests__/visual-workspace-store.test.ts`

Extender `CenterView` con `{ type: 'entity-workspace'; entityId: string; entityType: string; activeTab: WorkspaceTab }`.
Agregar `WorkspaceTab` type.
Nuevas acciones: `openEntityWorkspace(entityId, entityType, tab?)` y `setWorkspaceTab(tab)`.
`setWorkspaceTab` solo cambia `activeTab` dentro del mismo entity-workspace (no genera history entry).
`openEntityWorkspace` genera history entry si cambia de tipo o de entidad.
