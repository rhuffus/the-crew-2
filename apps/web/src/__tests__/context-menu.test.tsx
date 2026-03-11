import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { VisualNodeDto, VisualEdgeDto } from '@the-crew/shared-types'
import { CanvasContextMenu, type CanvasContextMenuProps } from '@/components/visual-shell/context-menu'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'

function makeNode(overrides: Partial<VisualNodeDto> = {}): VisualNodeDto {
  return {
    id: 'node-1',
    nodeType: 'department',
    entityId: 'dept-1',
    label: 'Engineering',
    sublabel: null,
    position: null,
    collapsed: false,
    status: 'normal',
    layerIds: ['organization'],
    parentId: null,
    ...overrides,
  }
}

function makeEdge(overrides: Partial<VisualEdgeDto> = {}): VisualEdgeDto {
  return {
    id: 'edge-1',
    edgeType: 'owns',
    sourceId: 'node-1',
    targetId: 'node-2',
    label: 'Owns',
    style: 'solid',
    layerIds: ['organization'],
    ...overrides,
  }
}

function renderMenu(props: Partial<CanvasContextMenuProps> = {}) {
  return render(<CanvasContextMenu {...props} />)
}

beforeEach(() => {
  useVisualWorkspaceStore.setState({
    contextMenu: null,
    graphNodes: [],
    graphEdges: [],
    collapsedNodeIds: [],
    isDiffMode: false,
    selectedNodeIds: [],
    selectedEdgeIds: [],
    currentScope: { scopeType: 'company', entityId: null, zoomLevel: 'L1' },
  })
})

