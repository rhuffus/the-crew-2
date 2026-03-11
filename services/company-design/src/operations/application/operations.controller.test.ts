import 'reflect-metadata'
import { describe, it, expect, vi } from 'vitest'
import { OperationsController } from './operations.controller'
import type { OperationsService } from './operations.service'

const mockService = {
  getOperationsStatus: vi.fn().mockResolvedValue({ projectId: 'p1', summary: {} }),
  listRuns: vi.fn().mockResolvedValue([]),
  createRun: vi.fn().mockResolvedValue({ id: 'r1', status: 'running' }),
  getRun: vi.fn().mockResolvedValue({ id: 'r1' }),
  updateRun: vi.fn().mockResolvedValue({ id: 'r1', status: 'completed' }),
  listStageExecutions: vi.fn().mockResolvedValue([]),
  advanceStage: vi.fn().mockResolvedValue({ id: 'se1', status: 'completed' }),
  listIncidents: vi.fn().mockResolvedValue([]),
  createIncident: vi.fn().mockResolvedValue({ id: 'i1' }),
  updateIncident: vi.fn().mockResolvedValue({ id: 'i1' }),
  resolveIncident: vi.fn().mockResolvedValue({ id: 'i1', status: 'resolved' }),
  listCompliances: vi.fn().mockResolvedValue([]),
  setCompliance: vi.fn().mockResolvedValue({ id: 'cc1' }),
  updateCompliance: vi.fn().mockResolvedValue({ id: 'cc1' }),
}

describe('OperationsController', () => {
  const ctrl = new OperationsController(mockService as unknown as OperationsService)

  it('getStatus delegates with scopeType and entityId', async () => {
    await ctrl.getStatus('p1', 'department', 'd1')
    expect(mockService.getOperationsStatus).toHaveBeenCalledWith('p1', 'department', 'd1')
  })

  it('listRuns delegates with optional workflowId', async () => {
    await ctrl.listRuns('p1', 'wf1')
    expect(mockService.listRuns).toHaveBeenCalledWith('p1', 'wf1')
  })

  it('createRun delegates with dto', async () => {
    await ctrl.createRun('p1', { workflowId: 'wf1' })
    expect(mockService.createRun).toHaveBeenCalledWith('p1', { workflowId: 'wf1' })
  })

  it('getRun delegates', async () => {
    await ctrl.getRun('r1')
    expect(mockService.getRun).toHaveBeenCalledWith('r1')
  })

  it('updateRun delegates', async () => {
    await ctrl.updateRun('r1', { status: 'completed' })
    expect(mockService.updateRun).toHaveBeenCalledWith('r1', { status: 'completed' })
  })

  it('advanceStage parses stageIndex and delegates', async () => {
    await ctrl.advanceStage('r1', '2', { status: 'completed' })
    expect(mockService.advanceStage).toHaveBeenCalledWith('r1', 2, 'completed', undefined)
  })

  it('listIncidents delegates with filters', async () => {
    await ctrl.listIncidents('p1', 'workflow', 'wf1')
    expect(mockService.listIncidents).toHaveBeenCalledWith('p1', 'workflow', 'wf1')
  })

  it('createIncident delegates', async () => {
    const dto = { entityType: 'workflow' as const, entityId: 'wf1', severity: 'major' as const, title: 'T', description: 'D' }
    await ctrl.createIncident('p1', dto)
    expect(mockService.createIncident).toHaveBeenCalledWith('p1', dto)
  })

  it('resolveIncident delegates', async () => {
    await ctrl.resolveIncident('i1')
    expect(mockService.resolveIncident).toHaveBeenCalledWith('i1')
  })

  it('setCompliance delegates', async () => {
    const dto = { contractId: 'c1', status: 'compliant' as const }
    await ctrl.setCompliance('p1', dto)
    expect(mockService.setCompliance).toHaveBeenCalledWith('p1', dto)
  })
})
