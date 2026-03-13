import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Inspector } from '@/components/visual-shell/inspector/inspector'
import { Explorer } from '@/components/visual-shell/explorer/explorer'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'
import { allMockNodes, allMockEdges } from './fixtures/visual-graph'

vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('no backend')))

vi.mock('@tanstack/react-router', () => ({
  useParams: () => ({ projectSlug: 'test-project' }),
  useNavigate: () => vi.fn(),
}))

function renderWithQuery(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>)
}

describe('Inspector tab semantics', () => {
  beforeEach(() => {
    useVisualWorkspaceStore.setState({
      inspectorCollapsed: false,
      selectedNodeIds: ['dept:abc'],
      selectedEdgeIds: [],
      projectId: 'test-project',
      isDiffMode: false,
      validationIssues: [],
      graphNodes: allMockNodes,
      graphEdges: allMockEdges,
    })
  })

  it('should have role="tablist" on tab container', () => {
    renderWithQuery(<Inspector graphNodes={allMockNodes} graphEdges={allMockEdges} />)
    const tablist = screen.getByRole('tablist')
    expect(tablist).toBeTruthy()
    expect(tablist.getAttribute('aria-label')).toBe('Inspector tabs')
  })

  it('should have role="tab" on each tab button', () => {
    renderWithQuery(<Inspector graphNodes={allMockNodes} graphEdges={allMockEdges} />)
    const tabs = screen.getAllByRole('tab')
    expect(tabs.length).toBeGreaterThan(0)
  })

  it('should have aria-selected="true" on the active tab', () => {
    renderWithQuery(<Inspector graphNodes={allMockNodes} graphEdges={allMockEdges} />)
    const editTab = screen.getByTestId('tab-edit')
    expect(editTab.getAttribute('aria-selected')).toBe('true')
  })

  it('should have aria-selected="false" on inactive tabs', () => {
    renderWithQuery(<Inspector graphNodes={allMockNodes} graphEdges={allMockEdges} />)
    const propertiesTab = screen.getByTestId('tab-properties')
    expect(propertiesTab.getAttribute('aria-selected')).toBe('false')
  })

  it('should have aria-controls and matching tabpanel id', () => {
    renderWithQuery(<Inspector graphNodes={allMockNodes} graphEdges={allMockEdges} />)
    const editTab = screen.getByTestId('tab-edit')
    const controlsId = editTab.getAttribute('aria-controls')
    expect(controlsId).toBe('inspector-tabpanel-edit')
    const panel = screen.getByRole('tabpanel')
    expect(panel.id).toBe(controlsId)
  })

  it('should have tabpanel with aria-labelledby pointing to active tab', () => {
    renderWithQuery(<Inspector graphNodes={allMockNodes} graphEdges={allMockEdges} />)
    const panel = screen.getByRole('tabpanel')
    expect(panel.getAttribute('aria-labelledby')).toBe('inspector-tab-edit')
  })

  it('should update aria-selected when switching tabs', async () => {
    renderWithQuery(<Inspector graphNodes={allMockNodes} graphEdges={allMockEdges} />)
    const relationsTab = screen.getByTestId('tab-relations')
    await userEvent.click(relationsTab)
    expect(relationsTab.getAttribute('aria-selected')).toBe('true')
    expect(screen.getByTestId('tab-edit').getAttribute('aria-selected')).toBe('false')
  })
})

describe('Explorer tab semantics', () => {
  beforeEach(() => {
    useVisualWorkspaceStore.setState({
      explorerCollapsed: false,
      validationIssues: [],
      projectId: null,
      graphNodes: [],
      nodeTypeFilter: null,
      statusFilter: null,
    })
  })

  it('should have role="tablist" on tab container', () => {
    renderWithQuery(<Explorer />)
    const tablist = screen.getByRole('tablist')
    expect(tablist).toBeTruthy()
    expect(tablist.getAttribute('aria-label')).toBe('Explorer tabs')
  })

  it('should have role="tab" on each tab button', () => {
    renderWithQuery(<Explorer />)
    const tabs = screen.getAllByRole('tab')
    expect(tabs.length).toBe(9) // tree, overlays, filters, views, validation, chat, operations, timeline, proposals
  })

  it('should have aria-selected="true" on the active tab (tree by default)', () => {
    renderWithQuery(<Explorer />)
    const treeTab = screen.getByRole('tab', { name: 'Entity Tree' })
    expect(treeTab.getAttribute('aria-selected')).toBe('true')
  })

  it('should have aria-selected="false" on inactive tabs', () => {
    renderWithQuery(<Explorer />)
    const overlaysTab = screen.getByRole('tab', { name: 'Overlays' })
    expect(overlaysTab.getAttribute('aria-selected')).toBe('false')
  })

  it('should have role="tabpanel" on content area', () => {
    renderWithQuery(<Explorer />)
    const panel = screen.getByRole('tabpanel')
    expect(panel).toBeTruthy()
  })

  it('should have tabpanel aria-labelledby linked to active tab id', () => {
    renderWithQuery(<Explorer />)
    const panel = screen.getByRole('tabpanel')
    const labelledBy = panel.getAttribute('aria-labelledby')
    expect(labelledBy).toBe('explorer-tab-tree')
  })

  it('should update aria-selected and tabpanel when switching', async () => {
    renderWithQuery(<Explorer />)
    const overlaysTab = screen.getByRole('tab', { name: 'Overlays' })
    await userEvent.click(overlaysTab)
    expect(overlaysTab.getAttribute('aria-selected')).toBe('true')
    const panel = screen.getByRole('tabpanel')
    expect(panel.getAttribute('aria-labelledby')).toBe('explorer-tab-overlays')
  })
})
