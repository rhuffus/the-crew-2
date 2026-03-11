import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { VisualNodeDto } from '@the-crew/shared-types'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'
import { useCanvasKeyboard } from '@/hooks/use-canvas-keyboard'
import { renderHook } from '@testing-library/react'

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

function pressKey(key: string, opts: Partial<KeyboardEventInit> = {}) {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, ...opts })
  document.dispatchEvent(event)
}

describe('canvas mode keyboard shortcuts', () => {
  const onDrillIn = vi.fn()
  const onDrillOut = vi.fn()

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
      canvasMode: 'select',
      addEdgeSource: null,
    })
    onDrillIn.mockClear()
    onDrillOut.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  function renderKeyboardHook() {
    return renderHook(() =>
      useCanvasKeyboard({ onDrillIn, onDrillOut }),
    )
  }

  it('should switch to select mode on V key', () => {
    useVisualWorkspaceStore.getState().setCanvasMode('pan')
    renderKeyboardHook()
    pressKey('v')
    expect(useVisualWorkspaceStore.getState().canvasMode).toBe('select')
  })

  it('should switch to pan mode on H key', () => {
    renderKeyboardHook()
    pressKey('h')
    expect(useVisualWorkspaceStore.getState().canvasMode).toBe('pan')
  })

  it('should switch to connect mode on C key', () => {
    renderKeyboardHook()
    pressKey('c')
    expect(useVisualWorkspaceStore.getState().canvasMode).toBe('connect')
  })

  it('should switch to add-node mode on N key', () => {
    renderKeyboardHook()
    pressKey('n')
    expect(useVisualWorkspaceStore.getState().canvasMode).toBe('add-node')
  })

  it('should switch to add-edge mode on E key', () => {
    renderKeyboardHook()
    pressKey('e')
    expect(useVisualWorkspaceStore.getState().canvasMode).toBe('add-edge')
  })

  it('should handle uppercase mode shortcuts', () => {
    renderKeyboardHook()
    pressKey('H')
    expect(useVisualWorkspaceStore.getState().canvasMode).toBe('pan')
  })

  it('should not switch mode when modifier keys are held', () => {
    renderKeyboardHook()
    pressKey('v', { ctrlKey: true })
    expect(useVisualWorkspaceStore.getState().canvasMode).toBe('select')
    // Should stay select, not toggled
    useVisualWorkspaceStore.getState().setCanvasMode('pan')
    pressKey('v', { metaKey: true })
    expect(useVisualWorkspaceStore.getState().canvasMode).toBe('pan')
  })

  it('should not switch mode in diff mode', () => {
    useVisualWorkspaceStore.setState({ isDiffMode: true })
    renderKeyboardHook()
    pressKey('h')
    expect(useVisualWorkspaceStore.getState().canvasMode).toBe('select')
  })

  describe('Escape behavior with modes', () => {
    it('should clear addEdgeSource on Escape in add-edge mode', () => {
      useVisualWorkspaceStore.getState().setCanvasMode('add-edge')
      useVisualWorkspaceStore.getState().setAddEdgeSource('node-1')
      renderKeyboardHook()
      pressKey('Escape')
      expect(useVisualWorkspaceStore.getState().addEdgeSource).toBeNull()
      // Should still be in add-edge mode
      expect(useVisualWorkspaceStore.getState().canvasMode).toBe('add-edge')
    })

    it('should switch to select mode on Escape from non-select mode', () => {
      useVisualWorkspaceStore.getState().setCanvasMode('connect')
      renderKeyboardHook()
      pressKey('Escape')
      expect(useVisualWorkspaceStore.getState().canvasMode).toBe('select')
    })

    it('should clear selection before drill out in select mode', () => {
      useVisualWorkspaceStore.setState({
        selectedNodeIds: ['node-1'],
        graphNodes: [makeNode('node-1')],
      })
      renderKeyboardHook()
      pressKey('Escape')
      expect(useVisualWorkspaceStore.getState().selectedNodeIds).toEqual([])
      expect(onDrillOut).not.toHaveBeenCalled()
    })

    it('should drill out on Escape in select mode with no selection', () => {
      renderKeyboardHook()
      pressKey('Escape')
      expect(onDrillOut).toHaveBeenCalled()
    })

    it('should prioritize addEdgeSource clear over mode switch', () => {
      useVisualWorkspaceStore.getState().setCanvasMode('add-edge')
      useVisualWorkspaceStore.getState().setAddEdgeSource('node-1')
      renderKeyboardHook()
      pressKey('Escape')
      // Should clear source but stay in add-edge mode
      expect(useVisualWorkspaceStore.getState().canvasMode).toBe('add-edge')
      expect(useVisualWorkspaceStore.getState().addEdgeSource).toBeNull()
      // Second Escape should switch to select
      pressKey('Escape')
      expect(useVisualWorkspaceStore.getState().canvasMode).toBe('select')
    })
  })
})
