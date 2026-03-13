import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Explorer } from '@/components/visual-shell/explorer/explorer'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'

vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('no backend')))

vi.mock('@tanstack/react-router', () => ({
  useParams: () => ({ projectSlug: 'test-project' }),
}))

function renderExplorer() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <Explorer />
    </QueryClientProvider>,
  )
}

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
    renderExplorer()
    expect(screen.getByTestId('explorer')).toBeInTheDocument()
    expect(screen.getByText('Explorer')).toBeInTheDocument()
  })

  it('should render collapsed explorer when collapsed', () => {
    useVisualWorkspaceStore.setState({ explorerCollapsed: true })
    renderExplorer()
    expect(screen.getByTestId('explorer-collapsed')).toBeInTheDocument()
  })

  it('should show entity tree tab by default', () => {
    renderExplorer()
    expect(screen.getByTestId('entity-tree')).toBeInTheDocument()
  })

  it('should switch to overlays tab', async () => {
    renderExplorer()
    const overlaysBtn = screen.getByRole('tab', { name: 'Overlays' })
    await userEvent.click(overlaysBtn)
    expect(screen.getByTestId('overlays-panel')).toBeInTheDocument()
  })

  it('should switch to validation tab', async () => {
    renderExplorer()
    const validBtn = screen.getByRole('tab', { name: 'Validation' })
    await userEvent.click(validBtn)
    expect(screen.getByTestId('validation-summary')).toBeInTheDocument()
  })

  it('should toggle collapse when clicking collapse button', async () => {
    renderExplorer()
    const collapseBtn = screen.getByRole('button', { name: 'Collapse explorer' })
    await userEvent.click(collapseBtn)
    expect(useVisualWorkspaceStore.getState().explorerCollapsed).toBe(true)
  })

  it('should switch to filters tab', async () => {
    renderExplorer()
    const filtersBtn = screen.getByRole('tab', { name: 'Filters' })
    await userEvent.click(filtersBtn)
    expect(screen.getByTestId('filter-panel')).toBeInTheDocument()
  })

  it('should switch to saved views tab', async () => {
    renderExplorer()
    const viewsBtn = screen.getByRole('tab', { name: 'Saved Views' })
    await userEvent.click(viewsBtn)
    expect(screen.getByTestId('saved-views-panel')).toBeInTheDocument()
  })
})
