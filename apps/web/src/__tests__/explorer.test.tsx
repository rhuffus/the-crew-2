import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Explorer } from '@/components/visual-shell/explorer/explorer'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'

vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('no backend')))

vi.mock('@tanstack/react-router', () => ({
  useParams: () => ({ projectId: 'test-project' }),
}))

describe('Explorer', () => {
  beforeEach(() => {
    useVisualWorkspaceStore.setState({
      explorerCollapsed: false,
      activeLayers: ['organization'],
      validationIssues: [],
      projectId: null,
      graphNodes: [],
      nodeTypeFilter: null,
      statusFilter: null,
    })
  })

  it('should render expanded explorer', () => {
    render(<Explorer />)
    expect(screen.getByTestId('explorer')).toBeInTheDocument()
    expect(screen.getByText('Explorer')).toBeInTheDocument()
  })

  it('should render collapsed explorer when collapsed', () => {
    useVisualWorkspaceStore.setState({ explorerCollapsed: true })
    render(<Explorer />)
    expect(screen.getByTestId('explorer-collapsed')).toBeInTheDocument()
  })

  it('should show entity tree tab by default', () => {
    render(<Explorer />)
    expect(screen.getByTestId('entity-tree')).toBeInTheDocument()
  })

  it('should switch to layers tab', async () => {
    render(<Explorer />)
    const layersBtn = screen.getByRole('button', { name: 'Layers' })
    await userEvent.click(layersBtn)
    expect(screen.getByTestId('layers-panel')).toBeInTheDocument()
  })

  it('should switch to validation tab', async () => {
    render(<Explorer />)
    const validBtn = screen.getByRole('button', { name: 'Validation' })
    await userEvent.click(validBtn)
    expect(screen.getByTestId('validation-summary')).toBeInTheDocument()
  })

  it('should toggle collapse when clicking collapse button', async () => {
    render(<Explorer />)
    const collapseBtn = screen.getByRole('button', { name: 'Collapse explorer' })
    await userEvent.click(collapseBtn)
    expect(useVisualWorkspaceStore.getState().explorerCollapsed).toBe(true)
  })

  it('should switch to filters tab', async () => {
    render(<Explorer />)
    const filtersBtn = screen.getByRole('button', { name: 'Filters' })
    await userEvent.click(filtersBtn)
    expect(screen.getByTestId('filter-panel')).toBeInTheDocument()
  })

  it('should switch to saved views tab', async () => {
    render(<Explorer />)
    const viewsBtn = screen.getByRole('button', { name: 'Saved Views' })
    await userEvent.click(viewsBtn)
    expect(screen.getByTestId('saved-views-panel')).toBeInTheDocument()
  })
})
