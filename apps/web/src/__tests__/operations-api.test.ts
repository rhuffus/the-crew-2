import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { CreateWorkflowRunDto, CreateIncidentDto } from '@the-crew/shared-types'
import { operationsApi } from '@/api/operations'

vi.mock('@/lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}))

import { apiClient } from '@/lib/api-client'
const mock = apiClient as unknown as Record<string, ReturnType<typeof vi.fn>>

describe('operationsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getStatus builds correct URL with scopeType and entityId params', async () => {
    mock.get!.mockResolvedValue({ entities: [], summary: {} })
    await operationsApi.getStatus('p1', 'company', 'ent-1')
    expect(mock.get).toHaveBeenCalledWith(
      '/projects/p1/operations/status?scopeType=company&entityId=ent-1',
    )
  })

  it('getStatus omits entityId when not provided', async () => {
    mock.get!.mockResolvedValue({ entities: [], summary: {} })
    await operationsApi.getStatus('p1', 'department')
    expect(mock.get).toHaveBeenCalledWith(
      '/projects/p1/operations/status?scopeType=department',
    )
  })

  it('listRuns calls correct endpoint with optional workflowId', async () => {
    mock.get!.mockResolvedValue([])
    await operationsApi.listRuns('p1', 'wf-1')
    expect(mock.get).toHaveBeenCalledWith('/projects/p1/operations/runs?workflowId=wf-1')
  })

  it('listRuns calls correct endpoint without workflowId', async () => {
    mock.get!.mockResolvedValue([])
    await operationsApi.listRuns('p1')
    expect(mock.get).toHaveBeenCalledWith('/projects/p1/operations/runs')
  })

  it('createRun posts to correct endpoint', async () => {
    const dto = { workflowId: 'wf-1', name: 'Run 1' }
    mock.post!.mockResolvedValue({ id: 'run-1', ...dto })
    await operationsApi.createRun('p1', dto as CreateWorkflowRunDto)
    expect(mock.post).toHaveBeenCalledWith('/projects/p1/operations/runs', dto)
  })

  it('advanceStage posts to correct endpoint with stageIndex', async () => {
    mock.post!.mockResolvedValue({ id: 'se-1', stageIndex: 2, status: 'running' })
    await operationsApi.advanceStage('p1', 'run-1', 2, 'running')
    expect(mock.post).toHaveBeenCalledWith(
      '/projects/p1/operations/runs/run-1/stages/2/advance',
      { status: 'running', blockReason: undefined },
    )
  })

  it('listIncidents builds query string with optional entityType and entityId', async () => {
    mock.get!.mockResolvedValue([])
    await operationsApi.listIncidents('p1', 'department', 'dept-1')
    expect(mock.get).toHaveBeenCalledWith(
      '/projects/p1/operations/incidents?entityType=department&entityId=dept-1',
    )
  })

  it('listIncidents calls without query string when no filters', async () => {
    mock.get!.mockResolvedValue([])
    await operationsApi.listIncidents('p1')
    expect(mock.get).toHaveBeenCalledWith('/projects/p1/operations/incidents')
  })

  it('createIncident posts to correct endpoint', async () => {
    const dto = { entityType: 'department' as const, entityId: 'dept-1', title: 'Issue', severity: 'medium' as const, description: 'desc' }
    mock.post!.mockResolvedValue({ id: 'inc-1', ...dto })
    await operationsApi.createIncident('p1', dto as unknown as CreateIncidentDto)
    expect(mock.post).toHaveBeenCalledWith('/projects/p1/operations/incidents', dto)
  })

  it('resolveIncident posts to resolve endpoint', async () => {
    mock.post!.mockResolvedValue({ id: 'inc-1', status: 'resolved' })
    await operationsApi.resolveIncident('p1', 'inc-1')
    expect(mock.post).toHaveBeenCalledWith(
      '/projects/p1/operations/incidents/inc-1/resolve',
      {},
    )
  })

  it('listCompliances calls correct endpoint', async () => {
    mock.get!.mockResolvedValue([])
    await operationsApi.listCompliances('p1')
    expect(mock.get).toHaveBeenCalledWith('/projects/p1/operations/compliance')
  })

  it('setCompliance posts to correct endpoint', async () => {
    const dto = { contractId: 'c-1', status: 'compliant' as const }
    mock.post!.mockResolvedValue({ id: 'comp-1', ...dto })
    await operationsApi.setCompliance('p1', dto)
    expect(mock.post).toHaveBeenCalledWith('/projects/p1/operations/compliance', dto)
  })
})
