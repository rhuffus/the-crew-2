import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useRoles, useCreateRole, useUpdateRole, useDeleteRole } from '@/hooks/use-roles'
import { rolesApi } from '@/api/roles'
import type { RoleDto } from '@the-crew/shared-types'

vi.mock('@/api/roles', () => ({
  rolesApi: {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}))

const mockRole: RoleDto = {
  id: 'r1',
  projectId: 'p1',
  name: 'Product Manager',
  description: 'Manages product lifecycle',
  departmentId: 'd1',
  capabilityIds: ['c1'],
  accountability: 'Product roadmap',
  authority: 'Feature approval',
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

describe('useRoles', () => {
  it('should fetch roles list', async () => {
    vi.mocked(rolesApi.list).mockResolvedValue([mockRole])
    const { result } = renderHook(() => useRoles('p1'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([mockRole])
    expect(rolesApi.list).toHaveBeenCalledWith('p1')
  })
})

describe('useCreateRole', () => {
  it('should create a role and invalidate cache', async () => {
    vi.mocked(rolesApi.create).mockResolvedValue(mockRole)
    const { result } = renderHook(() => useCreateRole('p1'), { wrapper: createWrapper() })
    result.current.mutate({
      name: 'Product Manager',
      description: 'Manages product lifecycle',
      departmentId: 'd1',
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(rolesApi.create).toHaveBeenCalledWith('p1', expect.objectContaining({ name: 'Product Manager' }))
  })
})

describe('useUpdateRole', () => {
  it('should update a role and invalidate cache', async () => {
    vi.mocked(rolesApi.update).mockResolvedValue({ ...mockRole, name: 'Updated' })
    const { result } = renderHook(() => useUpdateRole('p1'), { wrapper: createWrapper() })
    result.current.mutate({ id: 'r1', dto: { name: 'Updated' } })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(rolesApi.update).toHaveBeenCalledWith('p1', 'r1', { name: 'Updated' })
  })
})

describe('useDeleteRole', () => {
  it('should delete a role and invalidate cache', async () => {
    vi.mocked(rolesApi.remove).mockResolvedValue(undefined)
    const { result } = renderHook(() => useDeleteRole('p1'), { wrapper: createWrapper() })
    result.current.mutate('r1')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(rolesApi.remove).toHaveBeenCalledWith('p1', 'r1')
  })
})
