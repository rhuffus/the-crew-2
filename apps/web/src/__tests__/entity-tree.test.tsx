import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { VisualNodeDto } from '@the-crew/shared-types'
import { EntityTree } from '@/components/visual-shell/explorer/entity-tree'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'

vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('no backend')))

function makeNode(overrides: Partial<VisualNodeDto> & { id: string; nodeType: VisualNodeDto['nodeType']; label: string }): VisualNodeDto {
  return {
    entityId: overrides.id,
    sublabel: null,
    position: null,
    collapsed: false,
    status: 'normal',
    layerIds: ['organization'],
    parentId: null,
    ...overrides,
  }
}

const MOCK_NODES: VisualNodeDto[] = [
  makeNode({ id: 'company-1', nodeType: 'company', label: 'Acme Corp' }),
  makeNode({ id: 'dept-1', nodeType: 'department', label: 'Engineering' }),
  makeNode({ id: 'dept-2', nodeType: 'department', label: 'Sales' }),
  makeNode({ id: 'role-1', nodeType: 'role', label: 'Tech Lead' }),
  makeNode({ id: 'cap-1', nodeType: 'capability', label: 'API Design', layerIds: ['capabilities'] }),
  makeNode({ id: 'wf-1', nodeType: 'workflow', label: 'Deploy Pipeline', layerIds: ['workflows'] }),
  makeNode({ id: 'err-node', nodeType: 'policy', label: 'Bad Policy', status: 'error', layerIds: ['governance'] }),
  makeNode({ id: 'warn-node', nodeType: 'contract', label: 'Risky Contract', status: 'warning', layerIds: ['contracts'] }),
]

