import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { VisualNodeDto } from '@the-crew/shared-types'
import { CanvasContextMenu } from '@/components/visual-shell/context-menu'
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

describe('CanvasContextMenu a11y', () => {
  it('should have role="menu" on the menu container', () => {
    useVisualWorkspaceStore.setState({
      contextMenu: { x: 100, y: 200, type: 'pane' },
      graphNodes: [makeNode()],
    })
    render(<CanvasContextMenu />)
    const menu = screen.getByRole('menu')
    expect(menu).toBeTruthy()
  })

  it('should have role="menuitem" on each menu item', () => {
    const nodes = [makeNode({ id: 'n1', nodeType: 'role' })]
    useVisualWorkspaceStore.setState({
      contextMenu: { x: 100, y: 200, type: 'node', targetId: 'n1' },
      graphNodes: nodes,
    })
    render(<CanvasContextMenu />)
    const menuItems = screen.getAllByRole('menuitem')
    expect(menuItems.length).toBeGreaterThan(0)
  })

  it('should have role="separator" between sections', () => {
    const nodes = [makeNode({ id: 'n1', nodeType: 'role' })]
    useVisualWorkspaceStore.setState({
      contextMenu: { x: 100, y: 200, type: 'node', targetId: 'n1' },
      graphNodes: nodes,
    })
    render(<CanvasContextMenu />)
    const separators = screen.getAllByRole('separator')
    expect(separators.length).toBeGreaterThan(0)
  })

  it('should navigate to next item on ArrowDown', async () => {
    const nodes = [makeNode({ id: 'n1', nodeType: 'role' })]
    useVisualWorkspaceStore.setState({
      contextMenu: { x: 100, y: 200, type: 'node', targetId: 'n1' },
      graphNodes: nodes,
    })
    render(<CanvasContextMenu />)

    // Wait for auto-focus on first item
    await vi.waitFor(() => {
      const items = screen.getAllByRole('menuitem')
      expect(document.activeElement).toBe(items[0])
    })

    fireEvent.keyDown(screen.getByRole('menu'), { key: 'ArrowDown' })

    const items = screen.getAllByRole('menuitem')
    expect(document.activeElement).toBe(items[1])
  })

  it('should navigate to previous item on ArrowUp', async () => {
    const nodes = [makeNode({ id: 'n1', nodeType: 'role' })]
    useVisualWorkspaceStore.setState({
      contextMenu: { x: 100, y: 200, type: 'node', targetId: 'n1' },
      graphNodes: nodes,
    })
    render(<CanvasContextMenu />)

    await vi.waitFor(() => {
      const items = screen.getAllByRole('menuitem')
      expect(document.activeElement).toBe(items[0])
    })

    // ArrowUp from first should wrap to last
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'ArrowUp' })

    const items = screen.getAllByRole('menuitem')
    expect(document.activeElement).toBe(items[items.length - 1])
  })

  it('should wrap ArrowDown from last to first', async () => {
    useVisualWorkspaceStore.setState({
      contextMenu: { x: 100, y: 200, type: 'pane' },
      graphNodes: [makeNode()],
      currentScope: { scopeType: 'company', entityId: null, zoomLevel: 'L1' },
    })
    render(<CanvasContextMenu />)

    await vi.waitFor(() => {
      expect(document.activeElement?.getAttribute('role')).toBe('menuitem')
    })

    const items = screen.getAllByRole('menuitem')
    // Focus the last item
    const last = items[items.length - 1]!
    last.focus()
    expect(document.activeElement).toBe(last)

    fireEvent.keyDown(screen.getByRole('menu'), { key: 'ArrowDown' })
    expect(document.activeElement).toBe(items[0])
  })
})
