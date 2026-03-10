import { describe, it, expect, beforeEach } from 'vitest'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'

describe('entity form store state', () => {
  beforeEach(() => {
    useVisualWorkspaceStore.setState({
      entityFormNodeType: null,
      pendingFocusNodeId: null,
    })
  })

  it('should start with null entityFormNodeType', () => {
    expect(useVisualWorkspaceStore.getState().entityFormNodeType).toBeNull()
  })

  it('should start with null pendingFocusNodeId', () => {
    expect(useVisualWorkspaceStore.getState().pendingFocusNodeId).toBeNull()
  })

  it('should set entityFormNodeType on showEntityForm', () => {
    useVisualWorkspaceStore.getState().showEntityForm('department')
    expect(useVisualWorkspaceStore.getState().entityFormNodeType).toBe('department')
  })

  it('should clear entityFormNodeType on dismissEntityForm', () => {
    useVisualWorkspaceStore.getState().showEntityForm('role')
    useVisualWorkspaceStore.getState().dismissEntityForm()
    expect(useVisualWorkspaceStore.getState().entityFormNodeType).toBeNull()
  })

  it('should set pendingFocusNodeId on setPendingFocus', () => {
    useVisualWorkspaceStore.getState().setPendingFocus('dept:abc-123')
    expect(useVisualWorkspaceStore.getState().pendingFocusNodeId).toBe('dept:abc-123')
  })

  it('should clear pendingFocusNodeId on clearPendingFocus', () => {
    useVisualWorkspaceStore.getState().setPendingFocus('dept:abc-123')
    useVisualWorkspaceStore.getState().clearPendingFocus()
    expect(useVisualWorkspaceStore.getState().pendingFocusNodeId).toBeNull()
  })

  it('should replace entityFormNodeType when showEntityForm is called again', () => {
    useVisualWorkspaceStore.getState().showEntityForm('department')
    useVisualWorkspaceStore.getState().showEntityForm('role')
    expect(useVisualWorkspaceStore.getState().entityFormNodeType).toBe('role')
  })
})
