import { describe, it, expect, beforeEach } from 'vitest'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'

describe('Visual workspace store - diff mode', () => {
  beforeEach(() => {
    useVisualWorkspaceStore.setState({
      isDiffMode: false,
      diffFilter: null,
      baseReleaseId: null,
      compareReleaseId: null,
      showValidationOverlay: true,
    })
  })

  it('should start with diff mode disabled', () => {
    const state = useVisualWorkspaceStore.getState()
    expect(state.isDiffMode).toBe(false)
    expect(state.diffFilter).toBeNull()
    expect(state.baseReleaseId).toBeNull()
    expect(state.compareReleaseId).toBeNull()
  })

  it('should enter diff mode', () => {
    useVisualWorkspaceStore.getState().enterDiffMode('rel-1', 'rel-2')
    const state = useVisualWorkspaceStore.getState()
    expect(state.isDiffMode).toBe(true)
    expect(state.baseReleaseId).toBe('rel-1')
    expect(state.compareReleaseId).toBe('rel-2')
    expect(state.diffFilter).toBeNull()
    expect(state.showValidationOverlay).toBe(false)
  })

  it('should exit diff mode', () => {
    useVisualWorkspaceStore.getState().enterDiffMode('rel-1', 'rel-2')
    useVisualWorkspaceStore.getState().exitDiffMode()
    const state = useVisualWorkspaceStore.getState()
    expect(state.isDiffMode).toBe(false)
    expect(state.baseReleaseId).toBeNull()
    expect(state.compareReleaseId).toBeNull()
    expect(state.diffFilter).toBeNull()
    expect(state.showValidationOverlay).toBe(true)
  })

  it('should set diff filter', () => {
    useVisualWorkspaceStore.getState().setDiffFilter(['added', 'modified'])
    const state = useVisualWorkspaceStore.getState()
    expect(state.diffFilter).toEqual(['added', 'modified'])
  })

  it('should clear diff filter with null', () => {
    useVisualWorkspaceStore.getState().setDiffFilter(['added'])
    useVisualWorkspaceStore.getState().setDiffFilter(null)
    expect(useVisualWorkspaceStore.getState().diffFilter).toBeNull()
  })

  it('should swap diff releases', () => {
    useVisualWorkspaceStore.getState().enterDiffMode('rel-1', 'rel-2')
    useVisualWorkspaceStore.getState().swapDiffReleases()
    const state = useVisualWorkspaceStore.getState()
    expect(state.baseReleaseId).toBe('rel-2')
    expect(state.compareReleaseId).toBe('rel-1')
  })

  it('should disable validation overlay on enter and re-enable on exit', () => {
    useVisualWorkspaceStore.getState().enterDiffMode('rel-1', 'rel-2')
    expect(useVisualWorkspaceStore.getState().showValidationOverlay).toBe(false)
    useVisualWorkspaceStore.getState().exitDiffMode()
    expect(useVisualWorkspaceStore.getState().showValidationOverlay).toBe(true)
  })
})
