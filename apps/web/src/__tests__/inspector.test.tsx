import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Inspector } from '@/components/visual-shell/inspector/inspector'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'
import {
  allMockNodes,
  allMockEdges,
} from './fixtures/visual-graph'

vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('no backend')))

function renderInspector(props: Parameters<typeof Inspector>[0] = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <Inspector {...props} />
    </QueryClientProvider>,
  )
}

describe('Inspector', () => {
  beforeEach(() => {
    useVisualWorkspaceStore.setState({
      inspectorCollapsed: false,
      selectedNodeIds: [],
      selectedEdgeIds: [],
      projectId: 'test-project',
    })
  })

  it('should render inspector panel', () => {
    renderInspector({ graphNodes: allMockNodes, graphEdges: allMockEdges })
    expect(screen.getByTestId('inspector')).toBeInTheDocument()
  })

  it('should render collapsed sidebar with expand button when collapsed', () => {
    useVisualWorkspaceStore.setState({ inspectorCollapsed: true })
    renderInspector({ graphNodes: allMockNodes, graphEdges: allMockEdges })
    expect(screen.getByTestId('inspector-collapsed')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Expand inspector' })).toBeInTheDocument()
    expect(screen.queryByTestId('inspector')).not.toBeInTheDocument()
  })

  it('should show canvas summary when nothing selected', () => {
    renderInspector({ graphNodes: allMockNodes, graphEdges: allMockEdges })
    expect(screen.getByTestId('canvas-summary')).toBeInTheDocument()
  })

  it('should show node detail with tabs when single node selected', () => {
    useVisualWorkspaceStore.setState({ selectedNodeIds: ['dept:abc'] })
    renderInspector({ graphNodes: allMockNodes, graphEdges: allMockEdges })
    expect(screen.getByTestId('inspector-detail')).toBeInTheDocument()
    // New tab structure: Edit, Relations, Validation, Properties
    expect(screen.getByTestId('tab-edit')).toBeInTheDocument()
    expect(screen.getByTestId('tab-relations')).toBeInTheDocument()
    expect(screen.getByTestId('tab-validation')).toBeInTheDocument()
    expect(screen.getByTestId('tab-properties')).toBeInTheDocument()
  })

  it('should show edit form panel by default for editable node', () => {
    useVisualWorkspaceStore.setState({ selectedNodeIds: ['dept:abc'] })
    renderInspector({ graphNodes: allMockNodes, graphEdges: allMockEdges })
    expect(screen.getByTestId('edit-form-panel')).toBeInTheDocument()
  })

  it('should show overview tab for non-editable node types', () => {
    useVisualWorkspaceStore.setState({ selectedNodeIds: ['company:xyz'] })
    const nodes = [
      ...allMockNodes,
      {
        id: 'company:xyz',
        nodeType: 'company' as const,
        entityId: 'xyz',
        label: 'TestCo',
        sublabel: null,
        position: null,
        status: 'normal' as const,
        collapsed: false,
        layerIds: ['organization' as const],
        parentId: null,
      },
    ]
    renderInspector({ graphNodes: nodes, graphEdges: allMockEdges })
    // Non-editable nodes get Overview tab instead of Edit
    expect(screen.getByTestId('tab-overview')).toBeInTheDocument()
    expect(screen.queryByTestId('tab-edit')).not.toBeInTheDocument()
  })

  it('should switch to properties tab when clicked', async () => {
    useVisualWorkspaceStore.setState({ selectedNodeIds: ['dept:abc'] })
    renderInspector({ graphNodes: allMockNodes, graphEdges: allMockEdges })
    await userEvent.click(screen.getByTestId('tab-properties'))
    expect(screen.getByTestId('properties-tab')).toBeInTheDocument()
  })

  it('should switch to relations tab when clicked', async () => {
    useVisualWorkspaceStore.setState({ selectedNodeIds: ['dept:abc'] })
    renderInspector({ graphNodes: allMockNodes, graphEdges: allMockEdges })
    await userEvent.click(screen.getByTestId('tab-relations'))
    expect(screen.getByTestId('relations-tab')).toBeInTheDocument()
  })

  it('should switch to validation tab when clicked', async () => {
    useVisualWorkspaceStore.setState({ selectedNodeIds: ['dept:abc'] })
    renderInspector({ graphNodes: allMockNodes, graphEdges: allMockEdges })
    await userEvent.click(screen.getByTestId('tab-validation'))
    expect(screen.getByTestId('validation-tab')).toBeInTheDocument()
  })

  it('should show inspector header with node type and label for single node', () => {
    useVisualWorkspaceStore.setState({ selectedNodeIds: ['dept:abc'] })
    renderInspector({ graphNodes: allMockNodes, graphEdges: allMockEdges })
    const header = screen.getByTestId('inspector-header')
    expect(within(header).getByText('Department')).toBeInTheDocument()
    expect(within(header).getByText('Marketing')).toBeInTheDocument()
  })

  it('should show edge inspector for single edge selection', () => {
    useVisualWorkspaceStore.setState({
      selectedEdgeIds: [allMockEdges[0]!.id],
    })
    renderInspector({ graphNodes: allMockNodes, graphEdges: allMockEdges })
    expect(screen.getByTestId('edge-inspector')).toBeInTheDocument()
  })

  it('should show multi-select summary for multiple selections', () => {
    useVisualWorkspaceStore.setState({
      selectedNodeIds: ['dept:abc', 'role:r1'],
    })
    renderInspector({ graphNodes: allMockNodes, graphEdges: allMockEdges })
    expect(screen.getByTestId('multi-select-summary')).toBeInTheDocument()
    expect(screen.getByText('2 items selected')).toBeInTheDocument()
  })

  it('should toggle collapse when clicking close button', async () => {
    renderInspector({ graphNodes: allMockNodes, graphEdges: allMockEdges })
    const closeBtn = screen.getByRole('button', { name: 'Close inspector' })
    await userEvent.click(closeBtn)
    expect(useVisualWorkspaceStore.getState().inspectorCollapsed).toBe(true)
  })

  it('should expand when clicking expand button in collapsed state', async () => {
    useVisualWorkspaceStore.setState({ inspectorCollapsed: true })
    renderInspector({ graphNodes: allMockNodes, graphEdges: allMockEdges })
    const expandBtn = screen.getByRole('button', { name: 'Expand inspector' })
    await userEvent.click(expandBtn)
    expect(useVisualWorkspaceStore.getState().inspectorCollapsed).toBe(false)
  })

  it('should work with empty graph data', () => {
    renderInspector()
    expect(screen.getByTestId('canvas-summary')).toBeInTheDocument()
    expect(screen.getByText('No nodes in view.')).toBeInTheDocument()
  })

  it('should show no selection header for multi-select', () => {
    useVisualWorkspaceStore.setState({
      selectedNodeIds: ['dept:abc', 'role:r1', 'cap:c1'],
    })
    renderInspector({ graphNodes: allMockNodes, graphEdges: allMockEdges })
    expect(screen.getByText('No selection')).toBeInTheDocument()
    expect(screen.getByText('3 items selected')).toBeInTheDocument()
  })

  it('should show validation badge count on tab', () => {
    useVisualWorkspaceStore.setState({
      selectedNodeIds: ['dept:abc'],
      projectId: 'p1',
      validationIssues: [
        { entity: 'Department', entityId: 'abc', severity: 'error', message: 'Missing mandate', field: null },
        { entity: 'Department', entityId: 'abc', severity: 'warning', message: 'No owner', field: null },
      ],
    })
    renderInspector({ graphNodes: allMockNodes, graphEdges: allMockEdges })
    const validationTab = screen.getByTestId('tab-validation')
    expect(validationTab.textContent).toContain('2')
  })
})
