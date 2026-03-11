import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement, type ReactNode } from 'react'
import { useEntityMutation } from '@/hooks/use-entity-mutation'
import { useRelationshipMutation } from '@/hooks/use-relationship-mutation'
import { apiClient } from '@/lib/api-client'

vi.mock('@/lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useEntityMutation error handling', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls onError callback when updateEntity fails', async () => {
    const onError = vi.fn()
    vi.mocked(apiClient.patch).mockRejectedValue(new Error('Update failed'))

    const { result } = renderHook(
      () => useEntityMutation('p1', { onError }),
      { wrapper: createWrapper() },
    )

    await act(async () => {
      await result.current.updateEntity('e1', 'department', { name: 'x' })
    })

    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: 'Update failed' }))
    expect(result.current.lastError).toBe('Update failed')
  })

  it('calls onError callback when createEntity fails', async () => {
    const onError = vi.fn()
    vi.mocked(apiClient.post).mockRejectedValue(new Error('Create failed'))

    const { result } = renderHook(
      () => useEntityMutation('p1', { onError }),
      { wrapper: createWrapper() },
    )

    let createResult: { id: string } | undefined
    await act(async () => {
      createResult = await result.current.createEntity('department', { name: 'x' })
    })

    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: 'Create failed' }))
    expect(createResult).toBeUndefined()
    expect(result.current.lastError).toBe('Create failed')
  })

  it('calls onError callback when deleteEntity fails', async () => {
    const onError = vi.fn()
    vi.mocked(apiClient.delete).mockRejectedValue(new Error('Delete failed'))

    const { result } = renderHook(
      () => useEntityMutation('p1', { onError }),
      { wrapper: createWrapper() },
    )

    await act(async () => {
      await result.current.deleteEntity('department', 'e1')
    })

    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: 'Delete failed' }))
    expect(result.current.lastError).toBe('Delete failed')
  })

  it('clears lastError on next successful operation', async () => {
    const onError = vi.fn()
    vi.mocked(apiClient.patch).mockRejectedValueOnce(new Error('Fail'))
    vi.mocked(apiClient.patch).mockResolvedValueOnce({})

    const { result } = renderHook(
      () => useEntityMutation('p1', { onError }),
      { wrapper: createWrapper() },
    )

    await act(async () => {
      await result.current.updateEntity('e1', 'department', { name: 'x' })
    })
    expect(result.current.lastError).toBe('Fail')

    await act(async () => {
      await result.current.updateEntity('e1', 'department', { name: 'y' })
    })
    await waitFor(() => {
      expect(result.current.lastError).toBeNull()
    })
  })
})

describe('useRelationshipMutation error handling', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls onError callback when createEdge fails', async () => {
    const onError = vi.fn()
    vi.mocked(apiClient.patch).mockRejectedValue(new Error('Edge create failed'))

    const { result } = renderHook(
      () => useRelationshipMutation('p1', { onError }),
      { wrapper: createWrapper() },
    )

    const source = { id: 'n1', nodeType: 'department' as const, entityId: 'd1', label: 'D1', sublabel: null, position: null, collapsed: false, status: 'normal' as const, layerIds: ['organization' as const], parentId: null }
    const target = { id: 'n2', nodeType: 'department' as const, entityId: 'd2', label: 'D2', sublabel: null, position: null, collapsed: false, status: 'normal' as const, layerIds: ['organization' as const], parentId: null }

    await act(async () => {
      await result.current.createEdge('reports_to', source, target)
    })

    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: 'Edge create failed' }))
    expect(result.current.lastError).toBe('Edge create failed')
  })

  it('calls onError callback when deleteEdge fails', async () => {
    const onError = vi.fn()
    vi.mocked(apiClient.patch).mockRejectedValue(new Error('Edge delete failed'))

    const { result } = renderHook(
      () => useRelationshipMutation('p1', { onError }),
      { wrapper: createWrapper() },
    )

    const source = { id: 'n1', nodeType: 'department' as const, entityId: 'd1', label: 'D1', sublabel: null, position: null, collapsed: false, status: 'normal' as const, layerIds: ['organization' as const], parentId: null }
    const target = { id: 'n2', nodeType: 'department' as const, entityId: 'd2', label: 'D2', sublabel: null, position: null, collapsed: false, status: 'normal' as const, layerIds: ['organization' as const], parentId: null }

    await act(async () => {
      await result.current.deleteEdge('reports_to', source, target)
    })

    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: 'Edge delete failed' }))
    expect(result.current.lastError).toBe('Edge delete failed')
  })
})
