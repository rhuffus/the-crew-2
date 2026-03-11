import 'reflect-metadata'
import { describe, it, expect, vi } from 'vitest'
import { OperationsController } from './operations.controller'

const mockClient = {
  getOperationsStatus: vi.fn().mockResolvedValue({ projectId: 'p1' }),
  listWorkflowRuns: vi.fn().mockResolvedValue([]),
  createWorkflowRun: vi.fn().mockResolvedValue({ id: 'r1' }),
  updateWorkflowRun: vi.fn().mockResolvedValue({ id: 'r1' }),
  advanceStage: vi.fn().mockResolvedValue({ id: 'se1' }),
  listIncidents: vi.fn().mockResolvedValue([]),
  createIncident: vi.fn().mockResolvedValue({ id: 'i1' }),
  updateIncident: vi.fn().mockResolvedValue({ id: 'i1' }),
  resolveIncident: vi.fn().mockResolvedValue({ id: 'i1' }),
  listCompliances: vi.fn().mockResolvedValue([]),
  setCompliance: vi.fn().mockResolvedValue({ id: 'cc1' }),
  updateCompliance: vi.fn().mockResolvedValue({ id: 'cc1' }),
}

describe('OperationsController (gateway)', () => {
  const ctrl = new OperationsController(mockClient as any)

  it('forwards getStatus with scopeType and entityId', async () => {
    await ctrl.getStatus('p1', 'department', 'd1')
    expect(mockClient.getOperationsStatus).toHaveBeenCalledWith('p1', 'department', 'd1')
  })

  it('forwards listRuns with workflowId', async () => {
    await ctrl.listRuns('p1', 'wf1')
    expect(mockClient.listWorkflowRuns).toHaveBeenCalledWith('p1', 'wf1')
  })

  it('forwards createRun', async () => {
    await ctrl.createRun('p1', { workflowId: 'wf1' })
    expect(mockClient.createWorkflowRun).toHaveBeenCalledWith('p1', { workflowId: 'wf1' })
  })

  it('forwards advanceStage with parsed index', async () => {
    await ctrl.advanceStage('p1', 'r1', '2', { status: 'completed' })
    expect(mockClient.advanceStage).toHaveBeenCalledWith('p1', 'r1', 2, 'completed', undefined)
  })

  it('forwards createIncident', async () => {
    const dto = { entityType: 'workflow' as const, entityId: 'wf1', severity: 'major' as const, title: 'T', description: 'D' }
    await ctrl.createIncident('p1', dto)
    expect(mockClient.createIncident).toHaveBeenCalledWith('p1', dto)
  })

  it('forwards resolveIncident', async () => {
    await ctrl.resolveIncident('p1', 'i1')
    expect(mockClient.resolveIncident).toHaveBeenCalledWith('p1', 'i1')
  })

  it('forwards setCompliance', async () => {
    const dto = { contractId: 'c1', status: 'compliant' as const }
    await ctrl.setCompliance('p1', dto)
    expect(mockClient.setCompliance).toHaveBeenCalledWith('p1', dto)
  })

  it('forwards updateCompliance', async () => {
    await ctrl.updateCompliance('p1', 'cc1', { status: 'violated' })
    expect(mockClient.updateCompliance).toHaveBeenCalledWith('p1', 'cc1', { status: 'violated' })
  })

  it('forwards listIncidents with filters', async () => {
    await ctrl.listIncidents('p1', 'workflow', 'wf1')
    expect(mockClient.listIncidents).toHaveBeenCalledWith('p1', 'workflow', 'wf1')
  })

  it('forwards updateRun', async () => {
    await ctrl.updateRun('p1', 'r1', { status: 'failed' })
    expect(mockClient.updateWorkflowRun).toHaveBeenCalledWith('p1', 'r1', { status: 'failed' })
  })
})
