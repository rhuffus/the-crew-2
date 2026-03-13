import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEntityDetail } from '@/hooks/use-entity-detail'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

describe('useEntityDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should not fetch when projectId is null', () => {
    renderHook(() => useEntityDetail(null, 'department', 'abc'), { wrapper })
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('should not fetch when nodeType is null', () => {
    renderHook(() => useEntityDetail('p1', null, 'abc'), { wrapper })
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('should not fetch when entityId is null', () => {
    renderHook(() => useEntityDetail('p1', 'department', null), { wrapper })
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('should not fetch for non-editable node types', () => {
    renderHook(() => useEntityDetail('p1', 'workflow-stage', 'abc'), { wrapper })
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('should fetch department entity', async () => {
    const data = { id: 'abc', name: 'Marketing', description: 'Dept', mandate: 'Growth', parentId: null }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(data),
    })

    const { result } = renderHook(() => useEntityDetail('p1', 'department', 'abc'), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(data)
    expect(mockFetch).toHaveBeenCalledWith('/api/projects/p1/departments/abc')
  })

  it('should fetch role entity', async () => {
    const data = { id: 'r1', name: 'Dev', departmentId: 'd1' }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(data),
    })

    const { result } = renderHook(() => useEntityDetail('p1', 'role', 'r1'), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockFetch).toHaveBeenCalledWith('/api/projects/p1/roles/r1')
  })

  it('should handle fetch error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: () => Promise.resolve({ code: 'NOT_FOUND', message: 'Not Found' }),
    })

    const { result } = renderHook(() => useEntityDetail('p1', 'department', 'missing'), { wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
