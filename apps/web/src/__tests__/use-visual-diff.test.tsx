import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useVisualDiff } from '@/hooks/use-visual-diff'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

describe('useVisualDiff', () => {
  it('should fetch visual diff when both release ids are provided', async () => {
    const mockDiff = {
      projectId: 'p1',
      baseReleaseId: 'rel-1',
      compareReleaseId: 'rel-2',
      nodes: [],
      edges: [],
      activeLayers: ['organization'],
      breadcrumb: [],
      scope: { level: 'L1', entityId: null, entityType: null },
      zoomLevel: 'L1',
      summary: {
        nodesAdded: 0, nodesRemoved: 0, nodesModified: 0, nodesUnchanged: 0,
        edgesAdded: 0, edgesRemoved: 0, edgesModified: 0, edgesUnchanged: 0,
      },
    }
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockDiff),
    })

    const { result } = renderHook(
      () => useVisualDiff('p1', 'rel-1', 'rel-2'),
      { wrapper },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockDiff)
  })

  it('should not fetch when baseReleaseId is null', async () => {
    mockFetch.mockReset()

    const { result } = renderHook(
      () => useVisualDiff('p1', null, 'rel-2'),
      { wrapper },
    )

    expect(result.current.fetchStatus).toBe('idle')
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('should not fetch when compareReleaseId is null', async () => {
    mockFetch.mockReset()

    const { result } = renderHook(
      () => useVisualDiff('p1', 'rel-1', null),
      { wrapper },
    )

    expect(result.current.fetchStatus).toBe('idle')
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('should handle error', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: () => Promise.resolve({ code: 'BAD_REQUEST', message: 'Invalid' }),
    })

    const { result } = renderHook(
      () => useVisualDiff('p1', 'rel-1', 'rel-2'),
      { wrapper },
    )

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
