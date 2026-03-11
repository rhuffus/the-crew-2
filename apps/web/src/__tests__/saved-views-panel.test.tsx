import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SavedViewsPanel } from '@/components/visual-shell/explorer/saved-views-panel'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'
import { savedViewsApi } from '@/api/saved-views'
import type { SavedViewDto } from '@the-crew/shared-types'

vi.mock('@/api/saved-views', () => ({
  savedViewsApi: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}))

const mockView: SavedViewDto = {
  id: 'sv1',
  projectId: 'test-project',
  name: 'Capabilities Focus',
  state: {
    activeLayers: ['organization', 'capabilities'],
    nodeTypeFilter: ['capability'],
    statusFilter: null,
  },
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
}

function renderPanel() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <SavedViewsPanel />
    </QueryClientProvider>,
  )
}

describe('SavedViewsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useVisualWorkspaceStore.setState({
      activeLayers: ['organization'],
      nodeTypeFilter: null,
      statusFilter: null,
      projectId: 'test-project',
    })
  })

  it('should render with no saved views', async () => {
    vi.mocked(savedViewsApi.list).mockResolvedValue([])
    renderPanel()
    await waitFor(() => {
      expect(screen.getByText('No saved views yet')).toBeInTheDocument()
    })
  })

  it('should show loading state', () => {
    vi.mocked(savedViewsApi.list).mockReturnValue(new Promise(() => {}))
    renderPanel()
    expect(screen.getByTestId('saved-views-loading')).toBeInTheDocument()
  })

  it('should display saved views from API', async () => {
    vi.mocked(savedViewsApi.list).mockResolvedValue([mockView])
    renderPanel()
    await waitFor(() => {
      expect(screen.getByTestId('load-view-Capabilities Focus')).toBeInTheDocument()
    })
  })

  it('should save a new view via API', async () => {
    vi.mocked(savedViewsApi.list).mockResolvedValue([])
    vi.mocked(savedViewsApi.create).mockResolvedValue({
      ...mockView,
      id: 'sv2',
      name: 'My View',
      state: { activeLayers: ['organization'], nodeTypeFilter: null, statusFilter: null },
    })
    renderPanel()
    await waitFor(() => {
      expect(screen.getByText('No saved views yet')).toBeInTheDocument()
    })
    const input = screen.getByTestId('saved-view-name-input')
    await userEvent.type(input, 'My View')
    await userEvent.click(screen.getByTestId('save-view-button'))
    await waitFor(() => {
      expect(savedViewsApi.create).toHaveBeenCalledWith('test-project', {
        name: 'My View',
        state: { activeLayers: ['organization'], nodeTypeFilter: null, statusFilter: null },
      })
    })
  })

  it('should not save with empty name', async () => {
    vi.mocked(savedViewsApi.list).mockResolvedValue([])
    renderPanel()
    await waitFor(() => {
      expect(screen.getByText('No saved views yet')).toBeInTheDocument()
    })
    await userEvent.click(screen.getByTestId('save-view-button'))
    expect(savedViewsApi.create).not.toHaveBeenCalled()
  })

  it('should load a saved view', async () => {
    vi.mocked(savedViewsApi.list).mockResolvedValue([mockView])
    renderPanel()
    await waitFor(() => {
      expect(screen.getByTestId('load-view-Capabilities Focus')).toBeInTheDocument()
    })
    await userEvent.click(screen.getByTestId('load-view-Capabilities Focus'))
    const state = useVisualWorkspaceStore.getState()
    expect(state.activeLayers).toEqual(['organization', 'capabilities'])
    expect(state.nodeTypeFilter).toEqual(['capability'])
  })

  it('should delete a saved view via API', async () => {
    vi.mocked(savedViewsApi.list).mockResolvedValue([mockView])
    vi.mocked(savedViewsApi.remove).mockResolvedValue(undefined)
    renderPanel()
    await waitFor(() => {
      expect(screen.getByTestId('load-view-Capabilities Focus')).toBeInTheDocument()
    })
    await userEvent.click(screen.getByTestId('delete-view-Capabilities Focus'))
    await waitFor(() => {
      expect(savedViewsApi.remove).toHaveBeenCalledWith('test-project', 'sv1')
    })
  })

  it('should save view via Enter key', async () => {
    vi.mocked(savedViewsApi.list).mockResolvedValue([])
    vi.mocked(savedViewsApi.create).mockResolvedValue({
      ...mockView,
      name: 'Quick View',
    })
    renderPanel()
    await waitFor(() => {
      expect(screen.getByText('No saved views yet')).toBeInTheDocument()
    })
    const input = screen.getByTestId('saved-view-name-input')
    await userEvent.type(input, 'Quick View{Enter}')
    await waitFor(() => {
      expect(savedViewsApi.create).toHaveBeenCalled()
    })
  })

  it('should clear input after saving', async () => {
    vi.mocked(savedViewsApi.list).mockResolvedValue([])
    vi.mocked(savedViewsApi.create).mockResolvedValue(mockView)
    renderPanel()
    await waitFor(() => {
      expect(screen.getByText('No saved views yet')).toBeInTheDocument()
    })
    const input = screen.getByTestId('saved-view-name-input')
    await userEvent.type(input, 'Test View')
    await userEvent.click(screen.getByTestId('save-view-button'))
    expect(input).toHaveValue('')
  })
})
