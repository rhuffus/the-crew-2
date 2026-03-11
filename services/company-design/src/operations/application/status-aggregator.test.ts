import { describe, it, expect } from 'vitest'
import { aggregateOperationsStatus } from './status-aggregator'
import type {
  ReleaseSnapshotDto,
  WorkflowRunDto,
  StageExecutionDto,
  IncidentDto,
  ContractComplianceDto,
} from '@the-crew/shared-types'

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
    workflows: [],
    policies: [],
    artifacts: [],
  }
}

function makeRun(overrides: Partial<WorkflowRunDto> = {}): WorkflowRunDto {
  return {
    id: 'r1',
    projectId: 'p1',
    workflowId: 'wf1',
    status: 'running',
    currentStageIndex: 0,
    startedAt: '2024-01-01T00:00:00Z',
    completedAt: null,
    failureReason: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides,
  }
}

function makeStageExec(overrides: Partial<StageExecutionDto> = {}): StageExecutionDto {
  return {
    id: 'se1',
    runId: 'r1',
    workflowId: 'wf1',
    stageName: 'Stage 1',
    stageIndex: 0,
    status: 'pending',
    assigneeId: null,
    blockReason: null,
    startedAt: null,
    completedAt: null,
    ...overrides,
  }
}

function makeIncident(overrides: Partial<IncidentDto> = {}): IncidentDto {
  return {
    id: 'i1',
    projectId: 'p1',
    entityType: 'workflow',
    entityId: 'wf1',
    severity: 'major',
    status: 'open',
    title: 'Test incident',
    description: 'Test',
    reportedAt: '2024-01-01T00:00:00Z',
    resolvedAt: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides,
  }
}

