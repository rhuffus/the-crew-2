import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { usePolicies, useCreatePolicy, useUpdatePolicy, useDeletePolicy } from '@/hooks/use-policies'
import { policiesApi } from '@/api/policies'
import type { PolicyDto } from '@the-crew/shared-types'

vi.mock('@/api/policies', () => ({
  policiesApi: {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}))

const mockPolicy: PolicyDto = {
  id: 'pol1',
  projectId: 'p1',
  name: 'No orphan roles',
  description: 'Every role must belong to a department',
  scope: 'global',
  departmentId: null,
  type: 'constraint',
  condition: 'All roles must have a department',
  enforcement: 'mandatory',
  status: 'active',
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

describe('usePolicies', () => {
  it('should fetch policies list', async () => {
    vi.mocked(policiesApi.list).mockResolvedValue([mockPolicy])
    const { result } = renderHook(() => usePolicies('p1'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([mockPolicy])
    expect(policiesApi.list).toHaveBeenCalledWith('p1')
  })
})

describe('useCreatePolicy', () => {
  it('should create a policy and invalidate cache', async () => {
    vi.mocked(policiesApi.create).mockResolvedValue(mockPolicy)
    const { result } = renderHook(() => useCreatePolicy('p1'), { wrapper: createWrapper() })
    result.current.mutate({
      name: 'No orphan roles',
      description: 'Every role must belong to a department',
      scope: 'global',
      type: 'constraint',
      condition: 'All roles must have a department',
      enforcement: 'mandatory',
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(policiesApi.create).toHaveBeenCalledWith('p1', expect.objectContaining({ name: 'No orphan roles' }))
  })
})

describe('useUpdatePolicy', () => {
  it('should update a policy and invalidate cache', async () => {
    vi.mocked(policiesApi.update).mockResolvedValue({ ...mockPolicy, name: 'Updated' })
    const { result } = renderHook(() => useUpdatePolicy('p1'), { wrapper: createWrapper() })
    result.current.mutate({ id: 'pol1', dto: { name: 'Updated' } })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(policiesApi.update).toHaveBeenCalledWith('p1', 'pol1', { name: 'Updated' })
  })
})

describe('useDeletePolicy', () => {
  it('should delete a policy and invalidate cache', async () => {
    vi.mocked(policiesApi.remove).mockResolvedValue(undefined)
    const { result } = renderHook(() => useDeletePolicy('p1'), { wrapper: createWrapper() })
    result.current.mutate('pol1')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(policiesApi.remove).toHaveBeenCalledWith('p1', 'pol1')
  })
})
