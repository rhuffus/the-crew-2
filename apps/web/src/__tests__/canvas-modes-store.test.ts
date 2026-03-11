import { describe, it, expect, beforeEach } from 'vitest'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'

describe('canvas modes — store', () => {
  beforeEach(() => {
    useVisualWorkspaceStore.setState({
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
      deleteConfirm: null,
      isDiffMode: false,
      diffFilter: null,
      baseReleaseId: null,
      compareReleaseId: null,
      entityFormNodeType: null,
      pendingFocusNodeId: null,
      canvasMode: 'select',
      addEdgeSource: null,
    })
  })

  it('should default canvasMode to select', () => {
    expect(useVisualWorkspaceStore.getState().canvasMode).toBe('select')
  })

  it('should default addEdgeSource to null', () => {
    expect(useVisualWorkspaceStore.getState().addEdgeSource).toBeNull()
  })

  it('should set canvasMode via setCanvasMode', () => {
    useVisualWorkspaceStore.getState().setCanvasMode('pan')
    expect(useVisualWorkspaceStore.getState().canvasMode).toBe('pan')
  })

  it('should accept all five canvas modes', () => {
    const modes = ['select', 'pan', 'connect', 'add-node', 'add-edge'] as const
    for (const mode of modes) {
      useVisualWorkspaceStore.getState().setCanvasMode(mode)
      expect(useVisualWorkspaceStore.getState().canvasMode).toBe(mode)
    }
  })

  it('should reset addEdgeSource when changing mode', () => {
    useVisualWorkspaceStore.getState().setCanvasMode('add-edge')
    useVisualWorkspaceStore.getState().setAddEdgeSource('node-1')
    expect(useVisualWorkspaceStore.getState().addEdgeSource).toBe('node-1')

    useVisualWorkspaceStore.getState().setCanvasMode('select')
    expect(useVisualWorkspaceStore.getState().addEdgeSource).toBeNull()
  })

  it('should set addEdgeSource via setAddEdgeSource', () => {
    useVisualWorkspaceStore.getState().setAddEdgeSource('node-42')
    expect(useVisualWorkspaceStore.getState().addEdgeSource).toBe('node-42')
  })

  it('should clear addEdgeSource by setting null', () => {
    useVisualWorkspaceStore.getState().setAddEdgeSource('node-1')
    useVisualWorkspaceStore.getState().setAddEdgeSource(null)
    expect(useVisualWorkspaceStore.getState().addEdgeSource).toBeNull()
  })

  it('should reset canvasMode to select on setView', () => {
    useVisualWorkspaceStore.getState().setCanvasMode('connect')
    useVisualWorkspaceStore.getState().setView('department', 'dept-1')
    expect(useVisualWorkspaceStore.getState().canvasMode).toBe('select')
  })

  it('should reset addEdgeSource on setView', () => {
    useVisualWorkspaceStore.getState().setAddEdgeSource('node-1')
    useVisualWorkspaceStore.getState().setView('workflow', 'wf-1')
    expect(useVisualWorkspaceStore.getState().addEdgeSource).toBeNull()
  })
})