describe('CanvasContextMenu', () => {
  it('renders nothing when contextMenu is null', () => {
    renderMenu()
    expect(screen.queryByTestId('canvas-context-menu')).toBeNull()
  })

  it('renders node context menu with inspect and drill-in for department', () => {
    const nodes = [makeNode({ id: 'n1', nodeType: 'department' })]
    useVisualWorkspaceStore.setState({
      contextMenu: { x: 100, y: 200, type: 'node', targetId: 'n1' },
      graphNodes: nodes,
    })
    renderMenu()
    expect(screen.getByTestId('canvas-context-menu')).toBeTruthy()
    expect(screen.getByTestId('context-menu-inspect')).toBeTruthy()
    expect(screen.getByTestId('context-menu-drill-in')).toBeTruthy()
  })

  it('renders edge context menu with inspect and delete', () => {
    const edges = [makeEdge({ id: 'e1' })]
    const nodes = [
      makeNode({ id: 'node-1', label: 'Engineering' }),
      makeNode({ id: 'node-2', label: 'Payments' }),
    ]
    useVisualWorkspaceStore.setState({
      contextMenu: { x: 100, y: 200, type: 'edge', targetId: 'e1' },
      graphEdges: edges,
      graphNodes: nodes,
    })
    renderMenu()
    expect(screen.getByTestId('context-menu-inspect-edge')).toBeTruthy()
    expect(screen.getByTestId('context-menu-delete-edge')).toBeTruthy()
    expect(screen.getByTestId('context-menu-focus-source')).toBeTruthy()
    expect(screen.getByTestId('context-menu-focus-target')).toBeTruthy()
  })

  it('renders pane context menu with add, fit-view, auto-layout', () => {
    useVisualWorkspaceStore.setState({
      contextMenu: { x: 100, y: 200, type: 'pane' },
      graphNodes: [makeNode()],
      currentScope: { scopeType: 'company', entityId: null, zoomLevel: 'L1' },
    })
    renderMenu()
    expect(screen.getByTestId('context-menu-add-node-department')).toBeTruthy()
    expect(screen.getByTestId('context-menu-fit-view')).toBeTruthy()
    expect(screen.getByTestId('context-menu-auto-layout')).toBeTruthy()
    expect(screen.getByTestId('context-menu-select-all')).toBeTruthy()
  })

  it('renders multi-select context menu', () => {
    useVisualWorkspaceStore.setState({
      contextMenu: { x: 100, y: 200, type: 'multi-select', targetId: 'n1' },
      selectedNodeIds: ['n1', 'n2', 'n3'],
      graphNodes: [
        makeNode({ id: 'n1' }),
        makeNode({ id: 'n2' }),
        makeNode({ id: 'n3' }),
      ],
    })
    renderMenu()
    expect(screen.getByTestId('context-menu-deselect-all')).toBeTruthy()
    expect(screen.getByTestId('context-menu-delete-selected')).toBeTruthy()
  })

  it('calls onDrillIn when drill-in is clicked', () => {
    const onDrillIn = vi.fn()
    const nodes = [makeNode({ id: 'n1', nodeType: 'department' })]
    useVisualWorkspaceStore.setState({
      contextMenu: { x: 100, y: 200, type: 'node', targetId: 'n1' },
      graphNodes: nodes,
    })
    renderMenu({ onDrillIn })
    fireEvent.click(screen.getByTestId('context-menu-drill-in'))
    expect(onDrillIn).toHaveBeenCalledWith('n1')
  })

  it('selects node on inspect click', () => {
    const nodes = [makeNode({ id: 'n1', nodeType: 'role' })]
    useVisualWorkspaceStore.setState({
      contextMenu: { x: 100, y: 200, type: 'node', targetId: 'n1' },
      graphNodes: nodes,
    })
    renderMenu()
    fireEvent.click(screen.getByTestId('context-menu-inspect'))
    expect(useVisualWorkspaceStore.getState().selectedNodeIds).toEqual(['n1'])
    expect(useVisualWorkspaceStore.getState().contextMenu).toBeNull()
  })

  it('calls onNodeDelete on delete click', () => {
    const onNodeDelete = vi.fn()
    const nodes = [makeNode({ id: 'n1', nodeType: 'role', entityId: 'role-42' })]
    useVisualWorkspaceStore.setState({
      contextMenu: { x: 100, y: 200, type: 'node', targetId: 'n1' },
      graphNodes: nodes,
    })
    renderMenu({ onNodeDelete })
    fireEvent.click(screen.getByTestId('context-menu-delete-node'))
    expect(onNodeDelete).toHaveBeenCalledWith('role', 'role-42')
  })

  it('switches to add-edge mode on create-relationship click', () => {
    const nodes = [makeNode({ id: 'n1', nodeType: 'role' })]
    useVisualWorkspaceStore.setState({
      contextMenu: { x: 100, y: 200, type: 'node', targetId: 'n1' },
      graphNodes: nodes,
    })
    renderMenu()
    fireEvent.click(screen.getByTestId('context-menu-create-relationship'))
    expect(useVisualWorkspaceStore.getState().canvasMode).toBe('add-edge')
    expect(useVisualWorkspaceStore.getState().addEdgeSource).toBe('n1')
  })

  it('toggles collapse on collapse click', () => {
    const nodes = [
      makeNode({ id: 'parent', nodeType: 'department' }),
      makeNode({ id: 'child', nodeType: 'role', parentId: 'parent' }),
    ]
    useVisualWorkspaceStore.setState({
      contextMenu: { x: 100, y: 200, type: 'node', targetId: 'parent' },
      graphNodes: nodes,
    })
    renderMenu()
    fireEvent.click(screen.getByTestId('context-menu-collapse'))
    expect(useVisualWorkspaceStore.getState().collapsedNodeIds).toContain('parent')
  })

  it('calls onFitView on fit-view click', () => {
    const onFitView = vi.fn()
    useVisualWorkspaceStore.setState({
      contextMenu: { x: 100, y: 200, type: 'pane' },
      graphNodes: [makeNode()],
    })
    renderMenu({ onFitView })
    fireEvent.click(screen.getByTestId('context-menu-fit-view'))
    expect(onFitView).toHaveBeenCalled()
  })

  it('calls onAutoLayout on auto-layout click', () => {
    const onAutoLayout = vi.fn()
    useVisualWorkspaceStore.setState({
      contextMenu: { x: 100, y: 200, type: 'pane' },
      graphNodes: [makeNode()],
    })
    renderMenu({ onAutoLayout })
    fireEvent.click(screen.getByTestId('context-menu-auto-layout'))
    expect(onAutoLayout).toHaveBeenCalled()
  })

  it('calls onAddEntity for add-node action', () => {
    const onAddEntity = vi.fn()
    useVisualWorkspaceStore.setState({
      contextMenu: { x: 100, y: 200, type: 'pane' },
      graphNodes: [makeNode()],
      currentScope: { scopeType: 'company', entityId: null, zoomLevel: 'L1' },
    })
    renderMenu({ onAddEntity })
    fireEvent.click(screen.getByTestId('context-menu-add-node-department'))
    expect(onAddEntity).toHaveBeenCalledWith('department')
  })

  it('selects all nodes on select-all click', () => {
    const nodes = [
      makeNode({ id: 'n1' }),
      makeNode({ id: 'n2' }),
    ]
    useVisualWorkspaceStore.setState({
      contextMenu: { x: 100, y: 200, type: 'pane' },
      graphNodes: nodes,
    })
    renderMenu()
    fireEvent.click(screen.getByTestId('context-menu-select-all'))
    expect(useVisualWorkspaceStore.getState().selectedNodeIds).toEqual(['n1', 'n2'])
  })

  it('clears selection on deselect-all click', () => {
    useVisualWorkspaceStore.setState({
      contextMenu: { x: 100, y: 200, type: 'multi-select', targetId: 'n1' },
      selectedNodeIds: ['n1', 'n2'],
      graphNodes: [makeNode({ id: 'n1' }), makeNode({ id: 'n2' })],
    })
    renderMenu()
    fireEvent.click(screen.getByTestId('context-menu-deselect-all'))
    expect(useVisualWorkspaceStore.getState().selectedNodeIds).toEqual([])
  })

  it('selects edge on inspect-edge click', () => {
    const edges = [makeEdge({ id: 'e1' })]
    const nodes = [makeNode({ id: 'node-1' }), makeNode({ id: 'node-2' })]
    useVisualWorkspaceStore.setState({
      contextMenu: { x: 100, y: 200, type: 'edge', targetId: 'e1' },
      graphEdges: edges,
      graphNodes: nodes,
    })
    renderMenu()
    fireEvent.click(screen.getByTestId('context-menu-inspect-edge'))
    expect(useVisualWorkspaceStore.getState().selectedEdgeIds).toEqual(['e1'])
  })

  it('shows delete confirm on edge delete click', () => {
    const edges = [makeEdge({ id: 'e1', edgeType: 'owns', sourceId: 'node-1', targetId: 'node-2' })]
    const nodes = [makeNode({ id: 'node-1' }), makeNode({ id: 'node-2' })]
    useVisualWorkspaceStore.setState({
      contextMenu: { x: 100, y: 200, type: 'edge', targetId: 'e1' },
      graphEdges: edges,
      graphNodes: nodes,
    })
    renderMenu()
    fireEvent.click(screen.getByTestId('context-menu-delete-edge'))
    expect(useVisualWorkspaceStore.getState().deleteConfirm).toEqual({
      edgeType: 'owns',
      sourceNodeId: 'node-1',
      targetNodeId: 'node-2',
    })
  })

  it('focuses source node on focus-source click', () => {
    const edges = [makeEdge({ id: 'e1', sourceId: 'node-1', targetId: 'node-2' })]
    const nodes = [
      makeNode({ id: 'node-1', label: 'Engineering' }),
      makeNode({ id: 'node-2', label: 'Payments' }),
    ]
    useVisualWorkspaceStore.setState({
      contextMenu: { x: 100, y: 200, type: 'edge', targetId: 'e1' },
      graphEdges: edges,
      graphNodes: nodes,
    })
    renderMenu()
    fireEvent.click(screen.getByTestId('context-menu-focus-source'))
    expect(useVisualWorkspaceStore.getState().selectedNodeIds).toEqual(['node-1'])
    expect(useVisualWorkspaceStore.getState().focusNodeId).toBe('node-1')
  })

  it('focuses target node on focus-target click', () => {
    const edges = [makeEdge({ id: 'e1', sourceId: 'node-1', targetId: 'node-2' })]
    const nodes = [
      makeNode({ id: 'node-1', label: 'Engineering' }),
      makeNode({ id: 'node-2', label: 'Payments' }),
    ]
    useVisualWorkspaceStore.setState({
      contextMenu: { x: 100, y: 200, type: 'edge', targetId: 'e1' },
      graphEdges: edges,
      graphNodes: nodes,
    })
    renderMenu()
    fireEvent.click(screen.getByTestId('context-menu-focus-target'))
    expect(useVisualWorkspaceStore.getState().selectedNodeIds).toEqual(['node-2'])
    expect(useVisualWorkspaceStore.getState().focusNodeId).toBe('node-2')
  })

  it('closes on Escape key', () => {
    useVisualWorkspaceStore.setState({
      contextMenu: { x: 100, y: 200, type: 'pane' },
      graphNodes: [makeNode()],
    })
    renderMenu()
    expect(screen.getByTestId('canvas-context-menu')).toBeTruthy()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(useVisualWorkspaceStore.getState().contextMenu).toBeNull()
  })

  it('has separator between sections', () => {
    const nodes = [makeNode({ id: 'n1', nodeType: 'role' })]
    useVisualWorkspaceStore.setState({
      contextMenu: { x: 100, y: 200, type: 'node', targetId: 'n1' },
      graphNodes: nodes,
    })
    renderMenu()
    const separators = screen.queryAllByTestId('context-menu-separator')
    expect(separators.length).toBeGreaterThan(0)
  })

  it('positions at contextMenu coordinates', () => {
    useVisualWorkspaceStore.setState({
      contextMenu: { x: 150, y: 250, type: 'pane' },
      graphNodes: [makeNode()],
    })
    renderMenu()
    const menu = screen.getByTestId('canvas-context-menu')
    expect(menu.style.left).toBe('150px')
    expect(menu.style.top).toBe('250px')
  })
})
