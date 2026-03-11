import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useVisualGraph } from '@/hooks/use-visual-graph'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

describe('useVisualGraph', () => {
  it('should fetch visual graph with project id', async () => {
    const mockGraph = {
      projectId: 'p1',
      zoomLevel: 'L1',
      nodes: [],
      edges: [],
      activeLayers: ['organization'],
      breadcrumb: [],
      scope: { level: 'L1', entityId: null, entityType: null },
    }
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockGraph),
    })

    const { result } = renderHook(() => useVisualGraph('p1'), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockGraph)
  })

  it('should pass zoom level and entity id in query', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    })

    renderHook(() => useVisualGraph('p1', 'department', 'dept-1'), { wrapper })

    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/projects/p1/visual-graph?scope=department&entityId=dept-1',
      ),
    )
  })

  it('should handle error', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal',
      json: () => Promise.resolve({ code: 'ERR', message: 'Server error' }),
    })

    const { result } = renderHook(() => useVisualGraph('p1'), { wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
