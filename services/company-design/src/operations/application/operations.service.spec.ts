import 'reflect-metadata'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { OperationsService } from './operations.service'
import { InMemoryWorkflowRunRepository } from '../infrastructure/in-memory-workflow-run.repository'
import { InMemoryStageExecutionRepository } from '../infrastructure/in-memory-stage-execution.repository'
import { InMemoryIncidentRepository } from '../infrastructure/in-memory-incident.repository'
import { InMemoryContractComplianceRepository } from '../infrastructure/in-memory-contract-compliance.repository'
import type { ReleaseSnapshotDto } from '@the-crew/shared-types'

function emptySnapshot(): ReleaseSnapshotDto {
  return {
    companyModel: null,
    departments: [],
    capabilities: [],
    roles: [],
    agentArchetypes: [],
    agentAssignments: [],
    skills: [],
    contracts: [],
    workflows: [
      {
        id: 'wf1', projectId: 'p1', name: 'Onboarding', description: '',
        ownerDepartmentId: null, status: 'active', triggerDescription: '',
        stages: [
          { name: 'Review', order: 0, description: '' },
          { name: 'Deploy', order: 1, description: '' },
        ],
        participants: [], contractIds: [], createdAt: '', updatedAt: '',
      },
    ],
    policies: [],
    artifacts: [],
  }
}

const mockSnapshotCollector = { collect: vi.fn().mockResolvedValue(emptySnapshot()) }

