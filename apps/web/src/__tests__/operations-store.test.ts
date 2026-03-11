import { describe, it, expect, beforeEach } from 'vitest'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'
import type { OperationsStatusDto } from '@the-crew/shared-types'

describe('operations overlay store', () => {
  beforeEach(() => {
    useVisualWorkspaceStore.setState({
      showOperationsOverlay: false,
      operationsStatus: null,
      isDiffMode: false,
      showValidationOverlay: true,
      baseReleaseId: null,
      compareReleaseId: null,
      diffFilter: null,
    })
  })

  it('showOperationsOverlay defaults to false', () => {
    expect(useVisualWorkspaceStore.getState().showOperationsOverlay).toBe(false)
  })

  it('toggleOperationsOverlay toggles the flag', () => {
    useVisualWorkspaceStore.getState().toggleOperationsOverlay()
    expect(useVisualWorkspaceStore.getState().showOperationsOverlay).toBe(true)

    useVisualWorkspaceStore.getState().toggleOperationsOverlay()
    expect(useVisualWorkspaceStore.getState().showOperationsOverlay).toBe(false)
  })

  it('setOperationsStatus sets the status', () => {
    const status: OperationsStatusDto = {
      projectId: 'p1',
      scopeType: 'company',
      entityId: null,
      entities: [],
      summary: {
        totalActiveRuns: 2,
        totalBlockedStages: 1,
        totalFailedRuns: 0,
        totalOpenIncidents: 3,
        totalComplianceViolations: 0,
      },
      fetchedAt: '2026-03-10T12:00:00Z',
    }
    useVisualWorkspaceStore.getState().setOperationsStatus(status)
    expect(useVisualWorkspaceStore.getState().operationsStatus).toEqual(status)

    useVisualWorkspaceStore.getState().setOperationsStatus(null)
    expect(useVisualWorkspaceStore.getState().operationsStatus).toBeNull()
  })

  it('enterDiffMode auto-disables showOperationsOverlay', () => {
    useVisualWorkspaceStore.getState().toggleOperationsOverlay()
    expect(useVisualWorkspaceStore.getState().showOperationsOverlay).toBe(true)

    useVisualWorkspaceStore.getState().enterDiffMode('release-a', 'release-b')
    expect(useVisualWorkspaceStore.getState().showOperationsOverlay).toBe(false)
    expect(useVisualWorkspaceStore.getState().isDiffMode).toBe(true)
  })

  it('operationsStatus defaults to null', () => {
    expect(useVisualWorkspaceStore.getState().operationsStatus).toBeNull()
  })
})