function makeCompliance(overrides: Partial<ContractComplianceDto> = {}): ContractComplianceDto {
  return {
    id: 'cc1',
    projectId: 'p1',
    contractId: 'c1',
    status: 'compliant',
    reason: null,
    lastCheckedAt: '2024-01-01T00:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('aggregateOperationsStatus', () => {
  it('returns empty result for empty snapshot', () => {
    const result = aggregateOperationsStatus('company', null, emptySnapshot(), [], [], [], [], 'p1')
    expect(result.projectId).toBe('p1')
    expect(result.scopeType).toBe('company')
    expect(result.entities).toHaveLength(0)
    expect(result.summary.totalActiveRuns).toBe(0)
  })

  it('computes workflow running status from active runs', () => {
    const snapshot = {
      ...emptySnapshot(),
      workflows: [{ id: 'wf1', projectId: 'p1', name: 'WF', description: '', ownerDepartmentId: null, status: 'active' as const, triggerDescription: '', stages: [], participants: [], contractIds: [], createdAt: '', updatedAt: '' }],
    }
    const runs = [makeRun()]

    const result = aggregateOperationsStatus('company', null, snapshot, runs, [], [], [], 'p1')
    const wfEntity = result.entities.find(e => e.entityId === 'wf1')

    expect(wfEntity).toBeDefined()
    expect(wfEntity!.operationStatus).toBe('running')
    expect(wfEntity!.activeRunCount).toBe(1)
    expect(wfEntity!.badges.some(b => b.type === 'active-run')).toBe(true)
    expect(result.summary.totalActiveRuns).toBe(1)
  })

  it('escalates to failed when workflow has failed runs', () => {
    const snapshot = {
      ...emptySnapshot(),
      workflows: [{ id: 'wf1', projectId: 'p1', name: 'WF', description: '', ownerDepartmentId: null, status: 'active' as const, triggerDescription: '', stages: [], participants: [], contractIds: [], createdAt: '', updatedAt: '' }],
    }
    const runs = [makeRun({ status: 'failed', failureReason: 'timeout' })]

    const result = aggregateOperationsStatus('company', null, snapshot, runs, [], [], [], 'p1')
    const wfEntity = result.entities.find(e => e.entityId === 'wf1')

    expect(wfEntity!.operationStatus).toBe('failed')
    expect(wfEntity!.badges.some(b => b.type === 'failed-run')).toBe(true)
    expect(result.summary.totalFailedRuns).toBe(1)
  })

  it('computes stage execution status', () => {
    const snapshot = {
      ...emptySnapshot(),
      workflows: [{
        id: 'wf1', projectId: 'p1', name: 'WF', description: '', ownerDepartmentId: null, status: 'active' as const, triggerDescription: '',
        stages: [{ name: 'S1', order: 0, description: '' }, { name: 'S2', order: 1, description: '' }],
        participants: [], contractIds: [], createdAt: '', updatedAt: '',
      }],
    }
    const execs = [
      makeStageExec({ status: 'running', stageIndex: 0 }),
      makeStageExec({ id: 'se2', status: 'blocked', stageIndex: 1, blockReason: 'waiting' }),
    ]

    const result = aggregateOperationsStatus('company', null, snapshot, [], execs, [], [], 'p1')
    const stage0 = result.entities.find(e => e.visualNodeId === 'wf-stage:wf1:0')
    const stage1 = result.entities.find(e => e.visualNodeId === 'wf-stage:wf1:1')

    expect(stage0?.operationStatus).toBe('running')
    expect(stage1?.operationStatus).toBe('blocked')
    expect(stage1?.badges.some(b => b.type === 'blocked-stage')).toBe(true)
    expect(result.summary.totalBlockedStages).toBe(1)
  })

  it('computes queue depth for stages', () => {
    const snapshot = {
      ...emptySnapshot(),
      workflows: [{
        id: 'wf1', projectId: 'p1', name: 'WF', description: '', ownerDepartmentId: null, status: 'active' as const, triggerDescription: '',
        stages: [{ name: 'S1', order: 0, description: '' }],
        participants: [], contractIds: [], createdAt: '', updatedAt: '',
      }],
    }
    const execs = [
      makeStageExec({ status: 'pending', stageIndex: 0 }),
      makeStageExec({ id: 'se2', runId: 'r2', status: 'pending', stageIndex: 0 }),
      makeStageExec({ id: 'se3', runId: 'r3', status: 'running', stageIndex: 0 }),
    ]

    const result = aggregateOperationsStatus('company', null, snapshot, [], execs, [], [], 'p1')
    const stage0 = result.entities.find(e => e.visualNodeId === 'wf-stage:wf1:0')

    expect(stage0?.queueDepth).toBe(2)
    expect(stage0?.badges.some(b => b.type === 'queue-depth')).toBe(true)
  })

  it('computes incident count for entities', () => {
    const snapshot = {
      ...emptySnapshot(),
      workflows: [{ id: 'wf1', projectId: 'p1', name: 'WF', description: '', ownerDepartmentId: null, status: 'active' as const, triggerDescription: '', stages: [], participants: [], contractIds: [], createdAt: '', updatedAt: '' }],
    }
    const incidents = [makeIncident(), makeIncident({ id: 'i2' })]

    const result = aggregateOperationsStatus('company', null, snapshot, [], [], incidents, [], 'p1')
    const wfEntity = result.entities.find(e => e.entityId === 'wf1')

    expect(wfEntity?.incidentCount).toBe(2)
    expect(wfEntity?.badges.some(b => b.type === 'incident')).toBe(true)
    expect(result.summary.totalOpenIncidents).toBe(2)
  })

  it('excludes resolved incidents from counts', () => {
    const snapshot = {
      ...emptySnapshot(),
      workflows: [{ id: 'wf1', projectId: 'p1', name: 'WF', description: '', ownerDepartmentId: null, status: 'active' as const, triggerDescription: '', stages: [], participants: [], contractIds: [], createdAt: '', updatedAt: '' }],
    }
    const incidents = [makeIncident({ status: 'resolved' })]

    const result = aggregateOperationsStatus('company', null, snapshot, [], [], incidents, [], 'p1')
    const wfEntity = result.entities.find(e => e.entityId === 'wf1')

    expect(wfEntity?.incidentCount).toBe(0)
    expect(result.summary.totalOpenIncidents).toBe(0)
  })

  it('computes contract compliance status', () => {
    const snapshot = {
      ...emptySnapshot(),
      contracts: [{ id: 'c1', projectId: 'p1', name: 'SLA', description: '', type: 'SLA' as const, status: 'active' as const, providerId: 'd1', providerType: 'department' as const, consumerId: 'd2', consumerType: 'department' as const, acceptanceCriteria: [], createdAt: '', updatedAt: '' }],
    }
    const compliances = [makeCompliance({ status: 'violated', reason: 'SLA breach' })]

    const result = aggregateOperationsStatus('company', null, snapshot, [], [], [], compliances, 'p1')
    const cEntity = result.entities.find(e => e.entityId === 'c1')

    expect(cEntity?.complianceStatus).toBe('violated')
    expect(cEntity?.operationStatus).toBe('failed')
    expect(cEntity?.badges.some(b => b.type === 'compliance-violated')).toBe(true)
    expect(result.summary.totalComplianceViolations).toBe(1)
  })

  it('at-risk contract escalates to blocked', () => {
    const snapshot = {
      ...emptySnapshot(),
      contracts: [{ id: 'c1', projectId: 'p1', name: 'SLA', description: '', type: 'SLA' as const, status: 'active' as const, providerId: 'd1', providerType: 'department' as const, consumerId: 'd2', consumerType: 'department' as const, acceptanceCriteria: [], createdAt: '', updatedAt: '' }],
    }
    const compliances = [makeCompliance({ status: 'at-risk' })]

    const result = aggregateOperationsStatus('company', null, snapshot, [], [], [], compliances, 'p1')
    const cEntity = result.entities.find(e => e.entityId === 'c1')

    expect(cEntity?.operationStatus).toBe('blocked')
    expect(cEntity?.badges.some(b => b.type === 'compliance-risk')).toBe(true)
  })

  it('aggregates department status from owned workflows', () => {
    const snapshot = {
      ...emptySnapshot(),
      departments: [{ id: 'd1', projectId: 'p1', name: 'Dept', description: '', mandate: '', parentId: null, createdAt: '', updatedAt: '' }],
      workflows: [{ id: 'wf1', projectId: 'p1', name: 'WF', description: '', ownerDepartmentId: 'd1', status: 'active' as const, triggerDescription: '', stages: [], participants: [], contractIds: [], createdAt: '', updatedAt: '' }],
    }
    const runs = [makeRun()]

    const result = aggregateOperationsStatus('company', null, snapshot, runs, [], [], [], 'p1')
    const deptEntity = result.entities.find(e => e.entityId === 'd1')

    expect(deptEntity?.operationStatus).toBe('running')
    expect(deptEntity?.activeRunCount).toBe(1)
  })

  it('department escalates to failed if owned workflow has failed runs', () => {
    const snapshot = {
      ...emptySnapshot(),
      departments: [{ id: 'd1', projectId: 'p1', name: 'Dept', description: '', mandate: '', parentId: null, createdAt: '', updatedAt: '' }],
      workflows: [{ id: 'wf1', projectId: 'p1', name: 'WF', description: '', ownerDepartmentId: 'd1', status: 'active' as const, triggerDescription: '', stages: [], participants: [], contractIds: [], createdAt: '', updatedAt: '' }],
    }
    const runs = [makeRun({ status: 'failed' })]

    const result = aggregateOperationsStatus('company', null, snapshot, runs, [], [], [], 'p1')
    const deptEntity = result.entities.find(e => e.entityId === 'd1')

    expect(deptEntity?.operationStatus).toBe('failed')
  })

  it('scopes entities to department when scopeType is department', () => {
    const snapshot = {
      ...emptySnapshot(),
      departments: [
        { id: 'd1', projectId: 'p1', name: 'D1', description: '', mandate: '', parentId: null, createdAt: '', updatedAt: '' },
        { id: 'd2', projectId: 'p1', name: 'D2', description: '', mandate: '', parentId: null, createdAt: '', updatedAt: '' },
      ],
      workflows: [
        { id: 'wf1', projectId: 'p1', name: 'WF1', description: '', ownerDepartmentId: 'd1', status: 'active' as const, triggerDescription: '', stages: [], participants: [], contractIds: [], createdAt: '', updatedAt: '' },
        { id: 'wf2', projectId: 'p1', name: 'WF2', description: '', ownerDepartmentId: 'd2', status: 'active' as const, triggerDescription: '', stages: [], participants: [], contractIds: [], createdAt: '', updatedAt: '' },
      ],
    }

    const result = aggregateOperationsStatus('department', 'd1', snapshot, [], [], [], [], 'p1')
    const entityIds = result.entities.map(e => e.entityId)

    expect(entityIds).toContain('d1')
    expect(entityIds).toContain('wf1')
    expect(entityIds).not.toContain('d2')
    expect(entityIds).not.toContain('wf2')
  })

  it('scopes entities to workflow when scopeType is workflow', () => {
    const snapshot = {
      ...emptySnapshot(),
      workflows: [{
        id: 'wf1', projectId: 'p1', name: 'WF', description: '', ownerDepartmentId: null, status: 'active' as const, triggerDescription: '',
        stages: [{ name: 'S1', order: 0, description: '' }],
        participants: [], contractIds: ['c1'], createdAt: '', updatedAt: '',
      }],
      contracts: [{ id: 'c1', projectId: 'p1', name: 'SLA', description: '', type: 'SLA' as const, status: 'active' as const, providerId: 'd1', providerType: 'department' as const, consumerId: 'd2', consumerType: 'department' as const, acceptanceCriteria: [], createdAt: '', updatedAt: '' }],
    }

    const result = aggregateOperationsStatus('workflow', 'wf1', snapshot, [], [], [], [], 'p1')
    const types = result.entities.map(e => e.entityType)

    expect(types).toContain('workflow')
    expect(types).toContain('workflow-stage')
    expect(types).toContain('contract')
  })

  it('includes fetchedAt timestamp', () => {
    const result = aggregateOperationsStatus('company', null, emptySnapshot(), [], [], [], [], 'p1')
    expect(result.fetchedAt).toBeDefined()
    expect(new Date(result.fetchedAt).getTime()).toBeGreaterThan(0)
  })

  it('computes visual node IDs correctly', () => {
    const snapshot = {
      ...emptySnapshot(),
      workflows: [{
        id: 'wf1', projectId: 'p1', name: 'WF', description: '', ownerDepartmentId: null, status: 'active' as const, triggerDescription: '',
        stages: [{ name: 'S1', order: 0, description: '' }],
        participants: [], contractIds: [], createdAt: '', updatedAt: '',
      }],
    }

    const result = aggregateOperationsStatus('company', null, snapshot, [], [], [], [], 'p1')
    const wf = result.entities.find(e => e.entityType === 'workflow')
    const stage = result.entities.find(e => e.entityType === 'workflow-stage')

    expect(wf?.visualNodeId).toBe('wf:wf1')
    expect(stage?.visualNodeId).toBe('wf-stage:wf1:0')
  })

  it('handles mixed statuses with correct escalation', () => {
    const snapshot = {
      ...emptySnapshot(),
      workflows: [{ id: 'wf1', projectId: 'p1', name: 'WF', description: '', ownerDepartmentId: null, status: 'active' as const, triggerDescription: '', stages: [], participants: [], contractIds: [], createdAt: '', updatedAt: '' }],
    }
    const runs = [makeRun(), makeRun({ id: 'r2', status: 'failed' })]
    const incidents = [makeIncident()]

    const result = aggregateOperationsStatus('company', null, snapshot, runs, [], incidents, [], 'p1')
    const wfEntity = result.entities.find(e => e.entityId === 'wf1')

    expect(wfEntity?.operationStatus).toBe('failed')
  })

  it('compliant contract gets compliance-ok badge', () => {
    const snapshot = {
      ...emptySnapshot(),
      contracts: [{ id: 'c1', projectId: 'p1', name: 'SLA', description: '', type: 'SLA' as const, status: 'active' as const, providerId: 'd1', providerType: 'department' as const, consumerId: 'd2', consumerType: 'department' as const, acceptanceCriteria: [], createdAt: '', updatedAt: '' }],
    }
    const compliances = [makeCompliance()]

    const result = aggregateOperationsStatus('company', null, snapshot, [], [], [], compliances, 'p1')
    const cEntity = result.entities.find(e => e.entityId === 'c1')

    expect(cEntity?.complianceStatus).toBe('compliant')
    expect(cEntity?.badges.some(b => b.type === 'compliance-ok')).toBe(true)
  })
})
