import { describe, it, expect, beforeEach } from 'vitest'
import type { VisualNodeDto, BreadcrumbEntry } from '@the-crew/shared-types'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'
import type { NavigationEntry, CenterView } from '@/stores/visual-workspace-store'

function makeNode(id: string, nodeType: VisualNodeDto['nodeType'] = 'department', label = id): VisualNodeDto {
  return {
    id,
    nodeType,
    entityId: id,
    label,
    sublabel: null,
    position: null,
    collapsed: false,
    status: 'normal',
    layerIds: ['organization'],
    parentId: null,
  }
}

describe('visual workspace store', () => {
  beforeEach(() => {
    useVisualWorkspaceStore.setState({
      currentView: 'org',
      zoomLevel: 'L1',
      scopeEntityId: null,
      projectId: null,
      selectedNodeIds: [],
      selectedEdgeIds: [],
      graphNodes: [],
      focusNodeId: null,
      explorerCollapsed: false,
      inspectorCollapsed: false,
      centerView: { type: 'canvas' },
      centerViewHistory: [],
      activeLayers: ['organization'],
      nodeTypeFilter: null,
      statusFilter: null,
      validationIssues: [],
      showValidationOverlay: true,
      pendingConnection: null,
      edgeTypePicker: null,
      metadataInput: null,
      breadcrumb: [],
      navigationStack: [],
      transitionDirection: null,
      transitionTargetId: null,
      collapsedNodeIds: [],
    })
  })

  it('should have default state', () => {
    const state = useVisualWorkspaceStore.getState()
    expect(state.currentView).toBe('org')
    expect(state.zoomLevel).toBe('L1')
    expect(state.scopeEntityId).toBeNull()
    expect(state.selectedNodeIds).toEqual([])
    expect(state.selectedEdgeIds).toEqual([])
    expect(state.graphNodes).toEqual([])
    expect(state.focusNodeId).toBeNull()
    expect(state.explorerCollapsed).toBe(false)
    expect(state.inspectorCollapsed).toBe(false)
    expect(state.activeLayers).toEqual(['organization'])
  })

  it('should set view to department with correct zoom level', () => {
    useVisualWorkspaceStore.getState().setView('department', 'dept-123')
    const state = useVisualWorkspaceStore.getState()
    expect(state.currentView).toBe('department')
    expect(state.zoomLevel).toBe('L2')
    expect(state.scopeEntityId).toBe('dept-123')
    expect(state.activeLayers).toEqual(['organization', 'capabilities'])
  })

  it('should set view to workflow with correct zoom level', () => {
    useVisualWorkspaceStore.getState().setView('workflow', 'wf-456')
    const state = useVisualWorkspaceStore.getState()
    expect(state.currentView).toBe('workflow')
    expect(state.zoomLevel).toBe('L3')
    expect(state.scopeEntityId).toBe('wf-456')
    expect(state.activeLayers).toEqual(['workflows'])
  })

  it('should clear selection when changing view', () => {
    useVisualWorkspaceStore.getState().selectNodes(['node-1', 'node-2'])
    expect(useVisualWorkspaceStore.getState().selectedNodeIds).toEqual(['node-1', 'node-2'])

    useVisualWorkspaceStore.getState().setView('department', 'dept-1')
    expect(useVisualWorkspaceStore.getState().selectedNodeIds).toEqual([])
  })

  it('should select nodes and clear edges', () => {
    useVisualWorkspaceStore.getState().selectEdges(['edge-1'])
    useVisualWorkspaceStore.getState().selectNodes(['node-1'])
    const state = useVisualWorkspaceStore.getState()
    expect(state.selectedNodeIds).toEqual(['node-1'])
    expect(state.selectedEdgeIds).toEqual([])
  })

  it('should select edges and clear nodes', () => {
    useVisualWorkspaceStore.getState().selectNodes(['node-1'])
    useVisualWorkspaceStore.getState().selectEdges(['edge-1'])
    const state = useVisualWorkspaceStore.getState()
    expect(state.selectedEdgeIds).toEqual(['edge-1'])
    expect(state.selectedNodeIds).toEqual([])
  })

  it('should clear selection', () => {
    useVisualWorkspaceStore.getState().selectNodes(['n1'])
    useVisualWorkspaceStore.getState().clearSelection()
    const state = useVisualWorkspaceStore.getState()
    expect(state.selectedNodeIds).toEqual([])
    expect(state.selectedEdgeIds).toEqual([])
  })

  it('should toggle explorer', () => {
    expect(useVisualWorkspaceStore.getState().explorerCollapsed).toBe(false)
    useVisualWorkspaceStore.getState().toggleExplorer()
    expect(useVisualWorkspaceStore.getState().explorerCollapsed).toBe(true)
    useVisualWorkspaceStore.getState().toggleExplorer()
    expect(useVisualWorkspaceStore.getState().explorerCollapsed).toBe(false)
  })

  it('should toggle inspector', () => {
    expect(useVisualWorkspaceStore.getState().inspectorCollapsed).toBe(false)
    useVisualWorkspaceStore.getState().toggleInspector()
    expect(useVisualWorkspaceStore.getState().inspectorCollapsed).toBe(true)
  })

  it('should toggle layer on', () => {
    useVisualWorkspaceStore.getState().toggleLayer('capabilities')
    expect(useVisualWorkspaceStore.getState().activeLayers).toContain('capabilities')
  })

  it('should toggle layer off', () => {
    useVisualWorkspaceStore.getState().toggleLayer('organization')
    expect(useVisualWorkspaceStore.getState().activeLayers).not.toContain('organization')
  })

  it('should set active layers', () => {
    useVisualWorkspaceStore.getState().setActiveLayers(['workflows', 'contracts'])
    expect(useVisualWorkspaceStore.getState().activeLayers).toEqual(['workflows', 'contracts'])
  })

  it('should reset to defaults for a given level', () => {
    useVisualWorkspaceStore.getState().setActiveLayers(['contracts'])
    useVisualWorkspaceStore.getState().resetToDefaults('L2')
    expect(useVisualWorkspaceStore.getState().activeLayers).toEqual(['organization', 'capabilities'])
  })

  it('should set graph nodes', () => {
    const nodes = [makeNode('n1'), makeNode('n2')]
    useVisualWorkspaceStore.getState().setGraphNodes(nodes)
    expect(useVisualWorkspaceStore.getState().graphNodes).toEqual(nodes)
  })

  it('should clear graph nodes when changing view', () => {
    useVisualWorkspaceStore.getState().setGraphNodes([makeNode('n1')])
    useVisualWorkspaceStore.getState().setView('department', 'dept-1')
    expect(useVisualWorkspaceStore.getState().graphNodes).toEqual([])
  })

  it('should set focusNodeId', () => {
    useVisualWorkspaceStore.getState().focusNode('node-42')
    expect(useVisualWorkspaceStore.getState().focusNodeId).toBe('node-42')
  })

  it('should clear focusNodeId', () => {
    useVisualWorkspaceStore.getState().focusNode('node-42')
    useVisualWorkspaceStore.getState().clearFocus()
    expect(useVisualWorkspaceStore.getState().focusNodeId).toBeNull()
  })

  it('should clear focusNodeId when changing view', () => {
    useVisualWorkspaceStore.getState().focusNode('node-42')
    useVisualWorkspaceStore.getState().setView('workflow', 'wf-1')
    expect(useVisualWorkspaceStore.getState().focusNodeId).toBeNull()
  })

  it('should set node type filter', () => {
    useVisualWorkspaceStore.getState().setNodeTypeFilter(['department', 'role'])
    expect(useVisualWorkspaceStore.getState().nodeTypeFilter).toEqual(['department', 'role'])
  })

  it('should set status filter', () => {
    useVisualWorkspaceStore.getState().setStatusFilter(['error', 'warning'])
    expect(useVisualWorkspaceStore.getState().statusFilter).toEqual(['error', 'warning'])
  })

  it('should clear all filters', () => {
    useVisualWorkspaceStore.getState().setNodeTypeFilter(['department'])
    useVisualWorkspaceStore.getState().setStatusFilter(['error'])
    useVisualWorkspaceStore.getState().clearFilters()
    expect(useVisualWorkspaceStore.getState().nodeTypeFilter).toBeNull()
    expect(useVisualWorkspaceStore.getState().statusFilter).toBeNull()
  })

  it('should clear filters when changing view', () => {
    useVisualWorkspaceStore.getState().setNodeTypeFilter(['department'])
    useVisualWorkspaceStore.getState().setStatusFilter(['error'])
    useVisualWorkspaceStore.getState().setView('department', 'dept-1')
    expect(useVisualWorkspaceStore.getState().nodeTypeFilter).toBeNull()
    expect(useVisualWorkspaceStore.getState().statusFilter).toBeNull()
  })

  it('should set projectId', () => {
    useVisualWorkspaceStore.getState().setProjectId('proj-123')
    expect(useVisualWorkspaceStore.getState().projectId).toBe('proj-123')
  })

  it('should set validation issues', () => {
    const issues = [
      { entity: 'department', entityId: 'd1', field: null, severity: 'error' as const, message: 'Missing mandate' },
    ]
    useVisualWorkspaceStore.getState().setValidationIssues(issues)
    expect(useVisualWorkspaceStore.getState().validationIssues).toEqual(issues)
  })

  it('should toggle validation overlay', () => {
    expect(useVisualWorkspaceStore.getState().showValidationOverlay).toBe(true)
    useVisualWorkspaceStore.getState().toggleValidationOverlay()
    expect(useVisualWorkspaceStore.getState().showValidationOverlay).toBe(false)
    useVisualWorkspaceStore.getState().toggleValidationOverlay()
    expect(useVisualWorkspaceStore.getState().showValidationOverlay).toBe(true)
  })

  // VIS-011a: Breadcrumb
  it('should have empty breadcrumb by default', () => {
    expect(useVisualWorkspaceStore.getState().breadcrumb).toEqual([])
  })

  it('should set breadcrumb', () => {
    const entries: BreadcrumbEntry[] = [
      { label: 'Organization', nodeType: 'company', entityId: 'comp-1', zoomLevel: 'L1' },
      { label: 'Engineering', nodeType: 'department', entityId: 'dept-1', zoomLevel: 'L2' },
    ]
    useVisualWorkspaceStore.getState().setBreadcrumb(entries)
    expect(useVisualWorkspaceStore.getState().breadcrumb).toEqual(entries)
  })

  it('should clear breadcrumb when changing view', () => {
    useVisualWorkspaceStore.getState().setBreadcrumb([
      { label: 'Org', nodeType: 'company', entityId: 'c1', zoomLevel: 'L1' },
    ])
    useVisualWorkspaceStore.getState().setView('department', 'dept-1')
    expect(useVisualWorkspaceStore.getState().breadcrumb).toEqual([])
  })

  // VIS-011a: Navigation stack
  it('should have empty navigation stack by default', () => {
    expect(useVisualWorkspaceStore.getState().navigationStack).toEqual([])
  })

  it('should push navigation entry', () => {
    const entry: NavigationEntry = { scope: { scopeType: 'company', entityId: null, zoomLevel: 'L1' }, focusNodeId: 'dept-1' }
    useVisualWorkspaceStore.getState().pushNavigation(entry)
    expect(useVisualWorkspaceStore.getState().navigationStack).toEqual([entry])
  })

  it('should push multiple navigation entries', () => {
    const entry1: NavigationEntry = { scope: { scopeType: 'company', entityId: null, zoomLevel: 'L1' }, focusNodeId: 'dept-1' }
    const entry2: NavigationEntry = { scope: { scopeType: 'department', entityId: 'dept-1', zoomLevel: 'L2' }, focusNodeId: 'wf-1' }
    useVisualWorkspaceStore.getState().pushNavigation(entry1)
    useVisualWorkspaceStore.getState().pushNavigation(entry2)
    expect(useVisualWorkspaceStore.getState().navigationStack).toEqual([entry1, entry2])
  })

  it('should allow deep navigation stack without artificial limit', () => {
    const entry1: NavigationEntry = { scope: { scopeType: 'company', entityId: null, zoomLevel: 'L1' }, focusNodeId: 'dept-1' }
    const entry2: NavigationEntry = { scope: { scopeType: 'department', entityId: 'dept-1', zoomLevel: 'L2' }, focusNodeId: 'wf-1' }
    const entry3: NavigationEntry = { scope: { scopeType: 'workflow', entityId: 'wf-1', zoomLevel: 'L3' }, focusNodeId: null }
    const entry4: NavigationEntry = { scope: { scopeType: 'company', entityId: null, zoomLevel: 'L1' }, focusNodeId: 'dept-2' }
    useVisualWorkspaceStore.getState().pushNavigation(entry1)
    useVisualWorkspaceStore.getState().pushNavigation(entry2)
    useVisualWorkspaceStore.getState().pushNavigation(entry3)
    useVisualWorkspaceStore.getState().pushNavigation(entry4)
    const stack = useVisualWorkspaceStore.getState().navigationStack
    expect(stack).toHaveLength(4)
    expect(stack).toEqual([entry1, entry2, entry3, entry4])
  })

  it('should pop navigation entry', () => {
    const entry1: NavigationEntry = { scope: { scopeType: 'company', entityId: null, zoomLevel: 'L1' }, focusNodeId: 'dept-1' }
    const entry2: NavigationEntry = { scope: { scopeType: 'department', entityId: 'dept-1', zoomLevel: 'L2' }, focusNodeId: 'wf-1' }
    useVisualWorkspaceStore.getState().pushNavigation(entry1)
    useVisualWorkspaceStore.getState().pushNavigation(entry2)
    const popped = useVisualWorkspaceStore.getState().popNavigation()
    expect(popped).toEqual(entry2)
    expect(useVisualWorkspaceStore.getState().navigationStack).toEqual([entry1])
  })

  it('should return null when popping empty stack', () => {
    const popped = useVisualWorkspaceStore.getState().popNavigation()
    expect(popped).toBeNull()
    expect(useVisualWorkspaceStore.getState().navigationStack).toEqual([])
  })

  it('should clear navigation stack', () => {
    useVisualWorkspaceStore.getState().pushNavigation({ scope: { scopeType: 'company', entityId: null, zoomLevel: 'L1' }, focusNodeId: 'x' })
    useVisualWorkspaceStore.getState().clearNavigationStack()
    expect(useVisualWorkspaceStore.getState().navigationStack).toEqual([])
  })

  // VIS-011a: Transition state
  it('should have null transition by default', () => {
    expect(useVisualWorkspaceStore.getState().transitionDirection).toBeNull()
    expect(useVisualWorkspaceStore.getState().transitionTargetId).toBeNull()
  })

  it('should start drill-in transition', () => {
    useVisualWorkspaceStore.getState().startTransition('drill-in', 'dept-1')
    expect(useVisualWorkspaceStore.getState().transitionDirection).toBe('drill-in')
    expect(useVisualWorkspaceStore.getState().transitionTargetId).toBe('dept-1')
  })

  it('should start drill-out transition', () => {
    useVisualWorkspaceStore.getState().startTransition('drill-out', 'dept-1')
    expect(useVisualWorkspaceStore.getState().transitionDirection).toBe('drill-out')
    expect(useVisualWorkspaceStore.getState().transitionTargetId).toBe('dept-1')
  })

  it('should clear transition', () => {
    useVisualWorkspaceStore.getState().startTransition('drill-in', 'dept-1')
    useVisualWorkspaceStore.getState().clearTransition()
    expect(useVisualWorkspaceStore.getState().transitionDirection).toBeNull()
    expect(useVisualWorkspaceStore.getState().transitionTargetId).toBeNull()
  })

  // VIS-008b: Connection editing state
  it('should have null connection state by default', () => {
    const state = useVisualWorkspaceStore.getState()
    expect(state.pendingConnection).toBeNull()
    expect(state.edgeTypePicker).toBeNull()
    expect(state.metadataInput).toBeNull()
  })

  it('should start connection with valid target types', () => {
    useVisualWorkspaceStore.getState().startConnection('dept-1', 'department', ['department', 'capability', 'workflow'])
    const state = useVisualWorkspaceStore.getState()
    expect(state.pendingConnection).toEqual({
      sourceNodeId: 'dept-1',
      sourceNodeType: 'department',
      validTargetTypes: ['department', 'capability', 'workflow'],
    })
  })

  it('should cancel connection and clear all connection state', () => {
    useVisualWorkspaceStore.getState().startConnection('dept-1', 'department', ['department'])
    useVisualWorkspaceStore.getState().showEdgeTypePicker(['owns', 'participates_in'], 'dept-1', 'wf-1')
    useVisualWorkspaceStore.getState().cancelConnection()
    const state = useVisualWorkspaceStore.getState()
    expect(state.pendingConnection).toBeNull()
    expect(state.edgeTypePicker).toBeNull()
    expect(state.metadataInput).toBeNull()
  })

  it('should show edge type picker', () => {
    useVisualWorkspaceStore.getState().showEdgeTypePicker(['owns', 'participates_in'], 'dept-1', 'wf-1')
    const state = useVisualWorkspaceStore.getState()
    expect(state.edgeTypePicker).toEqual({
      options: ['owns', 'participates_in'],
      sourceNodeId: 'dept-1',
      targetNodeId: 'wf-1',
    })
  })

  it('should dismiss edge type picker', () => {
    useVisualWorkspaceStore.getState().showEdgeTypePicker(['owns'], 'a', 'b')
    useVisualWorkspaceStore.getState().dismissEdgeTypePicker()
    expect(useVisualWorkspaceStore.getState().edgeTypePicker).toBeNull()
  })

  it('should show metadata input', () => {
    useVisualWorkspaceStore.getState().showMetadataInput('participates_in', 'role-1', 'wf-1')
    const state = useVisualWorkspaceStore.getState()
    expect(state.metadataInput).toEqual({
      edgeType: 'participates_in',
      sourceNodeId: 'role-1',
      targetNodeId: 'wf-1',
    })
  })

  it('should dismiss metadata input', () => {
    useVisualWorkspaceStore.getState().showMetadataInput('participates_in', 'r', 'w')
    useVisualWorkspaceStore.getState().dismissMetadataInput()
    expect(useVisualWorkspaceStore.getState().metadataInput).toBeNull()
  })

  it('should clear connection state when changing view', () => {
    useVisualWorkspaceStore.getState().startConnection('dept-1', 'department', ['department'])
    useVisualWorkspaceStore.getState().showEdgeTypePicker(['owns'], 'dept-1', 'cap-1')
    useVisualWorkspaceStore.getState().showMetadataInput('participates_in', 'r-1', 'wf-1')
    useVisualWorkspaceStore.getState().setView('workflow', 'wf-1')
    const state = useVisualWorkspaceStore.getState()
    expect(state.pendingConnection).toBeNull()
    expect(state.edgeTypePicker).toBeNull()
    expect(state.metadataInput).toBeNull()
  })

  // VIS-011d: Collapse/expand
  it('should have empty collapsedNodeIds by default', () => {
    expect(useVisualWorkspaceStore.getState().collapsedNodeIds).toEqual([])
  })

  it('should toggle collapse — add node to collapsedNodeIds', () => {
    useVisualWorkspaceStore.getState().toggleCollapse('dept:d1')
    expect(useVisualWorkspaceStore.getState().collapsedNodeIds).toEqual(['dept:d1'])
  })

  it('should toggle collapse — remove node from collapsedNodeIds', () => {
    useVisualWorkspaceStore.getState().toggleCollapse('dept:d1')
    useVisualWorkspaceStore.getState().toggleCollapse('dept:d1')
    expect(useVisualWorkspaceStore.getState().collapsedNodeIds).toEqual([])
  })

  it('should expand all — clear collapsedNodeIds', () => {
    useVisualWorkspaceStore.getState().toggleCollapse('dept:d1')
    useVisualWorkspaceStore.getState().toggleCollapse('dept:d2')
    useVisualWorkspaceStore.getState().expandAll()
    expect(useVisualWorkspaceStore.getState().collapsedNodeIds).toEqual([])
  })

  it('should collapse all — set all containers from graphNodes', () => {
    useVisualWorkspaceStore.getState().setView('department', 'dept-1')
    useVisualWorkspaceStore.getState().setGraphNodes([
      makeNode('dept:d1', 'department'),
      makeNode('role:r1', 'role'),
      makeNode('role:r2', 'role'),
    ])
    // Manually set parentId since makeNode defaults to null
    useVisualWorkspaceStore.setState({
      graphNodes: [
        { ...makeNode('dept:d1', 'department'), parentId: null },
        { ...makeNode('role:r1', 'role'), parentId: 'dept:d1' },
        { ...makeNode('role:r2', 'role'), parentId: 'dept:d1' },
      ],
    })
    useVisualWorkspaceStore.getState().collapseAll()
    expect(useVisualWorkspaceStore.getState().collapsedNodeIds).toEqual(['dept:d1'])
  })

  it('should not collapse all at L1', () => {
    useVisualWorkspaceStore.getState().setView('org')
    useVisualWorkspaceStore.setState({
      graphNodes: [
        { ...makeNode('company:c1', 'company'), parentId: null },
        { ...makeNode('dept:d1', 'department'), parentId: 'company:c1' },
      ],
    })
    useVisualWorkspaceStore.getState().collapseAll()
    expect(useVisualWorkspaceStore.getState().collapsedNodeIds).toEqual([])
  })

  it('should clear collapsedNodeIds when changing view', () => {
    useVisualWorkspaceStore.getState().toggleCollapse('dept:d1')
    useVisualWorkspaceStore.getState().setView('workflow', 'wf-1')
    expect(useVisualWorkspaceStore.getState().collapsedNodeIds).toEqual([])
  })

  // VSR-002: CenterView
  describe('center view (VSR-002)', () => {
    it('should have canvas as default center view', () => {
      const state = useVisualWorkspaceStore.getState()
      expect(state.centerView).toEqual({ type: 'canvas' })
      expect(state.centerViewHistory).toEqual([])
    })

    it('should open chat view', () => {
      useVisualWorkspaceStore.getState().openChatView(null, 'ceo')
      const state = useVisualWorkspaceStore.getState()
      expect(state.centerView).toEqual({ type: 'chat', threadId: null, chatMode: 'ceo' })
    })

    it('should open chat view with defaults', () => {
      useVisualWorkspaceStore.getState().openChatView()
      const state = useVisualWorkspaceStore.getState()
      expect(state.centerView).toEqual({ type: 'chat', threadId: null, chatMode: 'ceo' })
    })

    it('should open chat view with thread id and generic mode', () => {
      useVisualWorkspaceStore.getState().openChatView('thread-1', 'generic')
      const state = useVisualWorkspaceStore.getState()
      expect(state.centerView).toEqual({ type: 'chat', threadId: 'thread-1', chatMode: 'generic' })
    })

    it('should open document view', () => {
      useVisualWorkspaceStore.getState().openDocumentView('doc-123')
      const state = useVisualWorkspaceStore.getState()
      expect(state.centerView).toEqual({ type: 'document', documentId: 'doc-123' })
    })

    it('should open canvas view', () => {
      useVisualWorkspaceStore.getState().openChatView(null, 'ceo')
      useVisualWorkspaceStore.getState().openCanvasView()
      const state = useVisualWorkspaceStore.getState()
      expect(state.centerView).toEqual({ type: 'canvas' })
    })

    it('should set arbitrary center view', () => {
      const view: CenterView = { type: 'document', documentId: 'doc-456' }
      useVisualWorkspaceStore.getState().setCenterView(view)
      expect(useVisualWorkspaceStore.getState().centerView).toEqual(view)
    })

    // History
    it('should push to history when changing view type', () => {
      useVisualWorkspaceStore.getState().openChatView(null, 'ceo')
      const state = useVisualWorkspaceStore.getState()
      expect(state.centerViewHistory).toEqual([{ type: 'canvas' }])
    })

    it('should not push to history when staying on same view type', () => {
      useVisualWorkspaceStore.getState().openChatView(null, 'ceo')
      useVisualWorkspaceStore.getState().openChatView('thread-2', 'generic')
      const state = useVisualWorkspaceStore.getState()
      // Only one history entry (canvas), not two
      expect(state.centerViewHistory).toEqual([{ type: 'canvas' }])
    })

    it('should build history across different view types', () => {
      useVisualWorkspaceStore.getState().openChatView(null, 'ceo')
      useVisualWorkspaceStore.getState().openDocumentView('doc-1')
      useVisualWorkspaceStore.getState().openCanvasView()
      const state = useVisualWorkspaceStore.getState()
      expect(state.centerViewHistory).toEqual([
        { type: 'canvas' },
        { type: 'chat', threadId: null, chatMode: 'ceo' },
        { type: 'document', documentId: 'doc-1' },
      ])
    })

    it('should limit history to 20 entries', () => {
      for (let i = 0; i < 25; i++) {
        if (i % 2 === 0) {
          useVisualWorkspaceStore.getState().openChatView(null, 'ceo')
        } else {
          useVisualWorkspaceStore.getState().openCanvasView()
        }
      }
      expect(useVisualWorkspaceStore.getState().centerViewHistory.length).toBeLessThanOrEqual(20)
    })

    // goBackCenterView
    it('should go back to previous view', () => {
      useVisualWorkspaceStore.getState().openChatView(null, 'ceo')
      useVisualWorkspaceStore.getState().openDocumentView('doc-1')
      useVisualWorkspaceStore.getState().goBackCenterView()
      const state = useVisualWorkspaceStore.getState()
      expect(state.centerView).toEqual({ type: 'chat', threadId: null, chatMode: 'ceo' })
      expect(state.centerViewHistory).toEqual([{ type: 'canvas' }])
    })

    it('should do nothing when going back with empty history', () => {
      useVisualWorkspaceStore.getState().goBackCenterView()
      expect(useVisualWorkspaceStore.getState().centerView).toEqual({ type: 'canvas' })
    })

    it('should go back to canvas from chat', () => {
      useVisualWorkspaceStore.getState().openChatView(null, 'ceo')
      useVisualWorkspaceStore.getState().goBackCenterView()
      const state = useVisualWorkspaceStore.getState()
      expect(state.centerView).toEqual({ type: 'canvas' })
      expect(state.centerViewHistory).toEqual([])
    })
  })
})
