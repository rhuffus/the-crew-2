import { describe, it, expect } from 'vitest'
import { WorkflowRun } from './workflow-run'
import { StageExecution } from './stage-execution'
import { Incident } from './incident'
import { ContractCompliance } from './contract-compliance'

describe('WorkflowRun', () => {
  const projectId = 'p1'
  const createDto = { workflowId: 'wf1' }

  it('creates with running status and stageIndex 0', () => {
    const run = WorkflowRun.create(projectId, createDto)
    expect(run.id).toBeDefined()
    expect(run.projectId).toBe(projectId)
    expect(run.workflowId).toBe('wf1')
    expect(run.status).toBe('running')
    expect(run.currentStageIndex).toBe(0)
    expect(run.completedAt).toBeNull()
    expect(run.failureReason).toBeNull()
  })

  it('reconstitutes from props', () => {
    const props = {
      id: 'r1',
      projectId,
      workflowId: 'wf1',
      status: 'running' as const,
      currentStageIndex: 2,
      startedAt: new Date(),
      completedAt: null,
      failureReason: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const run = WorkflowRun.reconstitute(props)
    expect(run.id).toBe('r1')
    expect(run.currentStageIndex).toBe(2)
  })

  it('updates status and sets completedAt on terminal states', () => {
    const run = WorkflowRun.create(projectId, createDto)
    run.update({ status: 'completed' })
    expect(run.status).toBe('completed')
    expect(run.completedAt).not.toBeNull()
  })

  it('updates failure reason', () => {
    const run = WorkflowRun.create(projectId, createDto)
    run.update({ status: 'failed', failureReason: 'timeout' })
    expect(run.status).toBe('failed')
    expect(run.failureReason).toBe('timeout')
    expect(run.completedAt).not.toBeNull()
  })

  it('updates currentStageIndex', () => {
    const run = WorkflowRun.create(projectId, createDto)
    run.update({ currentStageIndex: 3 })
    expect(run.currentStageIndex).toBe(3)
  })

  it('sets completedAt on cancelled', () => {
    const run = WorkflowRun.create(projectId, createDto)
    run.update({ status: 'cancelled' })
    expect(run.completedAt).not.toBeNull()
  })
})

describe('StageExecution', () => {
  it('creates with pending status', () => {
    const exec = StageExecution.create('r1', 'wf1', 'Review', 0)
    expect(exec.id).toBeDefined()
    expect(exec.runId).toBe('r1')
    expect(exec.workflowId).toBe('wf1')
    expect(exec.stageName).toBe('Review')
    expect(exec.stageIndex).toBe(0)
    expect(exec.status).toBe('pending')
    expect(exec.assigneeId).toBeNull()
    expect(exec.blockReason).toBeNull()
    expect(exec.startedAt).toBeNull()
    expect(exec.completedAt).toBeNull()
  })

  it('reconstitutes from props', () => {
    const props = {
      id: 'se1',
      runId: 'r1',
      workflowId: 'wf1',
      stageName: 'Deploy',
      stageIndex: 1,
      status: 'running' as const,
      assigneeId: 'a1',
      blockReason: null,
      startedAt: new Date(),
      completedAt: null,
    }
    const exec = StageExecution.reconstitute(props)
    expect(exec.id).toBe('se1')
    expect(exec.status).toBe('running')
    expect(exec.assigneeId).toBe('a1')
  })

  it('advance to running sets startedAt', () => {
    const exec = StageExecution.create('r1', 'wf1', 'Test', 0)
    exec.advance('running')
    expect(exec.status).toBe('running')
    expect(exec.startedAt).not.toBeNull()
  })

  it('advance to completed sets completedAt', () => {
    const exec = StageExecution.create('r1', 'wf1', 'Test', 0)
    exec.advance('running')
    exec.advance('completed')
    expect(exec.status).toBe('completed')
    expect(exec.completedAt).not.toBeNull()
  })

  it('advance to blocked sets blockReason', () => {
    const exec = StageExecution.create('r1', 'wf1', 'Test', 0)
    exec.advance('running')
    exec.advance('blocked', 'Approval pending')
    expect(exec.status).toBe('blocked')
    expect(exec.blockReason).toBe('Approval pending')
  })

  it('advance to failed sets completedAt', () => {
    const exec = StageExecution.create('r1', 'wf1', 'Test', 0)
    exec.advance('running')
    exec.advance('failed')
    expect(exec.completedAt).not.toBeNull()
  })

  it('advance to skipped sets completedAt', () => {
    const exec = StageExecution.create('r1', 'wf1', 'Test', 0)
    exec.advance('skipped')
    expect(exec.completedAt).not.toBeNull()
  })

  it('setAssignee changes assignee', () => {
    const exec = StageExecution.create('r1', 'wf1', 'Test', 0)
    exec.setAssignee('agent-1')
    expect(exec.assigneeId).toBe('agent-1')
    exec.setAssignee(null)
    expect(exec.assigneeId).toBeNull()
  })

  it('does not overwrite startedAt on second running advance', () => {
    const exec = StageExecution.create('r1', 'wf1', 'Test', 0)
    exec.advance('running')
    const first = exec.startedAt
    exec.advance('blocked', 'wait')
    exec.advance('running')
    expect(exec.startedAt).toBe(first)
  })
})

describe('Incident', () => {
  const projectId = 'p1'
  const createDto = {
    entityType: 'workflow' as const,
    entityId: 'wf1',
    severity: 'major' as const,
    title: 'Handoff timeout',
    description: 'Stage 2 timed out waiting for approval',
  }

  it('creates with open status', () => {
    const inc = Incident.create(projectId, createDto)
    expect(inc.id).toBeDefined()
    expect(inc.projectId).toBe(projectId)
    expect(inc.entityType).toBe('workflow')
    expect(inc.entityId).toBe('wf1')
    expect(inc.severity).toBe('major')
    expect(inc.status).toBe('open')
    expect(inc.title).toBe('Handoff timeout')
    expect(inc.resolvedAt).toBeNull()
  })

  it('reconstitutes from props', () => {
    const props = {
      id: 'i1',
      projectId,
      entityType: 'contract' as const,
      entityId: 'c1',
      severity: 'critical' as const,
      status: 'acknowledged' as const,
      title: 'SLA breach',
      description: 'Response time exceeded',
      reportedAt: new Date(),
      resolvedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const inc = Incident.reconstitute(props)
    expect(inc.id).toBe('i1')
    expect(inc.status).toBe('acknowledged')
  })

  it('updates severity and description', () => {
    const inc = Incident.create(projectId, createDto)
    inc.update({ severity: 'critical', description: 'escalated' })
    expect(inc.severity).toBe('critical')
    expect(inc.description).toBe('escalated')
  })

  it('updates status', () => {
    const inc = Incident.create(projectId, createDto)
    inc.update({ status: 'acknowledged' })
    expect(inc.status).toBe('acknowledged')
  })

  it('resolve sets status and resolvedAt', () => {
    const inc = Incident.create(projectId, createDto)
    inc.resolve()
    expect(inc.status).toBe('resolved')
    expect(inc.resolvedAt).not.toBeNull()
  })
})

describe('ContractCompliance', () => {
  const projectId = 'p1'
  const createDto = {
    contractId: 'c1',
    status: 'compliant' as const,
    reason: null as string | null,
  }

  it('creates with given status', () => {
    const cc = ContractCompliance.create(projectId, createDto)
    expect(cc.id).toBeDefined()
    expect(cc.projectId).toBe(projectId)
    expect(cc.contractId).toBe('c1')
    expect(cc.status).toBe('compliant')
    expect(cc.reason).toBeNull()
  })

  it('creates with reason', () => {
    const cc = ContractCompliance.create(projectId, { ...createDto, status: 'at-risk', reason: 'nearing limit' })
    expect(cc.status).toBe('at-risk')
    expect(cc.reason).toBe('nearing limit')
  })

  it('reconstitutes from props', () => {
    const props = {
      id: 'cc1',
      projectId,
      contractId: 'c1',
      status: 'violated' as const,
      reason: 'SLA breach',
      lastCheckedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const cc = ContractCompliance.reconstitute(props)
    expect(cc.id).toBe('cc1')
    expect(cc.status).toBe('violated')
    expect(cc.reason).toBe('SLA breach')
  })

  it('updates status and reason', () => {
    const cc = ContractCompliance.create(projectId, createDto)
    cc.update({ status: 'violated', reason: 'failed' })
    expect(cc.status).toBe('violated')
    expect(cc.reason).toBe('failed')
  })

  it('update refreshes lastCheckedAt', () => {
    const cc = ContractCompliance.create(projectId, createDto)
    const before = cc.lastCheckedAt
    cc.update({ status: 'at-risk' })
    expect(cc.lastCheckedAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
  })
})