describe('EntityTree', () => {
  beforeEach(() => {
    useVisualWorkspaceStore.setState({
      graphNodes: [],
      selectedNodeIds: [],
      selectedEdgeIds: [],
      focusNodeId: null,
    })
  })

  it('should show empty state when no graph nodes', () => {
    render(<EntityTree />)
    expect(screen.getByTestId('entity-tree')).toBeInTheDocument()
    expect(screen.getByText('No entities in current view.')).toBeInTheDocument()
  })

  it('should render groups for each node type present', () => {
    useVisualWorkspaceStore.setState({ graphNodes: MOCK_NODES })
    render(<EntityTree />)
    expect(screen.getByTestId('entity-group-company')).toBeInTheDocument()
    expect(screen.getByTestId('entity-group-department')).toBeInTheDocument()
    expect(screen.getByTestId('entity-group-role')).toBeInTheDocument()
    expect(screen.getByTestId('entity-group-capability')).toBeInTheDocument()
    expect(screen.getByTestId('entity-group-workflow')).toBeInTheDocument()
    expect(screen.getByTestId('entity-group-policy')).toBeInTheDocument()
    expect(screen.getByTestId('entity-group-contract')).toBeInTheDocument()
  })

  it('should not render groups for absent node types', () => {
    useVisualWorkspaceStore.setState({ graphNodes: MOCK_NODES })
    render(<EntityTree />)
    expect(screen.queryByTestId('entity-group-skill')).not.toBeInTheDocument()
    expect(screen.queryByTestId('entity-group-agent-archetype')).not.toBeInTheDocument()
    expect(screen.queryByTestId('entity-group-agent-assignment')).not.toBeInTheDocument()
    expect(screen.queryByTestId('entity-group-workflow-stage')).not.toBeInTheDocument()
  })

  it('should display group labels with counts', () => {
    useVisualWorkspaceStore.setState({ graphNodes: MOCK_NODES })
    render(<EntityTree />)
    const deptGroup = screen.getByTestId('entity-group-department')
    expect(deptGroup).toHaveTextContent('Departments')
    expect(deptGroup).toHaveTextContent('2')
  })

  it('should render individual nodes with labels', () => {
    useVisualWorkspaceStore.setState({ graphNodes: MOCK_NODES })
    render(<EntityTree />)
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    expect(screen.getByText('Engineering')).toBeInTheDocument()
    expect(screen.getByText('Sales')).toBeInTheDocument()
    expect(screen.getByText('Tech Lead')).toBeInTheDocument()
    expect(screen.getByText('API Design')).toBeInTheDocument()
    expect(screen.getByText('Deploy Pipeline')).toBeInTheDocument()
  })

  it('should collapse and expand a group', async () => {
    useVisualWorkspaceStore.setState({ graphNodes: MOCK_NODES })
    render(<EntityTree />)

    expect(screen.getByText('Engineering')).toBeInTheDocument()
    expect(screen.getByText('Sales')).toBeInTheDocument()

    const deptGroup = screen.getByTestId('entity-group-department')
    const toggleButton = within(deptGroup).getByText('Departments').closest('button')!
    await userEvent.click(toggleButton)

    expect(screen.queryByText('Engineering')).not.toBeInTheDocument()
    expect(screen.queryByText('Sales')).not.toBeInTheDocument()

    await userEvent.click(toggleButton)

    expect(screen.getByText('Engineering')).toBeInTheDocument()
    expect(screen.getByText('Sales')).toBeInTheDocument()
  })

  it('should highlight selected nodes', () => {
    useVisualWorkspaceStore.setState({
      graphNodes: MOCK_NODES,
      selectedNodeIds: ['dept-1'],
    })
    render(<EntityTree />)
    const nodeButton = screen.getByTestId('entity-tree-node-dept-1')
    expect(nodeButton).toHaveClass('bg-primary/10')
    expect(nodeButton).toHaveClass('text-primary')
  })

  it('should not highlight unselected nodes', () => {
    useVisualWorkspaceStore.setState({
      graphNodes: MOCK_NODES,
      selectedNodeIds: ['dept-1'],
    })
    render(<EntityTree />)
    const nodeButton = screen.getByTestId('entity-tree-node-dept-2')
    expect(nodeButton).not.toHaveClass('bg-primary/10')
  })

  it('should select and focus node on click', async () => {
    useVisualWorkspaceStore.setState({ graphNodes: MOCK_NODES })
    render(<EntityTree />)

    await userEvent.click(screen.getByTestId('entity-tree-node-dept-1'))

    const state = useVisualWorkspaceStore.getState()
    expect(state.selectedNodeIds).toEqual(['dept-1'])
    expect(state.focusNodeId).toBe('dept-1')
  })

  it('should show error status indicator', () => {
    useVisualWorkspaceStore.setState({ graphNodes: MOCK_NODES })
    render(<EntityTree />)
    expect(screen.getByTestId('node-status-error-err-node')).toBeInTheDocument()
  })

  it('should show warning status indicator', () => {
    useVisualWorkspaceStore.setState({ graphNodes: MOCK_NODES })
    render(<EntityTree />)
    expect(screen.getByTestId('node-status-warning-warn-node')).toBeInTheDocument()
  })

  it('should not show status indicator for normal nodes', () => {
    useVisualWorkspaceStore.setState({ graphNodes: MOCK_NODES })
    render(<EntityTree />)
    expect(screen.queryByTestId('node-status-error-dept-1')).not.toBeInTheDocument()
    expect(screen.queryByTestId('node-status-warning-dept-1')).not.toBeInTheDocument()
  })

  it('should render groups in defined order', () => {
    useVisualWorkspaceStore.setState({ graphNodes: MOCK_NODES })
    render(<EntityTree />)
    const groups = screen.getAllByTestId(/^entity-group-/)
    const groupTypes = groups.map((g) => g.getAttribute('data-testid')!.replace('entity-group-', ''))
    // company < department < role < capability < workflow < contract < policy
    const expectedOrder = ['company', 'department', 'role', 'capability', 'workflow', 'contract', 'policy']
    expect(groupTypes).toEqual(expectedOrder)
  })

  it('should update when graphNodes change', () => {
    const { rerender } = render(<EntityTree />)
    expect(screen.getByText('No entities in current view.')).toBeInTheDocument()

    act(() => {
      useVisualWorkspaceStore.setState({
        graphNodes: [makeNode({ id: 'new-1', nodeType: 'department', label: 'New Dept' })],
      })
    })
    rerender(<EntityTree />)
    expect(screen.getByText('New Dept')).toBeInTheDocument()
  })
})
