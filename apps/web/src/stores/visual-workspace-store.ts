import { create } from 'zustand'
import type { LayerId, ZoomLevel, VisualNodeDto, VisualEdgeDto, NodeType, NodeStatus, ValidationIssue, BreadcrumbEntry, EdgeType, VisualDiffStatus, ScopeType, ScopeDescriptor, ViewPresetId, OperationsStatusDto, OverlayId } from '@the-crew/shared-types'
import { SCOPE_REGISTRY, VIEW_PRESET_REGISTRY, OVERLAY_DEFINITIONS, overlaysToLayers, DEFAULT_OVERLAYS_PER_LEVEL } from '@the-crew/shared-types'

export type DesignMode = 'design' | 'live'

// Dynamic center view (VSR-002)
export type CenterView =
  | { type: 'canvas' }
  | { type: 'chat'; threadId: string | null; agentId?: string }
  | { type: 'document'; documentId: string }

const DEFAULT_CENTER_VIEW: CenterView = { type: 'canvas' }
const MAX_CENTER_VIEW_HISTORY = 20

/** @deprecated Use ScopeType instead */
export type CanvasView = 'org' | 'department' | 'workflow'

export interface NavigationEntry {
  scope: ScopeDescriptor
  focusNodeId: string | null
  /** @deprecated Use scope.scopeType instead */
  view?: CanvasView
  /** @deprecated Use scope.entityId instead */
  entityId?: string | null
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

export type ContextMenuTarget = 'node' | 'edge' | 'pane' | 'multi-select'

export interface ContextMenuState {
  x: number
  y: number
  type: ContextMenuTarget
  targetId?: string
}

export interface VisualWorkspaceState {
  // Scope model (CAV-011)
  currentScope: ScopeDescriptor

  /** @deprecated Use currentScope.scopeType */
  currentView: CanvasView
  /** @deprecated Use currentScope.zoomLevel */
  zoomLevel: ZoomLevel
  /** @deprecated Use currentScope.entityId */
  scopeEntityId: string | null

  projectId: string | null

  // Canvas interaction
  addEdgeSource: string | null
  preselectedEdgeType: EdgeType | null

  selectedNodeIds: string[]
  selectedEdgeIds: string[]

  graphNodes: VisualNodeDto[]
  graphEdges: VisualEdgeDto[]
  focusNodeId: string | null

  explorerCollapsed: boolean
  inspectorCollapsed: boolean

  // Dynamic center view (VSR-002)
  centerView: CenterView
  centerViewHistory: CenterView[]

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

  // Keyboard shortcuts help (CAV-009)
  showKeyboardHelp: boolean

  // Context menu (CAV-008)
  contextMenu: ContextMenuState | null

  // Chat (CAV-017)
  activeChatThreadId: string | null

  // View presets (CAV-013)
  activePreset: ViewPresetId | null

  // Collaboration (CAV-021)
  commentPanelOpen: boolean
  commentTargetId: string | null

  // Operations overlay (CAV-019)
  showOperationsOverlay: boolean
  operationsStatus: OperationsStatusDto | null

  // v3 overlays as primary state (LCP-012)
  activeOverlays: OverlayId[]

  // Palette toggles (for keyboard shortcuts N/E)
  nodePaletteOpen: boolean
  relationshipPaletteOpen: boolean

  // Design / Live mode (LCP-012)
  designMode: DesignMode

  // Seed auto-open tracking (persists across remounts)
  seedChatAutoOpened: boolean

  // Canvas interaction
  setAddEdgeSource(nodeId: string | null): void
  setPreselectedEdgeType(edgeType: EdgeType | null): void

  setProjectId(projectId: string): void

  // Scope model (CAV-011) — replaces setView
  setScope(scopeType: ScopeType, entityId?: string | null): void

  /** @deprecated Use setScope() instead */
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

  // Dynamic center view actions (VSR-002)
  setCenterView(view: CenterView): void
  openChatView(threadId?: string | null, agentId?: string): void
  openDocumentView(documentId: string): void
  openCanvasView(): void
  goBackCenterView(): void

  toggleLayer(layer: LayerId): void
  setActiveLayers(layers: LayerId[]): void
  // Overlay-aware methods (LCP-010)
  toggleOverlay(overlayId: OverlayId): void
  setActiveOverlays(overlays: OverlayId[]): void
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

  // Keyboard shortcuts help (CAV-009)
  toggleKeyboardHelp(): void
  dismissKeyboardHelp(): void

  // Context menu (CAV-008)
  showContextMenu(x: number, y: number, type: ContextMenuTarget, targetId?: string): void
  dismissContextMenu(): void

  // Chat (CAV-017)
  setActiveChatThread(threadId: string | null): void

  // View presets (CAV-013)
  setActivePreset(presetId: ViewPresetId): void
  clearActivePreset(): void

  // Collaboration (CAV-021)
  openCommentPanel(targetId: string | null): void
  closeCommentPanel(): void

