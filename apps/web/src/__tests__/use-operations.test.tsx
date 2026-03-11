import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import type { CreateWorkflowRunDto, CreateIncidentDto } from '@the-crew/shared-types'
import {
  useOperationsStatus,
  useWorkflowRuns,
  useCreateWorkflowRun,
  useIncidents,
  useCreateIncident,
  useResolveIncident,
  useContractCompliances,
  useSetCompliance,
} from '@/hooks/use-operations'

vi.mock('@/api/operations', () => ({
  operationsApi: {
    getStatus: vi.fn(),
    listRuns: vi.fn(),
    createRun: vi.fn(),
    updateRun: vi.fn(),
    advanceStage: vi.fn(),
    listIncidents: vi.fn(),
    createIncident: vi.fn(),
    updateIncident: vi.fn(),
    resolveIncident: vi.fn(),
    listCompliances: vi.fn(),
    setCompliance: vi.fn(),
    updateCompliance: vi.fn(),
  },
}))

import { operationsApi } from '@/api/operations'
const mock = operationsApi as unknown as Record<string, ReturnType<typeof vi.fn>>

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('useOperationsStatus', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetches status when enabled', async () => {
    const statusData = {
      projectId: 'p1',
      scopeType: 'company',
      entityId: null,
      entities: [],
      summary: { totalActiveRuns: 0, totalBlockedStages: 0, totalFailedRuns: 0, totalOpenIncidents: 0, totalComplianceViolations: 0 },
      fetchedAt: new Date().toISOString(),
    }
    mock.getStatus!.mockResolvedValue(statusData)
    const { result } = renderHook(
      () => useOperationsStatus('p1', 'company', undefined, { enabled: true }),
      { wrapper: createWrapper() },
    )
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(statusData)
    expect(mock.getStatus).toHaveBeenCalledWith('p1', 'company', undefined)
  })

  it('does not fetch when enabled is false', () => {
    const { result } = renderHook(
      () => useOperationsStatus('p1', 'company', undefined, { enabled: false }),
      { wrapper: createWrapper() },
    )
    expect(result.current.fetchStatus).toBe('idle')
    expect(mock.getStatus).not.toHaveBeenCalled()
  })
})

describe('useWorkflowRuns', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetches runs', async () => {
    mock.listRuns!.mockResolvedValue([{ id: 'run-1', workflowId: 'wf-1', status: 'running' }])
    const { result } = renderHook(() => useWorkflowRuns('p1', 'wf-1'), {
      wrapper: createWrapper(),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(1)
    expect(mock.listRuns).toHaveBeenCalledWith('p1', 'wf-1')
  })
})

describe('useCreateWorkflowRun', () => {
  beforeEach(() => vi.clearAllMocks())

  it('invalidates queries on success', async () => {
    const dto = { workflowId: 'wf-1', name: 'New Run' }
    mock.createRun!.mockResolvedValue({ id: 'run-2', ...dto, status: 'pending' })
    const { result } = renderHook(() => useCreateWorkflowRun('p1'), {
      wrapper: createWrapper(),
    })
    result.current.mutate(dto as CreateWorkflowRunDto)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mock.createRun).toHaveBeenCalledWith('p1', dto)
  })
})

describe('useIncidents', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetches incidents', async () => {
    mock.listIncidents!.mockResolvedValue([{ id: 'inc-1', title: 'Outage' }])
    const { result } = renderHook(() => useIncidents('p1'), {
      wrapper: createWrapper(),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(1)
    expect(mock.listIncidents).toHaveBeenCalledWith('p1', undefined, undefined)
  })
})

describe('useCreateIncident', () => {
  beforeEach(() => vi.clearAllMocks())

  it('invalidates queries on success', async () => {
    const dto = { entityType: 'department' as const, entityId: 'dept-1', title: 'Issue', severity: 'medium' as const, description: 'desc' }
    mock.createIncident!.mockResolvedValue({ id: 'inc-2', ...dto })
    const { result } = renderHook(() => useCreateIncident('p1'), {
      wrapper: createWrapper(),
    })
    result.current.mutate(dto as unknown as CreateIncidentDto)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mock.createIncident).toHaveBeenCalledWith('p1', dto)
  })
})

describe('useResolveIncident', () => {
  beforeEach(() => vi.clearAllMocks())

  it('invalidates queries on success', async () => {
    mock.resolveIncident!.mockResolvedValue({ id: 'inc-1', status: 'resolved' })
    const { result } = renderHook(() => useResolveIncident('p1'), {
      wrapper: createWrapper(),
    })
    result.current.mutate('inc-1')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mock.resolveIncident).toHaveBeenCalledWith('p1', 'inc-1')
  })
})

describe('useContractCompliances', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetches compliances', async () => {
    mock.listCompliances!.mockResolvedValue([{ id: 'comp-1', contractId: 'c-1', status: 'compliant' }])
    const { result } = renderHook(() => useContractCompliances('p1'), {
      wrapper: createWrapper(),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(1)
    expect(mock.listCompliances).toHaveBeenCalledWith('p1')
  })
})

describe('useSetCompliance', () => {
  beforeEach(() => vi.clearAllMocks())

  it('invalidates queries on success', async () => {
    const dto = { contractId: 'c-1', status: 'compliant' as const }
    mock.setCompliance!.mockResolvedValue({ id: 'comp-2', ...dto })
    const { result } = renderHook(() => useSetCompliance('p1'), {
      wrapper: createWrapper(),
    })
    result.current.mutate(dto)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mock.setCompliance).toHaveBeenCalledWith('p1', dto)
  })
})
