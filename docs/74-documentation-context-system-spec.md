# Documentation, Context & Entity Workspace — Spec 74

## Contexto y motivacion

El Visual Shell Redesign (Epics 69-72) establecio un centro dinamico con tres vistas: canvas, chat y documento. Pero el shell aun trata cada vista como una superficie aislada. El siguiente salto de producto requiere tres sistemas interconectados:

1. **Documentacion jerarquica** — knowledge base del proyecto con carpetas, wiki-links, versionado
2. **Contexto de agentes** — cada agente referencia documentos de contexto con budget de tokens visible
3. **Entity Workspace** — al hacer click en un agente o UO, se abre un workspace multi-tab en el panel central

El centro del shell deja de ser "una vista" para convertirse en un **workspace con tabs internos** que se adaptan a la entidad seleccionada.

---

## Vision del usuario

### Explorer: Navegacion por estructura organizativa

- Agentes organizadores (CEO, COO, CTO, etc.)
- Agentes trabajadores (specialists)
- Unidades organizativas: empresa, departamento, equipo
- Click en cualquier entidad abre su workspace en el centro
- Tab "docs" muestra arbol de carpetas/archivos del proyecto

### Centro: Workspace multi-tab por entidad

Cada agente o UO abre un workspace con tabs:

| Tab | Aplica a | Descripcion |
|-----|----------|-------------|
| **Detalle/Edicion** | Todos | Editor markdown rico. Definicion versionada, revisable, con proposals. |
| **Canvas** | Todos | Posicion del agente/UO en el organigrama (distintos niveles zoom) |
| **Chat** | Solo agentes gestores | Conversacion con el agente |
| **Tareas** | Solo agentes planificadores | Epicas, planes, milestones, releases, progreso, incidencias |
| **Decisiones** | Solo agentes planificadores | Human-in-the-loop: decisiones pendientes, historial, estados |
| **Flujos** | Todos | Workflows en los que participa, en formato canvas visual |
| **Log** | Todos (futuro) | Historico completo de acciones del agente |

### Documentacion: Knowledge base con estructura de carpetas

- Tab "docs" en Explorer con arbol de carpetas/archivos
- Editor markdown rico en el centro
- Wiki-links `[[slug]]` navegables entre documentos
- Carpetas pueden tener contenido (README de seccion)
- Versionado, revision, publicacion

### Contexto de agentes

- Cada agente referencia N documentos como su contexto
- Visualizacion de budget de tokens (tiktoken real)
- Facil navegacion entre agente y sus archivos de contexto

---

## Decisiones de diseno

### Carpetas: `isFolder` flag en ProjectDocument

Reutiliza CRUD, dominio, auditoria existente. Una carpeta es un documento con `isFolder: true` y opcionalmente `bodyMarkdown`. Backward compat: documentos existentes son `isFolder: false`.

**Por que no un modelo `Folder` separado**: duplicaria todo el CRUD, permisos, auditoria, y API. Un flag booleano es mas simple y coherente con el patron de `linkedEntityIds` que ya existe.

### Jerarquia: `parentId` (no `path` string)

Mismo patron que `OrganizationalUnit.parentUoId`. `sortOrder: number` para orden dentro de carpeta. Arbol se construye client-side.

**Por que no path string**: mas facil de mover (un update vs reescribir todos los hijos), validacion anti-ciclos sencilla con recursion, consistente con el modelo de UOs.

### Wiki-links: `[[slug]]`, `[[slug|Display Text]]`, `[[slug#heading]]`

Coexiste con `@doc:slug` existente para chat mentions. Estandar de industria (Obsidian, Notion, MediaWiki).

### Contexto de agente: `contextDocumentIds: string[]` en LcpAgent

Mismo patron que `linkedEntityIds` en ProjectDocument. Token estimation con tiktoken (precision real, no heuristico).

### Centro: `CenterView` se extiende con `entity-workspace`

