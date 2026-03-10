# ADR-002: Visual Shell Design

## Estado
Aceptada

## Fecha
2026-03-09

## Contexto

TheCrew necesita una nueva shell para el workspace de proyecto que coloque el canvas como centro de la experiencia. La shell actual es un layout clásico sidebar + header + main content optimizado para páginas CRUD. El pivot visual-first (ADR-001) requiere un layout que integre canvas, explorer, inspector y chat dock como ciudadanos de primera clase.

### Shell actual
```
┌─────────────────────────────────────────────────┐
│ Sidebar (240px) │ Header (56px)                 │
│                 ├───────────────────────────────│
│ - Platform nav  │ Main content (scrollable)     │
│ - Project nav   │ - CRUD pages                  │
│   (3 sections)  │ - Lists, forms, cards         │
│                 │                               │
└─────────────────────────────────────────────────┘
```

### Requisitos del pivot
- Canvas viewport central como área principal
- Explorer lateral izquierdo (tree, búsqueda, capas, validación)
- Inspector lateral derecho (contextual al nodo/edge seleccionado)
- Chat dock colapsable (conversación por scope)
- Toolbar del canvas (zoom, vista, layout, minimap)
- Coexistencia con las rutas CRUD existentes (admin views)

## Decisión

### 1. Layout de la Visual Shell

```
┌─────────────────────────────────────────────────────────────────┐
│                        TopBar (48px)                            │
│ [logo] [breadcrumb: Project > View] [release badge] [view mode]│
├──────────┬─────────────────────────────────────┬────────────────┤
│          │          CanvasToolbar (40px)        │                │
│          │ [zoom] [fit] [auto-layout] [minimap] │                │
│ Explorer ├─────────────────────────────────────┤   Inspector    │
│ (280px)  │                                     │   (320px)      │
│          │                                     │                │
│ ┌──────┐ │           Canvas                    │ ┌────────────┐ │
│ │ Tree │ │         Viewport                    │ │  Overview   │ │
│ │      │ │        (flex-1)                     │ │ Properties  │ │
│ │Search│ │                                     │ │ Relations   │ │
│ │      │ │                                     │ │ Validation  │ │
│ │Layers│ │                                     │ │  History    │ │
│ │      │ │                                     │ │   Chat      │ │
│ │Valid.│ │                                     │ └────────────┘ │
│ └──────┘ │                                     │                │
│          ├─────────────────────────────────────┤                │
│          │       ChatDock (collapsed: 40px)    │                │
│          │                (open: 200px)        │                │
├──────────┴─────────────────────────────────────┴────────────────┤
```

**CSS Strategy**: CSS Grid con áreas nombradas y paneles redimensionables.

```css
.visual-shell {
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-template-rows: 48px 1fr;
  grid-template-areas:
    "topbar  topbar   topbar"
    "explorer center  inspector";
  height: 100vh;
  overflow: hidden;
}
```

El área `center` contiene internamente un flex-col con `CanvasToolbar + Canvas + ChatDock`.

### 2. Paneles y sus estados

| Panel | Ancho/Alto por defecto | Min | Max | Colapsable | Redimensionable |
|-------|----------------------|-----|-----|------------|-----------------|
| Explorer | 280px | 200px | 400px | Sí (→ 0px + icono toggle) | Sí (horizontal) |
| Inspector | 320px | 240px | 480px | Sí (→ 0px + icono toggle) | Sí (horizontal) |
| ChatDock | 200px alto | 120px | 400px | Sí (→ 40px header-only) | Sí (vertical) |
| CanvasToolbar | 40px alto | - | - | No | No |
| TopBar | 48px alto | - | - | No | No |

**Comportamiento de paneles colapsados:**
- Explorer colapsado → solo barra de iconos vertical (48px) con toggle para cada sección
- Inspector colapsado → oculto completamente, toggle en la toolbar
- ChatDock colapsado → solo header con scope indicator y botón expandir

**Librería recomendada para resize**: `react-resizable-panels` (ligera, accesible, ya usada en muchos editores React).

