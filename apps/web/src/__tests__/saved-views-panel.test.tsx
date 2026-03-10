import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SavedViewsPanel } from '@/components/visual-shell/explorer/saved-views-panel'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'

vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('no backend')))

// In-memory localStorage stub
const storageMap = new Map<string, string>()
vi.stubGlobal('localStorage', {
  getItem: (key: string) => storageMap.get(key) ?? null,
  setItem: (key: string, value: string) => storageMap.set(key, value),
  removeItem: (key: string) => storageMap.delete(key),
  clear: () => storageMap.clear(),
  get length() { return storageMap.size },
  key: (i: number) => Array.from(storageMap.keys())[i] ?? null,
})

describe('SavedViewsPanel', () => {
  beforeEach(() => {
    storageMap.clear()
    useVisualWorkspaceStore.setState({
      activeLayers: ['organization'],
      nodeTypeFilter: null,
      statusFilter: null,
      projectId: 'test-project',
    })
  })

  it('should render with no saved views', () => {
    render(<SavedViewsPanel />)
    expect(screen.getByText('No saved views yet')).toBeInTheDocument()
  })

  it('should save a new view', async () => {
    render(<SavedViewsPanel />)
    const input = screen.getByTestId('saved-view-name-input')
    await userEvent.type(input, 'My View')
    await userEvent.click(screen.getByTestId('save-view-button'))
    expect(screen.getByTestId('load-view-My View')).toBeInTheDocument()
  })

  it('should not save with empty name', async () => {
    render(<SavedViewsPanel />)
    await userEvent.click(screen.getByTestId('save-view-button'))
    expect(screen.getByText('No saved views yet')).toBeInTheDocument()
  })

  it('should load a saved view', async () => {
    // Pre-save a view
    storageMap.set(
      'the-crew:view:saved:test-project',
      JSON.stringify([
        {
          name: 'Capabilities Focus',
          state: {
            activeLayers: ['organization', 'capabilities'],
            nodeTypeFilter: ['capability'],
            statusFilter: null,
          },
        },
      ]),
    )
    render(<SavedViewsPanel />)
    await userEvent.click(screen.getByTestId('load-view-Capabilities Focus'))
    const state = useVisualWorkspaceStore.getState()
    expect(state.activeLayers).toEqual(['organization', 'capabilities'])
    expect(state.nodeTypeFilter).toEqual(['capability'])
  })

  it('should delete a saved view', async () => {
    storageMap.set(
      'the-crew:view:saved:test-project',
      JSON.stringify([
        { name: 'View A', state: { activeLayers: ['organization'], nodeTypeFilter: null, statusFilter: null } },
      ]),
    )
    render(<SavedViewsPanel />)
    expect(screen.getByTestId('load-view-View A')).toBeInTheDocument()
    await userEvent.click(screen.getByTestId('delete-view-View A'))
    expect(screen.getByText('No saved views yet')).toBeInTheDocument()
  })

  it('should save view via Enter key', async () => {
    render(<SavedViewsPanel />)
    const input = screen.getByTestId('saved-view-name-input')
    await userEvent.type(input, 'Quick View{Enter}')
    expect(screen.getByTestId('load-view-Quick View')).toBeInTheDocument()
  })

  it('should clear input after saving', async () => {
    render(<SavedViewsPanel />)
    const input = screen.getByTestId('saved-view-name-input')
    await userEvent.type(input, 'Test View')
    await userEvent.click(screen.getByTestId('save-view-button'))
    expect(input).toHaveValue('')
  })
})