```typescript
type CenterView =
  | { type: 'canvas' }                                          // existente
  | { type: 'chat'; threadId: string | null; agentId?: string } // existente
  | { type: 'document'; documentId: string }                    // existente
  | { type: 'entity-workspace'; entityId: string; entityType: NodeType; activeTab?: WorkspaceTab }
```

Donde `WorkspaceTab = 'detail' | 'canvas' | 'chat' | 'tasks' | 'decisions' | 'flows' | 'log'`

Los tabs disponibles se determinan dinamicamente segun el tipo de entidad.

---

## Arquitectura tecnica

### Modelo de datos: ProjectDocument (extendido)

```prisma
model ProjectDocument {
  id              String   @id
  projectId       String   @map("project_id")
  slug            String   @db.VarChar(255)
  title           String   @db.VarChar(500)
  bodyMarkdown    String   @default("") @map("body_markdown")
  status          String   @default("draft") @db.VarChar(20)
  linkedEntityIds String[] @default([]) @map("linked_entity_ids")
  lastUpdatedBy   String   @default("system") @map("last_updated_by") @db.VarChar(255)
  sourceType      String   @default("system") @map("source_type") @db.VarChar(20)
  // --- nuevos campos ---
  parentId        String?  @map("parent_id")
  isFolder        Boolean  @default(false) @map("is_folder")
  sortOrder       Int      @default(0) @map("sort_order")
  // ---
  createdAt       DateTime @default(now()) @map("created_at") @db.Timestamptz
  updatedAt       DateTime @default(now()) @map("updated_at") @db.Timestamptz

  @@map("project_documents")
}
```

### Modelo de datos: LcpAgent (extendido)

```prisma
model LcpAgent {
  // ... campos existentes ...
  // --- nuevo campo ---
  contextDocumentIds String[] @default([]) @map("context_document_ids")
  // ---
}
```

### DTOs extendidos

```typescript
// shared-types/src/index.ts
export interface ProjectDocumentDto {
  // ... campos existentes ...
  parentId: string | null
  isFolder: boolean
  sortOrder: number
}

export interface CreateProjectDocumentDto {
  // ... campos existentes ...
  parentId?: string | null
  isFolder?: boolean
  sortOrder?: number
}

export interface UpdateProjectDocumentDto {
  // ... campos existentes ...
  parentId?: string | null
  sortOrder?: number
}

// Tipo para arbol client-side
export interface DocumentTreeNode extends ProjectDocumentDto {
  children: DocumentTreeNode[]
}
```

```typescript
// shared-types/src/live-company-types.ts
export interface LcpAgentDto {
  // ... campos existentes ...
  contextDocumentIds: string[]
}

export interface CreateLcpAgentDto {
  // ... campos existentes ...
  contextDocumentIds?: string[]
}

export interface UpdateLcpAgentDto {
  // ... campos existentes ...
  contextDocumentIds?: string[]
}
```

### Operaciones de dominio nuevas

#### `moveDocument(id, parentId, sortOrder)`

- Validacion anti-ciclos: recorrer ancestros del nuevo parent; si el documento aparece, rechazar
- No permitir mover a si mismo
- Si `parentId` no es null, verificar que existe y es `isFolder: true`
- Actualizar `sortOrder` de siblings si es necesario

#### `deleteDocument(id)`

- Si `isFolder: true` y tiene hijos: rechazar (409 Conflict)
- Eliminar el documento normalmente

### Store: entity-workspace

```typescript
// visual-workspace-store.ts

export type WorkspaceTab = 'detail' | 'canvas' | 'chat' | 'tasks' | 'decisions' | 'flows' | 'log'

export type CenterView =
  | { type: 'canvas' }
  | { type: 'chat'; threadId: string | null; agentId?: string }
  | { type: 'document'; documentId: string }
  | { type: 'entity-workspace'; entityId: string; entityType: string; activeTab: WorkspaceTab }

// Nuevas acciones
openEntityWorkspace(entityId: string, entityType: string, tab?: WorkspaceTab): void
setWorkspaceTab(tab: WorkspaceTab): void
```

