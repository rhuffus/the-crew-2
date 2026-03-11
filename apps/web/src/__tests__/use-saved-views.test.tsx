import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useSavedViews, useCreateSavedView, useUpdateSavedView, useDeleteSavedView } from '@/hooks/use-saved-views'
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
  projectId: 'p1',
  name: 'My View',
  state: {
    activeLayers: ['organization'],
    nodeTypeFilter: null,
    statusFilter: null,
  },
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-03-01T00:00:00Z',
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useSavedViews', () => {
  it('should fetch saved views list', async () => {
    vi.mocked(savedViewsApi.list).mockResolvedValue([mockView])
    const { result } = renderHook(() => useSavedViews('p1'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([mockView])
    expect(savedViewsApi.list).toHaveBeenCalledWith('p1')
  })

  it('should not fetch when projectId is empty', async () => {
    const { result } = renderHook(() => useSavedViews(''), { wrapper: createWrapper() })
    expect(result.current.fetchStatus).toBe('idle')
    expect(savedViewsApi.list).not.toHaveBeenCalled()
  })
})

describe('useCreateSavedView', () => {
  it('should create a saved view and invalidate cache', async () => {
    vi.mocked(savedViewsApi.create).mockResolvedValue(mockView)
    const { result } = renderHook(() => useCreateSavedView('p1'), { wrapper: createWrapper() })
    result.current.mutate({
      name: 'My View',
      state: { activeLayers: ['organization'], nodeTypeFilter: null, statusFilter: null },
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(savedViewsApi.create).toHaveBeenCalledWith('p1', expect.objectContaining({ name: 'My View' }))
  })
})

describe('useUpdateSavedView', () => {
  it('should update a saved view and invalidate cache', async () => {
    vi.mocked(savedViewsApi.update).mockResolvedValue({ ...mockView, name: 'Updated' })
    const { result } = renderHook(() => useUpdateSavedView('p1'), { wrapper: createWrapper() })
    result.current.mutate({ id: 'sv1', dto: { name: 'Updated' } })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(savedViewsApi.update).toHaveBeenCalledWith('p1', 'sv1', { name: 'Updated' })
  })
})

describe('useDeleteSavedView', () => {
  it('should delete a saved view and invalidate cache', async () => {
    vi.mocked(savedViewsApi.remove).mockResolvedValue(undefined)
    const { result } = renderHook(() => useDeleteSavedView('p1'), { wrapper: createWrapper() })
    result.current.mutate('sv1')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(savedViewsApi.remove).toHaveBeenCalledWith('p1', 'sv1')
  })
})
