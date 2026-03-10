import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Inspector } from '@/components/visual-shell/inspector/inspector'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'
import {
  allMockNodes,
  allMockEdges,
} from './fixtures/visual-graph'

vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('no backend')))

describe('Inspector', () => {
  beforeEach(() => {
    useVisualWorkspaceStore.setState({
      inspectorCollapsed: false,
      selectedNodeIds: [],
      selectedEdgeIds: [],
    })
  })

  it('should render inspector panel', () => {
    render(<Inspector graphNodes={allMockNodes} graphEdges={allMockEdges} />)
    expect(screen.getByTestId('inspector')).toBeInTheDocument()
  })

  it('should render collapsed sidebar with expand button when collapsed', () => {
    useVisualWorkspaceStore.setState({ inspectorCollapsed: true })
    render(
      <Inspector graphNodes={allMockNodes} graphEdges={allMockEdges} />,
    )
    expect(screen.getByTestId('inspector-collapsed')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Expand inspector' })).toBeInTheDocument()
    expect(screen.queryByTestId('inspector')).not.toBeInTheDocument()
  })

  it('should show canvas summary when nothing selected', () => {
    render(<Inspector graphNodes={allMockNodes} graphEdges={allMockEdges} />)
    expect(screen.getByTestId('canvas-summary')).toBeInTheDocument()
  })

  it('should show node detail with tabs when single node selected', () => {
    useVisualWorkspaceStore.setState({ selectedNodeIds: ['dept:abc'] })
    render(<Inspector graphNodes={allMockNodes} graphEdges={allMockEdges} />)
    expect(screen.getByTestId('inspector-detail')).toBeInTheDocument()
    expect(screen.getByTestId('tab-overview')).toBeInTheDocument()
    expect(screen.getByTestId('tab-properties')).toBeInTheDocument()
    expect(screen.getByTestId('tab-relations')).toBeInTheDocument()
  })

  it('should show overview tab by default for single node', () => {
    useVisualWorkspaceStore.setState({ selectedNodeIds: ['dept:abc'] })
    render(<Inspector graphNodes={allMockNodes} graphEdges={allMockEdges} />)
    expect(screen.getByTestId('overview-tab')).toBeInTheDocument()
  })

  it('should switch to properties tab when clicked', async () => {
    useVisualWorkspaceStore.setState({ selectedNodeIds: ['dept:abc'] })
    render(<Inspector graphNodes={allMockNodes} graphEdges={allMockEdges} />)
    await userEvent.click(screen.getByTestId('tab-properties'))
    expect(screen.getByTestId('properties-tab')).toBeInTheDocument()
  })

  it('should switch to relations tab when clicked', async () => {
    useVisualWorkspaceStore.setState({ selectedNodeIds: ['dept:abc'] })
    render(<Inspector graphNodes={allMockNodes} graphEdges={allMockEdges} />)
    await userEvent.click(screen.getByTestId('tab-relations'))
    expect(screen.getByTestId('relations-tab')).toBeInTheDocument()
  })

  it('should show inspector header with node type and label for single node', () => {
    useVisualWorkspaceStore.setState({ selectedNodeIds: ['dept:abc'] })
    render(<Inspector graphNodes={allMockNodes} graphEdges={allMockEdges} />)
    const header = screen.getByTestId('inspector-header')
    expect(within(header).getByText('Department')).toBeInTheDocument()
    expect(within(header).getByText('Marketing')).toBeInTheDocument()
  })

  it('should show edge inspector for single edge selection', () => {
    useVisualWorkspaceStore.setState({
      selectedEdgeIds: [allMockEdges[0]!.id],
    })
    render(<Inspector graphNodes={allMockNodes} graphEdges={allMockEdges} />)
    expect(screen.getByTestId('edge-inspector')).toBeInTheDocument()
  })

  it('should show multi-select summary for multiple selections', () => {
    useVisualWorkspaceStore.setState({
      selectedNodeIds: ['dept:abc', 'role:r1'],
    })
    render(<Inspector graphNodes={allMockNodes} graphEdges={allMockEdges} />)
    expect(screen.getByTestId('multi-select-summary')).toBeInTheDocument()
    expect(screen.getByText('2 items selected')).toBeInTheDocument()
  })

  it('should toggle collapse when clicking close button', async () => {
    render(<Inspector graphNodes={allMockNodes} graphEdges={allMockEdges} />)
    const closeBtn = screen.getByRole('button', { name: 'Close inspector' })
    await userEvent.click(closeBtn)
    expect(useVisualWorkspaceStore.getState().inspectorCollapsed).toBe(true)
  })

  it('should expand when clicking expand button in collapsed state', async () => {
    useVisualWorkspaceStore.setState({ inspectorCollapsed: true })
    render(<Inspector graphNodes={allMockNodes} graphEdges={allMockEdges} />)
    const expandBtn = screen.getByRole('button', { name: 'Expand inspector' })
    await userEvent.click(expandBtn)
    expect(useVisualWorkspaceStore.getState().inspectorCollapsed).toBe(false)
  })

  it('should work with empty graph data', () => {
    render(<Inspector />)
    expect(screen.getByTestId('canvas-summary')).toBeInTheDocument()
    expect(screen.getByText('No nodes in view.')).toBeInTheDocument()
  })

  it('should show no selection header for multi-select', () => {
    useVisualWorkspaceStore.setState({
      selectedNodeIds: ['dept:abc', 'role:r1', 'cap:c1'],
    })
    render(<Inspector graphNodes={allMockNodes} graphEdges={allMockEdges} />)
    expect(screen.getByText('No selection')).toBeInTheDocument()
    expect(screen.getByText('3 items selected')).toBeInTheDocument()
  })
})
