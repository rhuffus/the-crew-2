import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAgentArchetypes, useCreateAgentArchetype, useUpdateAgentArchetype, useDeleteAgentArchetype } from '@/hooks/use-agent-archetypes'
import { agentArchetypesApi } from '@/api/agent-archetypes'
import type { AgentArchetypeDto } from '@the-crew/shared-types'

vi.mock('@/api/agent-archetypes', () => ({
  agentArchetypesApi: {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}))

const mockArchetype: AgentArchetypeDto = {
  id: 'a1',
  projectId: 'p1',
  name: 'Deployment Bot',
  description: 'Handles deployments',
  roleId: 'r1',
  departmentId: 'd1',
  skillIds: [],
  constraints: { maxConcurrency: 5, allowedDepartmentIds: [] },
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

describe('useAgentArchetypes', () => {
  it('should fetch archetypes list', async () => {
    vi.mocked(agentArchetypesApi.list).mockResolvedValue([mockArchetype])
    const { result } = renderHook(() => useAgentArchetypes('p1'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([mockArchetype])
    expect(agentArchetypesApi.list).toHaveBeenCalledWith('p1')
  })
})

describe('useCreateAgentArchetype', () => {
  it('should create an archetype and invalidate cache', async () => {
    vi.mocked(agentArchetypesApi.create).mockResolvedValue(mockArchetype)
    const { result } = renderHook(() => useCreateAgentArchetype('p1'), { wrapper: createWrapper() })
    result.current.mutate({
      name: 'Deployment Bot',
      description: 'Handles deployments',
      roleId: 'r1',
      departmentId: 'd1',
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(agentArchetypesApi.create).toHaveBeenCalledWith('p1', expect.objectContaining({ name: 'Deployment Bot' }))
  })
})

describe('useUpdateAgentArchetype', () => {
  it('should update an archetype and invalidate cache', async () => {
    vi.mocked(agentArchetypesApi.update).mockResolvedValue({ ...mockArchetype, name: 'Updated' })
    const { result } = renderHook(() => useUpdateAgentArchetype('p1'), { wrapper: createWrapper() })
    result.current.mutate({ id: 'a1', dto: { name: 'Updated' } })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(agentArchetypesApi.update).toHaveBeenCalledWith('p1', 'a1', { name: 'Updated' })
  })
})

describe('useDeleteAgentArchetype', () => {
  it('should delete an archetype and invalidate cache', async () => {
    vi.mocked(agentArchetypesApi.remove).mockResolvedValue(undefined)
    const { result } = renderHook(() => useDeleteAgentArchetype('p1'), { wrapper: createWrapper() })
    result.current.mutate('a1')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(agentArchetypesApi.remove).toHaveBeenCalledWith('p1', 'a1')
  })
})