### 3. TopBar

La TopBar reemplaza al Header actual dentro del visual workspace.

```
┌─────────────────────────────────────────────────────────────────┐
│ [TheCrew] [Platform > Project Name > Org View]  [Draft] [···]  │
│                                                  ┌────────────┐ │
│                                       view mode: │ Visual │ Admin│
│                                                  └────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

**Contenido:**
- Logo/home link (izquierda)
- Breadcrumb jerárquico: `Platform > Project > Current View` (izquierda-centro)
- Release badge: `Draft` / `Published v1.2` (centro-derecha)
- View mode toggle: `Visual | Admin` (derecha) — permite cambiar entre shell visual y shell CRUD
- Overflow menu: settings, keyboard shortcuts (derecha)

**Breadcrumb visual**: Muestra el scope actual del canvas. Al hacer drilldown en un department, el breadcrumb refleja la ruta: `Project > Org > Marketing Dept`. Cada nivel es clickable para navegar hacia arriba.

### 4. Explorer (panel izquierdo)

El Explorer es el panel de navegación y control del canvas.

**Secciones internas (tabs verticales o acordeón):**

#### 4.1 Entity Tree
- Árbol jerárquico del modelo: Company → Departments → (Roles, Capabilities, Workflows...)
- Click en nodo del tree → selecciona y centra en el canvas
- Iconos por tipo de entidad (reutilizar iconos de lucide-react del nav actual)
- Indicador visual de estado (warning/error overlay)
- Búsqueda integrada en la parte superior del tree (filter-as-you-type)

#### 4.2 Layers
- Lista de capas: Organization, Capabilities, Workflows, Contracts, Artifacts, Governance
- Toggle on/off por capa
- Opacidad ajustable por capa (futuro)
- Preset de capas por vista (org view activa Organization + Governance, etc.)

#### 4.3 Validation
- Resumen de errores/warnings del scope actual
- Agrupados por entidad
- Click en item → selecciona nodo en canvas + abre inspector en tab de validación
- Badge con contadores en la pestaña

#### 4.4 Search (futuro, placeholder en v1)
- Búsqueda global por nombre/tipo
- Resultados con preview y acción de navegar

**Implementación:**
- Componente `Explorer` con `ExplorerTabs` (iconos verticales) o accordion
- Cada sección es un componente lazy-loaded
- Estado compartido vía React context o Zustand store

### 5. Canvas Viewport

El canvas es el área central y principal de la experiencia.

**Librería recomendada**: [React Flow](https://reactflow.dev/) (v12+)
- Grafo de nodos y edges con zoom, pan, selección
- Nodos custom tipados (uno por tipo semántico)
- Edges custom tipados (uno por tipo de edge)
- Minimap integrado
- Background con dots/grid configurable
- Controles de zoom nativos
- Eventos: onNodeClick, onEdgeClick, onSelectionChange, onNodeDragStop
- Performance: virtualización nativa para grafos grandes

**Justificación de React Flow:**
- Es el estándar de facto para editores de nodos en React
- Soporta nodos custom con JSX completo (permite nodos semánticos ricos)
- Tiene minimap, controles, background como componentes plug-and-play
- Maneja zoom/pan/selection sin código custom
- Licencia MIT
- Comunidad activa y mantenido

**CanvasToolbar** (barra horizontal sobre el canvas):
```
[Zoom -] [100%] [Zoom +] [Fit View] | [Auto Layout] | [Minimap ☐] | [Scope: Company Org]
```

**Interacciones del canvas:**
- Click en nodo → selecciona → Inspector muestra detalle
- Click en edge → selecciona → Inspector muestra detalle del edge
- Double-click en nodo de scope (department, workflow) → drilldown
- Click en vacío → deselecciona → Inspector muestra resumen del scope
- Drag nodo → mueve posición (no cambia semántica, solo layout)
- Ctrl+click → multi-selección
- Scroll → zoom
- Drag vacío → pan

### 6. Inspector (panel derecho)

Panel contextual que muestra detalle y permite edición del elemento seleccionado.

**Estados del Inspector:**

#### 6.1 Nada seleccionado → Scope Summary
- Nombre del scope actual (Project, Department, Workflow)
- Estadísticas: n nodos, n edges, n warnings
- Acciones rápidas: crear nodo en este scope

#### 6.2 Nodo seleccionado → Node Inspector
Tabs:
- **Overview**: nombre, tipo, descripción, icono, estado visual
- **Properties**: campos editables del dominio (inline edit, auto-save)
- **Relations**: lista de edges entrantes/salientes con tipo y target (clickable)
- **Validation**: errores/warnings específicos de este nodo
- **History**: audit trail del nodo (últimos cambios)
- **Chat**: conversación contextual sobre este nodo

#### 6.3 Edge seleccionado → Edge Inspector
Tabs:
- **Overview**: tipo de edge, source → target, descripción
- **Properties**: metadata del edge (contract asociado, condiciones)
- **Validation**: reglas de conexión aplicables

#### 6.4 Multi-selección → Batch Summary
- Contadores por tipo
- Acciones batch: mover a capa, eliminar, exportar

**Implementación:**
- Componente `Inspector` con `InspectorPanel` interno
- Tab system reutilizando shadcn/ui Tabs
- Formularios inline con auto-save (debounce 500ms) via mutation hooks existentes
- Carga lazy por tab

### 7. Chat Dock

Panel inferior colapsable para conversación por scope.

**Scope del chat:**
- Company-level: chat general del proyecto
- Department-level: chat del departamento en drilldown
- Node-level: chat contextual cuando un nodo está seleccionado

**Layout:**
```
┌───────────────────────────────────────────┐
│ Chat: [scope icon] Marketing Dept  [▼][×] │
├───────────────────────────────────────────┤
│ messages area (scrollable)                │
│                                           │
├───────────────────────────────────────────┤
│ [input field                    ] [Send]  │
└───────────────────────────────────────────┘
```

**Estados:**
- Collapsed: solo header bar (40px) mostrando scope + unread indicator
- Open: header + messages + input (200px default, redimensionable)
- Hidden: si el usuario lo cierra completamente (toggle desde toolbar)

**Nota**: La implementación de persistencia y backend del chat es tarea de VIS-016. En esta tarea solo se define el dock como contenedor visual.

### 8. Estructura de rutas

**Coexistencia visual + admin:**

```
/                                    → Platform (projects list)
/projects/$projectId                 → Redirect a vista por defecto
/projects/$projectId/workspace       → Visual Shell (nuevo)
/projects/$projectId/workspace/$view → Visual Shell con vista específica
/projects/$projectId/admin/*         → Admin Shell (rutas CRUD actuales)
```

Alternativa más simple (recomendada):

```
/                                    → Platform (projects list)
/projects/$projectId                 → Visual Shell (nuevo default)
/projects/$projectId/$view           → Visual Shell con vista (org, dept, workflow)
/projects/$projectId/admin/*         → Admin views (legacy CRUD)
```

**Decisión**: La segunda opción. El workspace visual es el default al entrar a un proyecto. Las rutas admin se agrupan bajo `/admin/`.

**Vistas del canvas como rutas:**
- `/projects/$projectId` → redirect a `/projects/$projectId/org`
- `/projects/$projectId/org` → Company org canvas
- `/projects/$projectId/departments/$deptId` → Department drilldown canvas
- `/projects/$projectId/workflows/$workflowId` → Workflow drilldown canvas
- `/projects/$projectId/admin/departments` → Admin list (legacy)
- `/projects/$projectId/admin/capabilities` → Admin list (legacy)
- etc.

**Implicación en rutas existentes**: Las rutas actuales (`/projects/$projectId/departments`, etc.) se mueven bajo `/admin/`. El redirect se implementa en VIS-005.

### 9. Árbol de componentes React

```
<VisualShell>                              # grid layout
  <TopBar />                               # breadcrumb, badges, view toggle
  <ResizablePanelGroup direction="horizontal">
    <ResizablePanel>
      <Explorer>                           # panel izquierdo
        <ExplorerTabs>
          <EntityTree />
          <LayersPanel />
          <ValidationSummary />
          <SearchPanel />                  # placeholder v1
        </ExplorerTabs>
      </Explorer>
    </ResizablePanel>
    <ResizableHandle />
    <ResizablePanel>
      <div className="flex flex-col h-full">
        <CanvasToolbar />
        <CanvasViewport>                   # React Flow wrapper
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={customNodeTypes}
            edgeTypes={customEdgeTypes}
          >
            <MiniMap />
            <Controls />
            <Background />
          </ReactFlow>
        </CanvasViewport>
        <ChatDock />                       # colapsable
      </div>
    </ResizablePanel>
    <ResizableHandle />
    <ResizablePanel>
      <Inspector>                          # panel derecho
        <InspectorHeader />
        <InspectorTabs>
          <OverviewTab />
          <PropertiesTab />
          <RelationsTab />
          <ValidationTab />
          <HistoryTab />
          <ChatTab />
        </InspectorTabs>
      </Inspector>
    </ResizablePanel>
  </ResizablePanelGroup>
</VisualShell>
```

### 10. Estado compartido

**Zustand store** para el estado del workspace visual:

```typescript
interface VisualWorkspaceState {
  // Scope
  projectId: string
  currentView: 'org' | 'department' | 'workflow' | 'detail'
  scopeId: string | null          // deptId or workflowId for drilldown

  // Selection
  selectedNodeIds: string[]
  selectedEdgeIds: string[]

  // Panels
  explorerCollapsed: boolean
  inspectorCollapsed: boolean
  chatDockOpen: boolean

  // Layers
  activeLayers: Set<string>

  // Actions
  selectNode(id: string): void
  selectEdge(id: string): void
  clearSelection(): void
  drillDown(nodeType: string, nodeId: string): void
  navigateUp(): void
  toggleLayer(layer: string): void
  toggleExplorer(): void
  toggleInspector(): void
  toggleChatDock(): void
}
```

**Por qué Zustand y no React Context:**
- Múltiples componentes leen subsets del estado (selector-based)
- Evita re-renders innecesarios del canvas cuando cambia el inspector
- Permite acceder al estado fuera de React (e.g., en handlers de React Flow)
- Ligero (< 2KB) y sin boilerplate

**Datos del grafo**: Se mantienen en React Flow's internal store + TanStack Query para fetch/cache del graph projection DTO.

### 11. Dependencias nuevas

| Paquete | Propósito | Tamaño aprox |
|---------|-----------|-------------|
| `@xyflow/react` | Canvas de nodos/edges | ~150KB gzip |
| `react-resizable-panels` | Paneles redimensionables | ~8KB gzip |
| `zustand` | Estado del workspace | ~2KB gzip |

No se añaden más dependencias. shadcn/ui + Tailwind + lucide-react ya cubren el resto.

### 12. Responsive y mínimos

- **Ancho mínimo del canvas**: 400px (se colapsan paneles laterales si la ventana es < 1024px)
- **Breakpoint collapse**: < 1024px → explorer colapsado a iconos, inspector oculto
- **Breakpoint mobile**: < 768px → solo canvas + bottom sheet para inspector (futuro, no v1)
- **Zoom mínimo del canvas**: 0.1x
- **Zoom máximo del canvas**: 4x

### 13. Keyboard shortcuts

| Shortcut | Acción |
|----------|--------|
| `1` | Toggle Explorer |
| `2` | Toggle Inspector |
| `Escape` | Deseleccionar / cerrar panel activo |
| `Delete` / `Backspace` | Eliminar selección (con confirmación) |
| `Ctrl+F` / `Cmd+F` | Buscar en Explorer |
| `Ctrl+0` / `Cmd+0` | Fit view |
| `Ctrl+=` / `Cmd+=` | Zoom in |
| `Ctrl+-` / `Cmd+-` | Zoom out |
| `Enter` on selected node | Drilldown (si es scope node) |
| `Backspace` on empty | Navigate up |

### 14. Migración incremental

La migración de la shell actual a la visual shell es no-destructiva:

1. **VIS-004 (esta tarea)**: solo diseño, no implementación.
2. **VIS-005**: implementa `VisualShell` con placeholders. Las rutas CRUD se mueven bajo `/admin/`. El proyecto default redirect va a la visual shell.
3. **VIS-006+**: los placeholders se reemplazan con canvas, inspector y explorer reales.

La shell CRUD actual (`ShellLayout`, `Sidebar`, `Header`) se conserva y se reutiliza en las rutas `/admin/*`.

---

## Consecuencias

### Positivas
- Layout diseñado para canvas-first desde el inicio
- Paneles redimensionables y colapsables dan flexibilidad al usuario
- Coexistencia limpia entre visual y admin views
- Dependencias mínimas y bien establecidas (React Flow, Zustand)
- Keyboard-first navigation posible

### Negativas / Trade-offs
- React Flow añade ~150KB al bundle (mitigado con code splitting por ruta)
- Zustand introduce un segundo pattern de estado junto a TanStack Query (mitigado: Zustand solo para UI state, TanStack Query solo para server state)
- Las rutas admin requieren mover paths existentes (one-time migration en VIS-005)

### Riesgos
- **Performance con grafos grandes**: React Flow virtualiza nodos fuera de viewport, pero grafos de 500+ nodos podrían requerir agrupación. Mitigación: semantic zoom limita nodos visibles por nivel.
- **Complejidad del inspector**: muchas tabs y formularios inline. Mitigación: carga lazy por tab, auto-save con debounce.

---

## Archivos esperados en implementación (VIS-005)

```
apps/web/src/
  components/
    visual-shell/
      visual-shell.tsx           # grid layout principal
      top-bar.tsx                # breadcrumb, badges, view toggle
      canvas-toolbar.tsx         # zoom, fit, layout controls
      canvas-viewport.tsx        # React Flow wrapper
      explorer/
        explorer.tsx             # panel izquierdo container
        entity-tree.tsx          # árbol jerárquico
        layers-panel.tsx         # toggle de capas
        validation-summary.tsx   # resumen de errores/warnings
      inspector/
        inspector.tsx            # panel derecho container
        inspector-header.tsx     # tipo + nombre del seleccionado
        overview-tab.tsx         # resumen
        properties-tab.tsx       # edición inline
        relations-tab.tsx        # edges in/out
        validation-tab.tsx       # errores del nodo
        history-tab.tsx          # audit trail
      chat-dock/
        chat-dock.tsx            # panel inferior colapsable
    canvas-nodes/
      company-node.tsx           # nodo custom: Company
      department-node.tsx        # nodo custom: Department
      role-node.tsx              # nodo custom: Role
      ... (uno por tipo)
    canvas-edges/
      semantic-edge.tsx          # edge custom con label de tipo
  stores/
    visual-workspace-store.ts    # Zustand store
  routes/
    projects/
      $projectId.tsx             # (modificado: redirect a visual shell)
      $projectId/
        index.tsx                # (modificado: visual shell default)
        org.tsx                  # org canvas view
        departments/
          $departmentId.tsx      # department drilldown
        workflows/
          $workflowId.tsx        # workflow drilldown
        admin/
          index.tsx              # redirect legacy
          departments.tsx        # (movido desde raíz)
          capabilities.tsx       # (movido desde raíz)
          ...
```

## Referencias
- ADR-001: Visual-First Pivot
- `docs/01-arquitectura-inicial.md` — UI shell objetivo
- `docs/07-lenguaje-visual-y-gramatica.md` — Nodos, edges, semantic zoom, inspector
- `docs/03-backlog-completo.md` — Epic 22: Visual Shell Refactor
- React Flow docs: https://reactflow.dev/