  // Operations overlay (CAV-019)
  toggleOperationsOverlay(): void
  setOperationsStatus(status: OperationsStatusDto | null): void

  // Palette toggles
  toggleNodePalette(): void
  toggleRelationshipPalette(): void

  // Design / Live mode (LCP-012)
  setDesignMode(mode: DesignMode): void

  // Seed auto-open tracking
  markSeedChatAutoOpened(): void

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

function scopeTypeToView(scopeType: ScopeType): CanvasView {
  switch (scopeType) {
    case 'company': return 'org'
    case 'department': return 'department'
    case 'team': return 'department'
    case 'agent-detail': return 'department'
    case 'workflow': return 'workflow'
    case 'workflow-stage': return 'workflow'
  }
}

function viewToScopeType(view: CanvasView): ScopeType {
  switch (view) {
    case 'org': return 'company'
    case 'department': return 'department'
    case 'workflow': return 'workflow'
  }
}

const DEFAULT_SCOPE: ScopeDescriptor = {
  scopeType: 'company',
  entityId: null,
  zoomLevel: 'L1',
}

export const useVisualWorkspaceStore = create<VisualWorkspaceState>((set, get) => ({
  currentScope: DEFAULT_SCOPE,
  currentView: 'org',
  zoomLevel: 'L1',
  scopeEntityId: null,
  projectId: null,

  addEdgeSource: null,
  preselectedEdgeType: null,

  selectedNodeIds: [],
  selectedEdgeIds: [],

  graphNodes: [],
  graphEdges: [],
  focusNodeId: null,

  explorerCollapsed: false,
  inspectorCollapsed: false,
  centerView: DEFAULT_CENTER_VIEW,
  centerViewHistory: [],

  activeLayers: SCOPE_REGISTRY.company.defaultLayers,
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

  showKeyboardHelp: false,

  contextMenu: null,

  activeChatThreadId: null,

  activePreset: null,

  commentPanelOpen: false,
  commentTargetId: null,

  showOperationsOverlay: false,
  operationsStatus: null,

  activeOverlays: DEFAULT_OVERLAYS_PER_LEVEL.L1,
  nodePaletteOpen: false,
  relationshipPaletteOpen: false,
  designMode: 'design',
  seedChatAutoOpened: false,

  setAddEdgeSource(nodeId) {
    set({ addEdgeSource: nodeId })
  },

  setPreselectedEdgeType(edgeType) {
    set({ preselectedEdgeType: edgeType, addEdgeSource: null })
  },

  setProjectId(projectId) {
    set({ projectId, seedChatAutoOpened: false })
  },

  setScope(scopeType, entityId = null) {
    const def = SCOPE_REGISTRY[scopeType]
    const scope: ScopeDescriptor = {
      scopeType,
      entityId,
      zoomLevel: def.zoomLevel,
    }
    set({
      currentScope: scope,
      currentView: scopeTypeToView(scopeType),
      zoomLevel: def.zoomLevel,
      scopeEntityId: entityId,
      selectedNodeIds: [],
      selectedEdgeIds: [],
      graphNodes: [],
      graphEdges: [],
      focusNodeId: null,
      activeLayers: def.defaultLayers,
      activeOverlays: def.defaultOverlays,
      nodeTypeFilter: null,
      statusFilter: null,
      pendingConnection: null,
      edgeTypePicker: null,
      metadataInput: null,
      deleteConfirm: null,
      collapsedNodeIds: [],
      breadcrumb: [],
      addEdgeSource: null,
      preselectedEdgeType: null,
      activePreset: null,
    })
  },

  /** @deprecated Use setScope() */
  setView(view, entityId = null) {
    const scopeType = viewToScopeType(view)
    get().setScope(scopeType, entityId)
  },

  selectNodes(ids) {
    const current = get().selectedNodeIds
    if (ids.length === current.length && ids.every((id, i) => id === current[i])) return
    set({ selectedNodeIds: ids, selectedEdgeIds: [] })
  },

  selectEdges(ids) {
    const current = get().selectedEdgeIds
    if (ids.length === current.length && ids.every((id, i) => id === current[i])) return
    set({ selectedEdgeIds: ids, selectedNodeIds: [] })
  },

  clearSelection() {
    const { selectedNodeIds, selectedEdgeIds } = get()
    if (selectedNodeIds.length === 0 && selectedEdgeIds.length === 0) return
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

  // Dynamic center view actions (VSR-002)
  setCenterView(view) {
    const current = get().centerView
    // Don't push to history if same type
    const history = current.type === view.type
      ? get().centerViewHistory
      : [...get().centerViewHistory, current].slice(-MAX_CENTER_VIEW_HISTORY)
    set({
      centerView: view,
      centerViewHistory: history,
    })
  },

  openChatView(threadId = null, agentId?) {
    get().setCenterView({ type: 'chat', threadId, agentId })
  },

  openDocumentView(documentId) {
    get().setCenterView({ type: 'document', documentId })
  },

  openCanvasView() {
    get().setCenterView({ type: 'canvas' })
  },

  goBackCenterView() {
    const history = get().centerViewHistory
    if (history.length === 0) return
    const prev = history[history.length - 1]!
    set({
      centerView: prev,
      centerViewHistory: history.slice(0, -1),
    })
  },

  toggleLayer(layer) {
    set((s) => {
      const has = s.activeLayers.includes(layer)
      return {
        activeLayers: has
          ? s.activeLayers.filter((l) => l !== layer)
          : [...s.activeLayers, layer],
        activePreset: null,
      }
    })
  },

  setActiveLayers(layers) {
    set({ activeLayers: layers, activePreset: null })
  },

  toggleOverlay(overlayId) {
    const overlay = OVERLAY_DEFINITIONS.find(d => d.id === overlayId)
    if (!overlay || overlay.locked) return
    set((s) => {
      const isActive = s.activeOverlays.includes(overlayId)
      const nextOverlays = isActive
        ? s.activeOverlays.filter(o => o !== overlayId)
        : [...s.activeOverlays, overlayId]
      // Keep activeLayers in sync (bridge)
      const bridgeLayers = overlaysToLayers(nextOverlays)
      return { activeOverlays: nextOverlays, activeLayers: bridgeLayers, activePreset: null }
    })
  },

  setActiveOverlays(overlays) {
    const allOverlays: OverlayId[] = overlays.includes('organization') ? overlays : ['organization' as OverlayId, ...overlays]
    set({ activeOverlays: allOverlays, activeLayers: overlaysToLayers(allOverlays), activePreset: null })
  },

  resetToDefaults(_level) {
    const state = get()
    const def = SCOPE_REGISTRY[state.currentScope.scopeType]
    set({ activeLayers: def.defaultLayers, activeOverlays: def.defaultOverlays })
  },

  setNodeTypeFilter(types) {
    set({ nodeTypeFilter: types, activePreset: null })
  },

  setStatusFilter(statuses) {
    set({ statusFilter: statuses, activePreset: null })
  },

  clearFilters() {
    set({ nodeTypeFilter: null, statusFilter: null, activePreset: null })
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
    if (state.currentScope.zoomLevel === 'L1') return
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

  toggleKeyboardHelp() {
    set((s) => ({ showKeyboardHelp: !s.showKeyboardHelp }))
  },

  dismissKeyboardHelp() {
    set({ showKeyboardHelp: false })
  },

  showContextMenu(x, y, type, targetId) {
    set({ contextMenu: { x, y, type, targetId } })
  },

  dismissContextMenu() {
    set({ contextMenu: null })
  },

  setActiveChatThread(threadId) {
    set({ activeChatThreadId: threadId })
  },

  setActivePreset(presetId) {
    const state = get()
    const preset = VIEW_PRESET_REGISTRY[presetId]
    if (!preset) return
    if (!preset.availableAtScopes.includes(state.currentScope.scopeType)) return
    const overlays = preset.overlays ?? state.activeOverlays
    set({
      activePreset: presetId,
      activeLayers: preset.layers,
      activeOverlays: overlays,
      nodeTypeFilter: preset.emphasisNodeTypes,
    })
  },

  clearActivePreset() {
    const state = get()
    const def = SCOPE_REGISTRY[state.currentScope.scopeType]
    set({
      activePreset: null,
      activeLayers: def.defaultLayers,
      activeOverlays: def.defaultOverlays,
      nodeTypeFilter: null,
    })
  },

  openCommentPanel(targetId) {
    set({ commentPanelOpen: true, commentTargetId: targetId })
  },

  closeCommentPanel() {
    set({ commentPanelOpen: false, commentTargetId: null })
  },

  toggleOperationsOverlay() {
    set((s) => ({ showOperationsOverlay: !s.showOperationsOverlay }))
  },

  setOperationsStatus(status) {
    set({ operationsStatus: status })
  },

  toggleNodePalette() {
    set((s) => ({ nodePaletteOpen: !s.nodePaletteOpen, relationshipPaletteOpen: false }))
  },

  toggleRelationshipPalette() {
    set((s) => ({ relationshipPaletteOpen: !s.relationshipPaletteOpen, nodePaletteOpen: false }))
  },

  setDesignMode(mode) {
    set((s) => {
      const nextOverlays = mode === 'live'
        ? [...new Set([...s.activeOverlays, 'live-status' as OverlayId])]
        : s.activeOverlays.filter(o => o !== 'live-status')
      return {
        designMode: mode,
        activeOverlays: nextOverlays,
        activeLayers: overlaysToLayers(nextOverlays),
      }
    })
  },

  markSeedChatAutoOpened() {
    set({ seedChatAutoOpened: true })
  },

  enterDiffMode(baseReleaseId, compareReleaseId) {
    set({
      isDiffMode: true,
      baseReleaseId,
      compareReleaseId,
      diffFilter: null,
      showValidationOverlay: false,
      showOperationsOverlay: false,
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
      navigationStack: [...s.navigationStack, entry],
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
