import { create } from 'zustand'
import type { LayerId, ZoomLevel, VisualNodeDto, VisualEdgeDto, NodeType, NodeStatus, ValidationIssue, BreadcrumbEntry, EdgeType, VisualDiffStatus } from '@the-crew/shared-types'
import { DEFAULT_LAYERS_PER_LEVEL } from '@the-crew/shared-types'

export type CanvasView = 'org' | 'department' | 'workflow'

export interface NavigationEntry {
  view: CanvasView
  entityId: string | null
  focusNodeId: string | null
}

export interface PendingConnection {
  sourceNodeId: string
  sourceNodeType: NodeType
  validTargetTypes: NodeType[]
}

export interface EdgeTypePickerState {
  options: EdgeType[]
  sourceNodeId: string
  targetNodeId: string
}

export interface MetadataInputState {
  edgeType: EdgeType
  sourceNodeId: string
  targetNodeId: string
}

export interface DeleteConfirmState {
  edgeType: EdgeType
  sourceNodeId: string
  targetNodeId: string
}

export interface VisualWorkspaceState {
  currentView: CanvasView
  zoomLevel: ZoomLevel
  scopeEntityId: string | null
  projectId: string | null

  selectedNodeIds: string[]
  selectedEdgeIds: string[]

  graphNodes: VisualNodeDto[]
  graphEdges: VisualEdgeDto[]
  focusNodeId: string | null

  explorerCollapsed: boolean
  inspectorCollapsed: boolean
  chatDockOpen: boolean

  activeLayers: LayerId[]
  nodeTypeFilter: NodeType[] | null
  statusFilter: NodeStatus[] | null

  validationIssues: ValidationIssue[]
  showValidationOverlay: boolean

  // Connection editing (VIS-008b)
  pendingConnection: PendingConnection | null
  edgeTypePicker: EdgeTypePickerState | null
  metadataInput: MetadataInputState | null

  // Edge deletion (VIS-008d)
  deleteConfirm: DeleteConfirmState | null

  // Collapse/expand (VIS-011d)
  collapsedNodeIds: string[]

  // Navigation & breadcrumb (VIS-011a)
  breadcrumb: BreadcrumbEntry[]
  navigationStack: NavigationEntry[]
  transitionDirection: 'drill-in' | 'drill-out' | null
  transitionTargetId: string | null

  // Diff mode (VIS-015f)
  isDiffMode: boolean
  diffFilter: VisualDiffStatus[] | null
  baseReleaseId: string | null
  compareReleaseId: string | null

  // Entity creation form
  entityFormNodeType: NodeType | null
  pendingFocusNodeId: string | null

  setProjectId(projectId: string): void
  setView(view: CanvasView, entityId?: string | null): void
  selectNodes(ids: string[]): void
  selectEdges(ids: string[]): void
  clearSelection(): void
  setGraphNodes(nodes: VisualNodeDto[]): void
  setGraphEdges(edges: VisualEdgeDto[]): void
  focusNode(id: string): void
  clearFocus(): void
  toggleExplorer(): void
  toggleInspector(): void
  toggleChatDock(): void
  toggleLayer(layer: LayerId): void
  setActiveLayers(layers: LayerId[]): void
  resetToDefaults(level: ZoomLevel): void
  setNodeTypeFilter(types: NodeType[] | null): void
  setStatusFilter(statuses: NodeStatus[] | null): void
  clearFilters(): void
  setValidationIssues(issues: ValidationIssue[]): void
  toggleValidationOverlay(): void

  // Connection editing (VIS-008b)
  startConnection(sourceNodeId: string, sourceNodeType: NodeType, validTargetTypes: NodeType[]): void
  cancelConnection(): void
  showEdgeTypePicker(options: EdgeType[], sourceNodeId: string, targetNodeId: string): void
  dismissEdgeTypePicker(): void
  showMetadataInput(edgeType: EdgeType, sourceNodeId: string, targetNodeId: string): void
  dismissMetadataInput(): void

  // Edge deletion (VIS-008d)
  showDeleteConfirm(edgeType: EdgeType, sourceNodeId: string, targetNodeId: string): void
  dismissDeleteConfirm(): void

