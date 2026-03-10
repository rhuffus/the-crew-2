import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { VisualNodeDto } from '@the-crew/shared-types'
import { FilterPanel } from '@/components/visual-shell/explorer/filter-panel'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'

vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('no backend')))

function makeNode(id: string, nodeType: VisualNodeDto['nodeType'], status: VisualNodeDto['status'] = 'normal'): VisualNodeDto {
  return {
    id,
    nodeType,
    entityId: id,
    label: id,
    sublabel: null,
    position: null,
    collapsed: false,
    status,
    layerIds: ['organization'],
    parentId: null,
  }
}

describe('FilterPanel', () => {
  beforeEach(() => {
    useVisualWorkspaceStore.setState({
      graphNodes: [
        makeNode('d1', 'department'),
        makeNode('r1', 'role'),
        makeNode('c1', 'capability', 'warning'),
      ],
      nodeTypeFilter: null,
      statusFilter: null,
    })
  })

  it('should render available node types as checkboxes', () => {
    render(<FilterPanel />)
    expect(screen.getByTestId('filter-type-department')).toBeChecked()
    expect(screen.getByTestId('filter-type-role')).toBeChecked()
    expect(screen.getByTestId('filter-type-capability')).toBeChecked()
  })

  it('should render available statuses', () => {
    render(<FilterPanel />)
    expect(screen.getByTestId('filter-status-normal')).toBeChecked()
    expect(screen.getByTestId('filter-status-warning')).toBeChecked()
  })

  it('should show "No graph loaded" when no nodes', () => {
    useVisualWorkspaceStore.setState({ graphNodes: [] })
    render(<FilterPanel />)
    expect(screen.getByText('No graph loaded')).toBeInTheDocument()
  })

  it('should toggle a node type filter on', async () => {
    render(<FilterPanel />)
    // Clicking a checked box when no filter is set → sets filter to all except that type
    await userEvent.click(screen.getByTestId('filter-type-department'))
    const state = useVisualWorkspaceStore.getState()
    // First click: filter set to only 'department'
    expect(state.nodeTypeFilter).toEqual(['department'])
  })

  it('should show clear all button when filters active', async () => {
    useVisualWorkspaceStore.setState({ nodeTypeFilter: ['department'] })
    render(<FilterPanel />)
    expect(screen.getByTestId('clear-filters')).toBeInTheDocument()
  })

  it('should clear all filters on click', async () => {
    useVisualWorkspaceStore.setState({ nodeTypeFilter: ['department'], statusFilter: ['error'] })
    render(<FilterPanel />)
    await userEvent.click(screen.getByTestId('clear-filters'))
    const state = useVisualWorkspaceStore.getState()
    expect(state.nodeTypeFilter).toBeNull()
    expect(state.statusFilter).toBeNull()
  })

  it('should toggle a status filter', async () => {
    render(<FilterPanel />)
    await userEvent.click(screen.getByTestId('filter-status-normal'))
    expect(useVisualWorkspaceStore.getState().statusFilter).toEqual(['normal'])
  })

  it('should uncheck node type when already filtered', async () => {
    useVisualWorkspaceStore.setState({ nodeTypeFilter: ['department', 'role'] })
    render(<FilterPanel />)
    await userEvent.click(screen.getByTestId('filter-type-department'))
    expect(useVisualWorkspaceStore.getState().nodeTypeFilter).toEqual(['role'])
  })

  it('should reset to null when unchecking last filtered type', async () => {
    useVisualWorkspaceStore.setState({ nodeTypeFilter: ['department'] })
    render(<FilterPanel />)
    await userEvent.click(screen.getByTestId('filter-type-department'))
    expect(useVisualWorkspaceStore.getState().nodeTypeFilter).toBeNull()
  })
})