### Tabs disponibles por entityType

| EntityType | detail | canvas | chat | tasks | decisions | flows |
|------------|--------|--------|------|-------|-----------|-------|
| company | si | si | - | si | si | si |
| department | si | si | - | si | - | si |
| team | si | si | - | si | - | si |
| coordinator-agent | si | si | si | si | si | si |
| specialist-agent | si | si | - | - | - | si |

### Token estimation

Se usa `js-tiktoken` (pure JS, sin WASM) para estimacion precisa de tokens:

```typescript
// packages/shared-types o packages/token-utils
import { encodingForModel } from 'js-tiktoken'

const enc = encodingForModel('claude-3-5-sonnet-20241022')

export function countTokens(text: string): number {
  return enc.encode(text).length
}
```

Budget visualization:
- Verde: < 70% del `contextWindow` del agente
- Amarillo: 70-90%
- Rojo: > 90%

### Wiki-links

Plugin remark que transforma `[[slug]]` en nodos link navegables:

```
[[slug]]               → link al documento con ese slug
[[slug|Display Text]]  → link con texto personalizado
[[slug#heading]]       → link a heading especifico del documento
```

El plugin:
1. Parsea el markdown buscando `[[...]]`
2. Genera nodos `wikiLink` en el AST
3. El componente `WikiLink` resuelve el slug contra el proyecto y navega con `openDocumentView(docId)`

### Backlinks

Computados client-side: dado un `targetSlug`, recorrer todos los documentos del proyecto buscando `[[targetSlug]]` o `[[targetSlug|...]]` en su `bodyMarkdown`. Mostrar en el inspector del documento.

---

## Explorer: Tab docs

Nuevo tab en el Explorer que muestra arbol de documentos del proyecto:

```
[docs] tab
  📁 Architecture
    📁 ADRs
      📄 Redis Streams CQRS
      📄 Single Postgres
    📄 Overview
  📁 Onboarding
    📄 Getting Started
  📄 Company Charter
  📄 Product Vision
```

**Comportamiento**:
- `useProjectDocuments(projectId)` obtiene lista plana → `buildDocumentTree()` construye arbol
- Click en documento → `openDocumentView(doc.id)`
- Click en carpeta → expand/collapse (doble-click abre como doc si tiene `bodyMarkdown`)
- Context menu: rename, delete, move
- Carpetas primero, luego archivos, ordenados por `sortOrder`
- Status badges (draft/review/approved) en cada documento
- Source type icon (user/agent/system)

---

## Entity Workspace en el centro

Cuando el usuario hace click en un agente o UO en el Entity Tree del Explorer, se abre un workspace multi-tab en el panel central.

```
+------------------------------------------------------------------+
|                          TopBar                                   |
|  [<-] TheCrew > Project > [Agent Icon] CEO Agent  [entity-ws]    |
+----------+-------------------------------+-----------------------+
|          | [Detail] [Canvas] [Chat] ...  |                       |
| Explorer |-------------------------------|      Inspector        |
|          |                               |   (adapta a tab)      |
|          |   Contenido del tab activo    |                       |
|          |                               |                       |
+----------+-------------------------------+-----------------------+
```

### Tab Detail

Editor markdown rico para la definicion de la entidad. Para agentes, esto incluye:
- Nombre, descripcion, rol
- Skills, inputs, outputs, responsibilities
- El contenido se obtiene de la entidad y se presenta en formato editable

### Tab Canvas

Canvas scoped mostrando la posicion del agente/UO en el organigrama. Zoom level apropiado segun la entidad:
- Company → L1
- Department → L2
- Team/Agent → L3

### Tab Chat

Solo para agentes coordinadores. Reutiliza `ChatConversationContent` con el `agentId` de la entidad.

### Tabs Tasks, Decisions, Flows

Placeholders con UI "Coming soon" en la primera fase. Se implementan en epics futuras.

---

## Grafo de dependencias entre epics