  // Collapse/expand (VIS-011d)
  toggleCollapse(nodeId: string): void
  expandAll(): void
  collapseAll(): void

  // Entity creation form
  showEntityForm(nodeType: NodeType): void
  dismissEntityForm(): void
  setPendingFocus(id: string): void
  clearPendingFocus(): void

  // Diff mode (VIS-015f)
  enterDiffMode(baseReleaseId: string, compareReleaseId: string): void
  exitDiffMode(): void
  setDiffFilter(statuses: VisualDiffStatus[] | null): void
  swapDiffReleases(): void

  // Navigation & breadcrumb (VIS-011a)
  setBreadcrumb(entries: BreadcrumbEntry[]): void
  pushNavigation(entry: NavigationEntry): void
  popNavigation(): NavigationEntry | null
  clearNavigationStack(): void
  startTransition(direction: 'drill-in' | 'drill-out', targetId: string): void
  clearTransition(): void
}

function zoomLevelForView(view: CanvasView): ZoomLevel {
  switch (view) {
    case 'org':
      return 'L1'
    case 'department':
      return 'L2'
    case 'workflow':
      return 'L3'
  }
}

export const useVisualWorkspaceStore = create<VisualWorkspaceState>((set, get) => ({
  currentView: 'org',
  zoomLevel: 'L1',
  scopeEntityId: null,
  projectId: null,

  selectedNodeIds: [],
  selectedEdgeIds: [],

  graphNodes: [],
  graphEdges: [],
  focusNodeId: null,

  explorerCollapsed: false,
  inspectorCollapsed: false,
  chatDockOpen: false,

  activeLayers: DEFAULT_LAYERS_PER_LEVEL.L1,
  nodeTypeFilter: null,
  statusFilter: null,

  validationIssues: [],
  showValidationOverlay: true,

  pendingConnection: null,
  edgeTypePicker: null,
  metadataInput: null,
  deleteConfirm: null,

  collapsedNodeIds: [],
  breadcrumb: [],
  navigationStack: [],
  transitionDirection: null,
  transitionTargetId: null,

  isDiffMode: false,
  diffFilter: null,
  baseReleaseId: null,
  compareReleaseId: null,

  entityFormNodeType: null,
  pendingFocusNodeId: null,

  setProjectId(projectId) {
    set({ projectId })
  },

  setView(view, entityId = null) {
    const zoomLevel = zoomLevelForView(view)
    set({
      currentView: view,
      zoomLevel,
      scopeEntityId: entityId,
      selectedNodeIds: [],
      selectedEdgeIds: [],
      graphNodes: [],
      graphEdges: [],
      focusNodeId: null,
      activeLayers: DEFAULT_LAYERS_PER_LEVEL[zoomLevel],
      nodeTypeFilter: null,
      statusFilter: null,
      pendingConnection: null,
      edgeTypePicker: null,
      metadataInput: null,
      deleteConfirm: null,
      collapsedNodeIds: [],
      breadcrumb: [],
    })
  },

  selectNodes(ids) {
    set({ selectedNodeIds: ids, selectedEdgeIds: [] })
  },

  selectEdges(ids) {
    set({ selectedEdgeIds: ids, selectedNodeIds: [] })
  },

  clearSelection() {
    set({ selectedNodeIds: [], selectedEdgeIds: [] })
  },

  setGraphNodes(nodes) {
    set({ graphNodes: nodes })
  },

  setGraphEdges(edges) {
    set({ graphEdges: edges })
  },

  focusNode(id) {
    set({ focusNodeId: id })
  },

  clearFocus() {
    set({ focusNodeId: null })
  },

  toggleExplorer() {
    set((s) => ({ explorerCollapsed: !s.explorerCollapsed }))
  },

  toggleInspector() {
    set((s) => ({ inspectorCollapsed: !s.inspectorCollapsed }))
  },

  toggleChatDock() {
    set((s) => ({ chatDockOpen: !s.chatDockOpen }))
  },

  toggleLayer(layer) {
    set((s) => {
      const has = s.activeLayers.includes(layer)
      return {
        activeLayers: has
          ? s.activeLayers.filter((l) => l !== layer)
          : [...s.activeLayers, layer],
      }
    })
  },

  setActiveLayers(layers) {
    set({ activeLayers: layers })
  },

  resetToDefaults(level) {
    set({ activeLayers: DEFAULT_LAYERS_PER_LEVEL[level] })
  },

  setNodeTypeFilter(types) {
    set({ nodeTypeFilter: types })
  },

  setStatusFilter(statuses) {
    set({ statusFilter: statuses })
  },

  clearFilters() {
    set({ nodeTypeFilter: null, statusFilter: null })
  },

  setValidationIssues(issues) {
    set({ validationIssues: issues })
  },

  toggleValidationOverlay() {
    set((s) => ({ showValidationOverlay: !s.showValidationOverlay }))
  },

  startConnection(sourceNodeId, sourceNodeType, validTargetTypes) {
    set({ pendingConnection: { sourceNodeId, sourceNodeType, validTargetTypes } })
  },

  cancelConnection() {
    set({ pendingConnection: null, edgeTypePicker: null, metadataInput: null })
  },

  showEdgeTypePicker(options, sourceNodeId, targetNodeId) {
    set({ edgeTypePicker: { options, sourceNodeId, targetNodeId } })
  },

  dismissEdgeTypePicker() {
    set({ edgeTypePicker: null })
  },

  showMetadataInput(edgeType, sourceNodeId, targetNodeId) {
    set({ metadataInput: { edgeType, sourceNodeId, targetNodeId } })
  },

  dismissMetadataInput() {
    set({ metadataInput: null })
  },

  showDeleteConfirm(edgeType, sourceNodeId, targetNodeId) {
    set({ deleteConfirm: { edgeType, sourceNodeId, targetNodeId } })
  },

  dismissDeleteConfirm() {
    set({ deleteConfirm: null })
  },

  toggleCollapse(nodeId) {
    set((s) => ({
      collapsedNodeIds: s.collapsedNodeIds.includes(nodeId)
        ? s.collapsedNodeIds.filter((id) => id !== nodeId)
        : [...s.collapsedNodeIds, nodeId],
    }))
  },

  expandAll() {
    set({ collapsedNodeIds: [] })
  },

  collapseAll() {
    const state = get()
    if (state.zoomLevel === 'L1') return
    const parentIds = new Set<string>()
    for (const n of state.graphNodes) {
      if (n.parentId) parentIds.add(n.parentId)
    }
    set({ collapsedNodeIds: [...parentIds] })
  },

  showEntityForm(nodeType) {
    set({ entityFormNodeType: nodeType })
  },

  dismissEntityForm() {
    set({ entityFormNodeType: null })
  },

  setPendingFocus(id) {
    set({ pendingFocusNodeId: id })
  },

  clearPendingFocus() {
    set({ pendingFocusNodeId: null })
  },

  enterDiffMode(baseReleaseId, compareReleaseId) {
    set({
      isDiffMode: true,
      baseReleaseId,
      compareReleaseId,
      diffFilter: null,
      showValidationOverlay: false,
    })
  },

  exitDiffMode() {
    set({
      isDiffMode: false,
      baseReleaseId: null,
      compareReleaseId: null,
      diffFilter: null,
      showValidationOverlay: true,
    })
  },

  setDiffFilter(statuses) {
    set({ diffFilter: statuses })
  },

  swapDiffReleases() {
    const state = get()
    set({
      baseReleaseId: state.compareReleaseId,
      compareReleaseId: state.baseReleaseId,
    })
  },

  setBreadcrumb(entries) {
    set({ breadcrumb: entries })
  },

  pushNavigation(entry) {
    set((s) => ({
      navigationStack: [...s.navigationStack.slice(0, 2), entry],
    }))
  },

  popNavigation(): NavigationEntry | null {
    const stack = get().navigationStack
    if (stack.length === 0) return null
    const entry = stack[stack.length - 1]!
    set({ navigationStack: stack.slice(0, -1) })
    return entry
  },

  clearNavigationStack() {
    set({ navigationStack: [] })
  },

  startTransition(direction, targetId) {
    set({ transitionDirection: direction, transitionTargetId: targetId })
  },

  clearTransition() {
    set({ transitionDirection: null, transitionTargetId: null })
  },
}))