describe('OperationsService', () => {
  let service: OperationsService
  let runRepo: InMemoryWorkflowRunRepository
  let stageRepo: InMemoryStageExecutionRepository
  let incidentRepo: InMemoryIncidentRepository
  let complianceRepo: InMemoryContractComplianceRepository

  beforeEach(() => {
    runRepo = new InMemoryWorkflowRunRepository()
    stageRepo = new InMemoryStageExecutionRepository()
    incidentRepo = new InMemoryIncidentRepository()
    complianceRepo = new InMemoryContractComplianceRepository()
    mockSnapshotCollector.collect.mockResolvedValue(emptySnapshot())

    service = new OperationsService(
      runRepo,
      stageRepo,
      incidentRepo,
      complianceRepo,
      mockSnapshotCollector as any,
    )
  })

  describe('Workflow Runs', () => {
    it('creates a run and auto-creates stage executions', async () => {
      const run = await service.createRun('p1', { workflowId: 'wf1' })
      expect(run.status).toBe('running')
      expect(run.workflowId).toBe('wf1')

      const stages = await service.listStageExecutions(run.id)
      expect(stages).toHaveLength(2)
      expect(stages[0]!.status).toBe('running')
      expect(stages[1]!.status).toBe('pending')
    })

    it('gets a run by id', async () => {
      const created = await service.createRun('p1', { workflowId: 'wf1' })
      const fetched = await service.getRun(created.id)
      expect(fetched.id).toBe(created.id)
    })

    it('throws on unknown run', async () => {
      await expect(service.getRun('nonexistent')).rejects.toThrow('not found')
    })

    it('lists runs by project', async () => {
      await service.createRun('p1', { workflowId: 'wf1' })
      await service.createRun('p1', { workflowId: 'wf1' })
      const runs = await service.listRuns('p1')
      expect(runs).toHaveLength(2)
    })

    it('lists runs by workflow', async () => {
      await service.createRun('p1', { workflowId: 'wf1' })
      const runs = await service.listRuns('p1', 'wf1')
      expect(runs).toHaveLength(1)
    })

    it('updates run status', async () => {
      const run = await service.createRun('p1', { workflowId: 'wf1' })
      const updated = await service.updateRun(run.id, { status: 'failed', failureReason: 'timeout' })
      expect(updated.status).toBe('failed')
      expect(updated.failureReason).toBe('timeout')
      expect(updated.completedAt).not.toBeNull()
    })
  })

  describe('Stage Advancement', () => {
    it('advances stage status', async () => {
      const run = await service.createRun('p1', { workflowId: 'wf1' })
      const result = await service.advanceStage(run.id, 0, 'completed')
      expect(result.status).toBe('completed')
    })

    it('auto-advances next stage when current completes', async () => {
      const run = await service.createRun('p1', { workflowId: 'wf1' })
      await service.advanceStage(run.id, 0, 'completed')
      const stages = await service.listStageExecutions(run.id)
      expect(stages[1]!.status).toBe('running')
    })

    it('auto-completes run when last stage completes', async () => {
      const run = await service.createRun('p1', { workflowId: 'wf1' })
      await service.advanceStage(run.id, 0, 'completed')
      await service.advanceStage(run.id, 1, 'completed')
      const updated = await service.getRun(run.id)
      expect(updated.status).toBe('completed')
    })

    it('blocks stage with reason', async () => {
      const run = await service.createRun('p1', { workflowId: 'wf1' })
      const result = await service.advanceStage(run.id, 0, 'blocked', 'Approval needed')
      expect(result.status).toBe('blocked')
      expect(result.blockReason).toBe('Approval needed')
    })

    it('throws on unknown stage index', async () => {
      const run = await service.createRun('p1', { workflowId: 'wf1' })
      await expect(service.advanceStage(run.id, 99, 'completed')).rejects.toThrow('not found')
    })
  })

  describe('Incidents', () => {
    it('creates an incident', async () => {
      const incident = await service.createIncident('p1', {
        entityType: 'workflow',
        entityId: 'wf1',
        severity: 'major',
        title: 'Timeout',
        description: 'Stage timed out',
      })
      expect(incident.status).toBe('open')
      expect(incident.title).toBe('Timeout')
    })

    it('lists incidents by project', async () => {
      await service.createIncident('p1', { entityType: 'workflow', entityId: 'wf1', severity: 'major', title: 'A', description: '' })
      await service.createIncident('p1', { entityType: 'contract', entityId: 'c1', severity: 'minor', title: 'B', description: '' })
      const list = await service.listIncidents('p1')
      expect(list).toHaveLength(2)
    })

    it('filters incidents by entityType', async () => {
      await service.createIncident('p1', { entityType: 'workflow', entityId: 'wf1', severity: 'major', title: 'A', description: '' })
      await service.createIncident('p1', { entityType: 'contract', entityId: 'c1', severity: 'minor', title: 'B', description: '' })
      const list = await service.listIncidents('p1', 'workflow')
      expect(list).toHaveLength(1)
      expect(list[0]!.entityType).toBe('workflow')
    })

    it('updates incident severity', async () => {
      const inc = await service.createIncident('p1', { entityType: 'workflow', entityId: 'wf1', severity: 'minor', title: 'A', description: '' })
      const updated = await service.updateIncident(inc.id, { severity: 'critical' })
      expect(updated.severity).toBe('critical')
    })

    it('resolves incident', async () => {
      const inc = await service.createIncident('p1', { entityType: 'workflow', entityId: 'wf1', severity: 'major', title: 'A', description: '' })
      const resolved = await service.resolveIncident(inc.id)
      expect(resolved.status).toBe('resolved')
      expect(resolved.resolvedAt).not.toBeNull()
    })

    it('throws on unknown incident', async () => {
      await expect(service.updateIncident('nonexistent', {})).rejects.toThrow('not found')
    })
  })

  describe('Contract Compliance', () => {
    it('sets compliance for a contract', async () => {
      const cc = await service.setCompliance('p1', { contractId: 'c1', status: 'compliant' })
      expect(cc.status).toBe('compliant')
      expect(cc.contractId).toBe('c1')
    })

    it('upserts compliance on same contract', async () => {
      await service.setCompliance('p1', { contractId: 'c1', status: 'compliant' })
      const updated = await service.setCompliance('p1', { contractId: 'c1', status: 'violated', reason: 'SLA breach' })
      expect(updated.status).toBe('violated')

      const list = await service.listCompliances('p1')
      expect(list).toHaveLength(1)
    })

    it('lists compliances', async () => {
      await service.setCompliance('p1', { contractId: 'c1', status: 'compliant' })
      await service.setCompliance('p1', { contractId: 'c2', status: 'at-risk' })
      const list = await service.listCompliances('p1')
      expect(list).toHaveLength(2)
    })

    it('updates compliance', async () => {
      const cc = await service.setCompliance('p1', { contractId: 'c1', status: 'compliant' })
      const updated = await service.updateCompliance(cc.id, { status: 'violated', reason: 'breach' })
      expect(updated.status).toBe('violated')
      expect(updated.reason).toBe('breach')
    })

    it('throws on unknown compliance', async () => {
      await expect(service.updateCompliance('nonexistent', {})).rejects.toThrow('not found')
    })
  })

  describe('Aggregated Status', () => {
    it('returns operations status', async () => {
      const result = await service.getOperationsStatus('p1', 'company')
      expect(result.projectId).toBe('p1')
      expect(result.scopeType).toBe('company')
      expect(result.summary).toBeDefined()
      expect(result.fetchedAt).toBeDefined()
    })
  })
})