```
Epic A (Backend model) ──┬──> Epic B (Document Tree)
                         ├──> Epic C (Wiki-links) ──> Epic J (Backlinks)
                         ├──> Epic D (Agent Context)
                         └──> Epic E (Entity Workspace) ──┬──> Epic F (Tasks)
                                                          ├──> Epic G (Decisions)
                                                          ├──> Epic H (Flows)
                                                          └──> Epic I (Log)
```

**Epics B, C, D pueden ser paralelas** tras Epic A.
**Epic E** puede empezar tras Epic A pero se beneficia de D (context system).

---

## Archivos criticos a modificar

| Archivo | Cambio |
|---------|--------|
| `packages/shared-types/src/index.ts` | DTOs: parentId, isFolder, sortOrder, DocumentTreeNode |
| `packages/shared-types/src/live-company-types.ts` | LcpAgentDto + contextDocumentIds |
| `services/company-design/prisma/schema.prisma` | Columnas nuevas + migracion |
| `services/company-design/src/project-documents/domain/project-document.ts` | parentId, isFolder, sortOrder, move, delete validation |
| `services/company-design/src/lcp-agents/domain/lcp-agent.ts` | contextDocumentIds |
| `apps/web/src/stores/visual-workspace-store.ts` | CenterView union + entity-workspace + WorkspaceTab |
| `apps/web/src/components/visual-shell/explorer/explorer.tsx` | Tab docs |
| `apps/web/src/components/visual-shell/center-panel.tsx` | Case entity-workspace |
| `apps/web/src/components/visual-shell/inspector/inspector.tsx` | Entity workspace inspector |
| `apps/web/src/components/visual-shell/inspector/agent-detail-panel.tsx` | Context files section |
| `apps/web/src/components/documents/document-embedded-view.tsx` | Plugins + wiki-link toolbar |
| `apps/web/src/components/visual-shell/chat-dock/markdown-content.tsx` | Wiki-link preprocessing |
| `apps/web/src/components/visual-shell/explorer/entity-tree.tsx` | Click entity → openEntityWorkspace |
| `apps/web/src/components/visual-shell/top-bar.tsx` | Indicator entity-workspace |

## Archivos nuevos principales

| Archivo | Proposito |
|---------|-----------|
| `explorer/documents-panel.tsx` | Arbol de documentacion |
| `explorer/create-document-dialog.tsx` | Crear doc/folder |
| `lib/remark-wiki-links.ts` | Plugin remark para `[[slug]]` |
| `documents/wiki-link.tsx` | Componente clickable wiki-link |
| `inspector/agent-context-picker.tsx` | Picker de docs para contexto |
| `inspector/context-budget-bar.tsx` | Barra progreso tokens |
| `visual-shell/entity-workspace.tsx` | Container workspace multi-tab |
| `visual-shell/workspace-tabs/detail-tab.tsx` | Editor markdown de definicion |
| `visual-shell/workspace-tabs/canvas-tab.tsx` | Canvas scoped |
| `visual-shell/workspace-tabs/chat-tab.tsx` | Chat del agente |
| `hooks/use-document-token-estimates.ts` | Token counts via tiktoken |
| `lib/document-backlinks.ts` | Computo de backlinks |

---

## Verificacion (por epic)

```bash
pnpm turbo run typecheck
pnpm turbo run lint
pnpm turbo run test -- --run
pnpm --filter @the-crew/web build
```

Tests e2e por epic:
- **A**: Crear doc con parentId → listar → verificar jerarquia. Crear agente con contextDocumentIds → verificar.
- **B**: Abrir explorer → tab docs → ver arbol → click doc → abre en centro → crear folder → crear doc dentro
- **C**: Editar doc → insertar `[[otro-doc]]` → guardar → abrir → click link → navega
- **D**: Inspector agente → anadir context file → ver tokens → ver budget bar → remover
- **E**: Click agente en entity tree → workspace abre → cambiar tabs → inspector adapta
- **J**: Abrir doc → inspector muestra backlinks correctos
