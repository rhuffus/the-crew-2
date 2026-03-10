import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useWorkflows, useCreateWorkflow, useUpdateWorkflow, useDeleteWorkflow } from '@/hooks/use-workflows'
import { workflowsApi } from '@/api/workflows'
import type { WorkflowDto } from '@the-crew/shared-types'

vi.mock('@/api/workflows', () => ({
  workflowsApi: {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}))

const mockWorkflow: WorkflowDto = {
  id: 'w1',
  projectId: 'p1',
  name: 'Onboarding',
  description: 'New hire onboarding',
  ownerDepartmentId: 'd1',
  status: 'draft',
  triggerDescription: 'New hire joins',
  stages: [{ name: 'Setup', order: 1, description: 'Account setup' }],
  participants: [{ participantId: 'd1', participantType: 'department', responsibility: 'Owns' }],
  contractIds: ['c1'],
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

describe('useWorkflows', () => {
  it('should fetch workflows list', async () => {
    vi.mocked(workflowsApi.list).mockResolvedValue([mockWorkflow])
    const { result } = renderHook(() => useWorkflows('p1'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([mockWorkflow])
    expect(workflowsApi.list).toHaveBeenCalledWith('p1')
  })
})

describe('useCreateWorkflow', () => {
  it('should create a workflow and invalidate cache', async () => {
    vi.mocked(workflowsApi.create).mockResolvedValue(mockWorkflow)
    const { result } = renderHook(() => useCreateWorkflow('p1'), { wrapper: createWrapper() })
    result.current.mutate({ name: 'Onboarding', description: 'New hire onboarding' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(workflowsApi.create).toHaveBeenCalledWith('p1', expect.objectContaining({ name: 'Onboarding' }))
  })
})

describe('useUpdateWorkflow', () => {
  it('should update a workflow and invalidate cache', async () => {
    vi.mocked(workflowsApi.update).mockResolvedValue({ ...mockWorkflow, name: 'Updated' })
    const { result } = renderHook(() => useUpdateWorkflow('p1'), { wrapper: createWrapper() })
    result.current.mutate({ id: 'w1', dto: { name: 'Updated' } })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(workflowsApi.update).toHaveBeenCalledWith('p1', 'w1', { name: 'Updated' })
  })
})

describe('useDeleteWorkflow', () => {
  it('should delete a workflow and invalidate cache', async () => {
    vi.mocked(workflowsApi.remove).mockResolvedValue(undefined)
    const { result } = renderHook(() => useDeleteWorkflow('p1'), { wrapper: createWrapper() })
    result.current.mutate('w1')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(workflowsApi.remove).toHaveBeenCalledWith('p1', 'w1')
  })
})
