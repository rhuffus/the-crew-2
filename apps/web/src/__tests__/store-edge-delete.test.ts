import { describe, it, expect, beforeEach } from 'vitest'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'
import { mockOwnsEdge, mockReportsToEdge, allMockNodes } from './fixtures/visual-graph'

describe('Visual Workspace Store — Edge Delete (VIS-008d)', () => {
  beforeEach(() => {
    useVisualWorkspaceStore.setState({
      deleteConfirm: null,
      graphEdges: [],
      graphNodes: [],
    })
  })

  it('should have null deleteConfirm initially', () => {
    expect(useVisualWorkspaceStore.getState().deleteConfirm).toBeNull()
  })

  it('should set deleteConfirm via showDeleteConfirm', () => {
    useVisualWorkspaceStore.getState().showDeleteConfirm('owns', 'dept:abc', 'cap:c1')
    const state = useVisualWorkspaceStore.getState()
    expect(state.deleteConfirm).toEqual({
      edgeType: 'owns',
      sourceNodeId: 'dept:abc',
      targetNodeId: 'cap:c1',
    })
  })

  it('should clear deleteConfirm via dismissDeleteConfirm', () => {
    useVisualWorkspaceStore.getState().showDeleteConfirm('owns', 'dept:abc', 'cap:c1')
    useVisualWorkspaceStore.getState().dismissDeleteConfirm()
    expect(useVisualWorkspaceStore.getState().deleteConfirm).toBeNull()
  })

  it('should have empty graphEdges initially', () => {
    expect(useVisualWorkspaceStore.getState().graphEdges).toEqual([])
  })

  it('should set graphEdges via setGraphEdges', () => {
    const edges = [mockOwnsEdge, mockReportsToEdge]
    useVisualWorkspaceStore.getState().setGraphEdges(edges)
    expect(useVisualWorkspaceStore.getState().graphEdges).toEqual(edges)
  })

  it('should clear graphEdges and deleteConfirm on setView', () => {
    useVisualWorkspaceStore.getState().setGraphEdges([mockOwnsEdge])
    useVisualWorkspaceStore.getState().showDeleteConfirm('owns', 'dept:abc', 'cap:c1')

    useVisualWorkspaceStore.getState().setView('department', 'dept-1')
    const state = useVisualWorkspaceStore.getState()
    expect(state.graphEdges).toEqual([])
    expect(state.deleteConfirm).toBeNull()
  })

  it('should set graphNodes via setGraphNodes', () => {
    useVisualWorkspaceStore.getState().setGraphNodes(allMockNodes)
    expect(useVisualWorkspaceStore.getState().graphNodes).toEqual(allMockNodes)
  })
})
