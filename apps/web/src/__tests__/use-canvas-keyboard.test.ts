import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import type { VisualNodeDto } from '@the-crew/shared-types'
import { useCanvasKeyboard } from '@/hooks/use-canvas-keyboard'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'
import { useUndoRedoStore } from '@/stores/undo-redo-store'

function makeNode(
  id: string,
  nodeType: VisualNodeDto['nodeType'] = 'department',
): VisualNodeDto {
  return {
    id,
    nodeType,
    entityId: `entity-${id}`,
    label: id,
    sublabel: null,
    position: null,
    collapsed: false,
    status: 'normal',
    layerIds: ['organization'],
    parentId: null,
  }
}

function fireKey(key: string, options?: Partial<KeyboardEventInit>) {
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key, bubbles: true, ...options }),
  )
}

describe('useCanvasKeyboard', () => {
  let onDrillIn: ReturnType<typeof vi.fn>
  let onDrillOut: ReturnType<typeof vi.fn>

  beforeEach(() => {
    onDrillIn = vi.fn()
    onDrillOut = vi.fn()
    useVisualWorkspaceStore.setState({
      selectedNodeIds: [],
      selectedEdgeIds: [],
      graphNodes: [],
      graphEdges: [],
      focusNodeId: null,
      explorerCollapsed: false,
      inspectorCollapsed: false,
    })
  })

  function setup() {
    return renderHook(() =>
      useCanvasKeyboard({ onDrillIn, onDrillOut }),
    )
  }

  // --- Enter key: drill-in ---

  it('should call onDrillIn when Enter pressed with drillable department selected', () => {
    useVisualWorkspaceStore.setState({
      selectedNodeIds: ['dept-1'],
      graphNodes: [makeNode('dept-1', 'department')],
    })
    setup()
    fireKey('Enter')
    expect(onDrillIn).toHaveBeenCalledWith('dept-1')
  })

  it('should call onDrillIn when Enter pressed with drillable workflow selected', () => {
    useVisualWorkspaceStore.setState({
      selectedNodeIds: ['wf-1'],
      graphNodes: [makeNode('wf-1', 'workflow')],
    })
    setup()
    fireKey('Enter')
    expect(onDrillIn).toHaveBeenCalledWith('wf-1')
  })

  it('should call onDrillIn when Enter pressed with drillable company selected', () => {
    useVisualWorkspaceStore.setState({
      selectedNodeIds: ['co-1'],
      graphNodes: [makeNode('co-1', 'company')],
    })
    setup()
    fireKey('Enter')
    expect(onDrillIn).toHaveBeenCalledWith('co-1')
  })

  it('should NOT call onDrillIn for non-drillable node (role)', () => {
    useVisualWorkspaceStore.setState({
      selectedNodeIds: ['r-1'],
      graphNodes: [makeNode('r-1', 'role')],
    })
    setup()
    fireKey('Enter')
    expect(onDrillIn).not.toHaveBeenCalled()
  })

  it('should NOT call onDrillIn for non-drillable node (capability)', () => {
    useVisualWorkspaceStore.setState({
      selectedNodeIds: ['c-1'],
      graphNodes: [makeNode('c-1', 'capability')],
    })
    setup()
    fireKey('Enter')
    expect(onDrillIn).not.toHaveBeenCalled()
  })

  it('should NOT call onDrillIn with no selection', () => {
    setup()
    fireKey('Enter')
    expect(onDrillIn).not.toHaveBeenCalled()
  })

  it('should NOT call onDrillIn with multiple nodes selected', () => {
    useVisualWorkspaceStore.setState({
      selectedNodeIds: ['dept-1', 'dept-2'],
      graphNodes: [makeNode('dept-1'), makeNode('dept-2')],
    })
    setup()
    fireKey('Enter')
    expect(onDrillIn).not.toHaveBeenCalled()
  })

  it('should NOT call onDrillIn when selected node not found in graphNodes', () => {
    useVisualWorkspaceStore.setState({
      selectedNodeIds: ['ghost'],
      graphNodes: [makeNode('dept-1')],
    })
    setup()
    fireKey('Enter')
    expect(onDrillIn).not.toHaveBeenCalled()
  })

  // --- Escape key: clear selection / drill-out ---

  it('should clear selection on Escape when nodes are selected', () => {
    useVisualWorkspaceStore.setState({
      selectedNodeIds: ['dept-1'],
      graphNodes: [makeNode('dept-1')],
    })
    setup()
    fireKey('Escape')
    expect(useVisualWorkspaceStore.getState().selectedNodeIds).toEqual([])
    expect(onDrillOut).not.toHaveBeenCalled()
  })

  it('should clear selection on Escape when edges are selected', () => {
    useVisualWorkspaceStore.setState({
      selectedEdgeIds: ['e-1'],
    })
    setup()
    fireKey('Escape')
    expect(useVisualWorkspaceStore.getState().selectedEdgeIds).toEqual([])
    expect(onDrillOut).not.toHaveBeenCalled()
  })

  it('should call onDrillOut on Escape when nothing is selected', () => {
    setup()
    fireKey('Escape')
    expect(onDrillOut).toHaveBeenCalledOnce()
  })

  it('should first clear selection, then onDrillOut on consecutive Escapes', () => {
    useVisualWorkspaceStore.setState({
      selectedNodeIds: ['dept-1'],
      graphNodes: [makeNode('dept-1')],
    })
    setup()
    fireKey('Escape')
    expect(useVisualWorkspaceStore.getState().selectedNodeIds).toEqual([])
    expect(onDrillOut).not.toHaveBeenCalled()

    fireKey('Escape')
    expect(onDrillOut).toHaveBeenCalledOnce()
  })

  // --- Tab key: cycle selection ---

  it('should select first node with Tab when nothing selected', () => {
    const nodes = [makeNode('n1'), makeNode('n2'), makeNode('n3')]
    useVisualWorkspaceStore.setState({ graphNodes: nodes })
    setup()
    fireKey('Tab')
    expect(useVisualWorkspaceStore.getState().selectedNodeIds).toEqual(['n1'])
  })

  it('should cycle forward with Tab', () => {
    const nodes = [makeNode('n1'), makeNode('n2'), makeNode('n3')]
    useVisualWorkspaceStore.setState({
      graphNodes: nodes,
      selectedNodeIds: ['n1'],
    })
    setup()
    fireKey('Tab')
    expect(useVisualWorkspaceStore.getState().selectedNodeIds).toEqual(['n2'])
  })

  it('should cycle backward with Shift+Tab', () => {
    const nodes = [makeNode('n1'), makeNode('n2'), makeNode('n3')]
    useVisualWorkspaceStore.setState({
      graphNodes: nodes,
      selectedNodeIds: ['n2'],
    })
    setup()
    fireKey('Tab', { shiftKey: true })
    expect(useVisualWorkspaceStore.getState().selectedNodeIds).toEqual(['n1'])
  })

  it('should wrap around at end with Tab', () => {
    const nodes = [makeNode('n1'), makeNode('n2')]
    useVisualWorkspaceStore.setState({
      graphNodes: nodes,
      selectedNodeIds: ['n2'],
    })
    setup()
    fireKey('Tab')
    expect(useVisualWorkspaceStore.getState().selectedNodeIds).toEqual(['n1'])
  })

  it('should wrap around at beginning with Shift+Tab', () => {
    const nodes = [makeNode('n1'), makeNode('n2')]
    useVisualWorkspaceStore.setState({
      graphNodes: nodes,
      selectedNodeIds: ['n1'],
    })
    setup()
    fireKey('Tab', { shiftKey: true })
    expect(useVisualWorkspaceStore.getState().selectedNodeIds).toEqual(['n2'])
  })

  it('should select last node with Shift+Tab when nothing selected', () => {
    const nodes = [makeNode('n1'), makeNode('n2'), makeNode('n3')]
    useVisualWorkspaceStore.setState({ graphNodes: nodes })
    setup()
    fireKey('Tab', { shiftKey: true })
    expect(useVisualWorkspaceStore.getState().selectedNodeIds).toEqual(['n3'])
  })

  it('should not fire Tab when no nodes exist', () => {
    setup()
    fireKey('Tab')
    expect(useVisualWorkspaceStore.getState().selectedNodeIds).toEqual([])
  })

  it('should set focusNodeId on Tab to pan canvas to node', () => {
    const nodes = [makeNode('n1'), makeNode('n2')]
    useVisualWorkspaceStore.setState({
      graphNodes: nodes,
      selectedNodeIds: ['n1'],
    })
    setup()
    fireKey('Tab')
    expect(useVisualWorkspaceStore.getState().focusNodeId).toBe('n2')
  })

  // --- Panel toggles ---

  it('should toggle explorer with Ctrl+Shift+E', () => {
    setup()
    expect(useVisualWorkspaceStore.getState().explorerCollapsed).toBe(false)
    fireKey('E', { ctrlKey: true, shiftKey: true })
    expect(useVisualWorkspaceStore.getState().explorerCollapsed).toBe(true)
  })

  it('should toggle inspector with Ctrl+Shift+I', () => {
    setup()
    expect(useVisualWorkspaceStore.getState().inspectorCollapsed).toBe(false)
    fireKey('I', { ctrlKey: true, shiftKey: true })
    expect(useVisualWorkspaceStore.getState().inspectorCollapsed).toBe(true)
  })

  it('should toggle explorer with Meta+Shift+E (Mac)', () => {
    setup()
    fireKey('E', { metaKey: true, shiftKey: true })
    expect(useVisualWorkspaceStore.getState().explorerCollapsed).toBe(true)
  })

  it('should toggle inspector with Meta+Shift+I (Mac)', () => {
    setup()
    fireKey('I', { metaKey: true, shiftKey: true })
    expect(useVisualWorkspaceStore.getState().inspectorCollapsed).toBe(true)
  })

  it('should NOT toggle explorer with Ctrl+E (without Shift)', () => {
    setup()
    fireKey('e', { ctrlKey: true })
    expect(useVisualWorkspaceStore.getState().explorerCollapsed).toBe(false)
  })

  // --- Text input guard ---

  it('should NOT fire when INPUT is focused', () => {
    const input = document.createElement('input')
    document.body.appendChild(input)
    input.focus()

    useVisualWorkspaceStore.setState({
      selectedNodeIds: ['dept-1'],
      graphNodes: [makeNode('dept-1')],
    })
    setup()
    fireKey('Enter')
    expect(onDrillIn).not.toHaveBeenCalled()

    document.body.removeChild(input)
  })

  it('should NOT fire when TEXTAREA is focused', () => {
    const textarea = document.createElement('textarea')
    document.body.appendChild(textarea)
    textarea.focus()

    setup()
    fireKey('Escape')
    expect(onDrillOut).not.toHaveBeenCalled()

    document.body.removeChild(textarea)
  })

  it('should NOT fire Tab when SELECT is focused', () => {
    const select = document.createElement('select')
    document.body.appendChild(select)
    select.focus()

    useVisualWorkspaceStore.setState({
      graphNodes: [makeNode('n1')],
    })
    setup()
    fireKey('Tab')
    expect(useVisualWorkspaceStore.getState().selectedNodeIds).toEqual([])

    document.body.removeChild(select)
  })

  // --- Undo/Redo shortcuts (CAV-009) ---

  it('should call undo on Ctrl+Z', () => {
    const undoSpy = vi.spyOn(useUndoRedoStore.getState(), 'undo').mockResolvedValue(undefined)
    setup()
    fireKey('z', { ctrlKey: true })
    expect(undoSpy).toHaveBeenCalledOnce()
    undoSpy.mockRestore()
  })

  it('should call undo on Meta+Z (Mac)', () => {
    const undoSpy = vi.spyOn(useUndoRedoStore.getState(), 'undo').mockResolvedValue(undefined)
    setup()
    fireKey('z', { metaKey: true })
    expect(undoSpy).toHaveBeenCalledOnce()
    undoSpy.mockRestore()
  })

  it('should call redo on Ctrl+Shift+Z', () => {
    const redoSpy = vi.spyOn(useUndoRedoStore.getState(), 'redo').mockResolvedValue(undefined)
    setup()
    fireKey('Z', { ctrlKey: true, shiftKey: true })
    expect(redoSpy).toHaveBeenCalledOnce()
    redoSpy.mockRestore()
  })

  it('should call redo on Ctrl+Y', () => {
    const redoSpy = vi.spyOn(useUndoRedoStore.getState(), 'redo').mockResolvedValue(undefined)
    setup()
    fireKey('y', { ctrlKey: true })
    expect(redoSpy).toHaveBeenCalledOnce()
    redoSpy.mockRestore()
  })

  // --- Select All (CAV-009) ---

  it('should select all nodes on Ctrl+A', () => {
    const nodes = [makeNode('n1'), makeNode('n2'), makeNode('n3')]
    useVisualWorkspaceStore.setState({ graphNodes: nodes })
    setup()
    fireKey('a', { ctrlKey: true })
    expect(useVisualWorkspaceStore.getState().selectedNodeIds).toEqual(['n1', 'n2', 'n3'])
  })

  it('should not select all when no nodes', () => {
    setup()
    fireKey('a', { ctrlKey: true })
    expect(useVisualWorkspaceStore.getState().selectedNodeIds).toEqual([])
  })

  // --- Keyboard shortcuts help (CAV-009) ---

  it('should toggle keyboard help on ?', () => {
    useVisualWorkspaceStore.setState({ showKeyboardHelp: false })
    setup()
    fireKey('?', { shiftKey: true })
    expect(useVisualWorkspaceStore.getState().showKeyboardHelp).toBe(true)
    fireKey('?', { shiftKey: true })
    expect(useVisualWorkspaceStore.getState().showKeyboardHelp).toBe(false)
  })

  it('should dismiss keyboard help on Escape', () => {
    useVisualWorkspaceStore.setState({ showKeyboardHelp: true })
    setup()
    fireKey('Escape')
    expect(useVisualWorkspaceStore.getState().showKeyboardHelp).toBe(false)
    // Should NOT drill out when dismissing help
    expect(onDrillOut).not.toHaveBeenCalled()
  })

  // --- Cleanup ---

  it('should clean up event listener on unmount', () => {
    const { unmount } = setup()
    useVisualWorkspaceStore.setState({
      selectedNodeIds: ['dept-1'],
      graphNodes: [makeNode('dept-1')],
    })
    unmount()
    fireKey('Enter')
    expect(onDrillIn).not.toHaveBeenCalled()
  })
})
