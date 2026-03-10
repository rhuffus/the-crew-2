import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAgentAssignments, useCreateAgentAssignment, useUpdateAgentAssignment, useDeleteAgentAssignment } from '@/hooks/use-agent-assignments'
import { agentAssignmentsApi } from '@/api/agent-assignments'
import type { AgentAssignmentDto } from '@the-crew/shared-types'

vi.mock('@/api/agent-assignments', () => ({
  agentAssignmentsApi: {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}))

const mockAssignment: AgentAssignmentDto = {
  id: 'as1',
  projectId: 'p1',
  archetypeId: 'a1',
  name: 'Primary Deployer',
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

describe('useAgentAssignments', () => {
  it('should fetch assignments list', async () => {
    vi.mocked(agentAssignmentsApi.list).mockResolvedValue([mockAssignment])
    const { result } = renderHook(() => useAgentAssignments('p1'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([mockAssignment])
    expect(agentAssignmentsApi.list).toHaveBeenCalledWith('p1')
  })
})

describe('useCreateAgentAssignment', () => {
  it('should create an assignment and invalidate cache', async () => {
    vi.mocked(agentAssignmentsApi.create).mockResolvedValue(mockAssignment)
    const { result } = renderHook(() => useCreateAgentAssignment('p1'), { wrapper: createWrapper() })
    result.current.mutate({
      archetypeId: 'a1',
      name: 'Primary Deployer',
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(agentAssignmentsApi.create).toHaveBeenCalledWith('p1', expect.objectContaining({ name: 'Primary Deployer' }))
  })
})

describe('useUpdateAgentAssignment', () => {
  it('should update an assignment and invalidate cache', async () => {
    vi.mocked(agentAssignmentsApi.update).mockResolvedValue({ ...mockAssignment, name: 'Updated' })
    const { result } = renderHook(() => useUpdateAgentAssignment('p1'), { wrapper: createWrapper() })
    result.current.mutate({ id: 'as1', dto: { name: 'Updated' } })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(agentAssignmentsApi.update).toHaveBeenCalledWith('p1', 'as1', { name: 'Updated' })
  })
})

describe('useDeleteAgentAssignment', () => {
  it('should delete an assignment and invalidate cache', async () => {
    vi.mocked(agentAssignmentsApi.remove).mockResolvedValue(undefined)
    const { result } = renderHook(() => useDeleteAgentAssignment('p1'), { wrapper: createWrapper() })
    result.current.mutate('as1')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(agentAssignmentsApi.remove).toHaveBeenCalledWith('p1', 'as1')
  })
})
