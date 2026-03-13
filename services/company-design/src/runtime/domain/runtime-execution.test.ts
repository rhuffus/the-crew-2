import { describe, it, expect } from 'vitest'
import { RuntimeExecution } from './runtime-execution'

describe('RuntimeExecution', () => {
  const projectId = 'p1'

  describe('create', () => {
    it('creates a workflow-run execution with pending status', () => {
      const exec = RuntimeExecution.create(projectId, {
        executionType: 'workflow-run',
        workflowId: 'wf1',
        input: { trigger: 'manual' },
      })
      expect(exec.id).toBeDefined()
      expect(exec.projectId).toBe(projectId)
      expect(exec.executionType).toBe('workflow-run')
      expect(exec.workflowId).toBe('wf1')
      expect(exec.agentId).toBeNull()
      expect(exec.status).toBe('pending')
      expect(exec.startedAt).toBeNull()
      expect(exec.completedAt).toBeNull()
      expect(exec.input).toEqual({ trigger: 'manual' })
      expect(exec.output).toBeNull()
      expect(exec.errors).toEqual([])
      expect(exec.waitingFor).toBeNull()
      expect(exec.approvals).toEqual([])
      expect(exec.aiCost).toBe(0)
      expect(exec.logSummary).toBe('')
      expect(exec.parentExecutionId).toBeNull()
      expect(exec.operationsRunId).toBeNull()
    })

    it('creates an agent-task execution', () => {
      const exec = RuntimeExecution.create(projectId, {
        executionType: 'agent-task',
        agentId: 'agent-1',
      })
      expect(exec.executionType).toBe('agent-task')
      expect(exec.agentId).toBe('agent-1')
      expect(exec.workflowId).toBeNull()
    })

    it('throws if workflow-run has no workflowId', () => {
      expect(() =>
        RuntimeExecution.create(projectId, { executionType: 'workflow-run' }),
      ).toThrow('workflowId is required')
    })

    it('throws if agent-task has no agentId', () => {
      expect(() =>
        RuntimeExecution.create(projectId, { executionType: 'agent-task' }),
      ).toThrow('agentId is required')
    })

    it('sets parentExecutionId when provided', () => {
      const exec = RuntimeExecution.create(projectId, {
        executionType: 'agent-task',
        agentId: 'agent-1',
        parentExecutionId: 'parent-1',
      })
      expect(exec.parentExecutionId).toBe('parent-1')
    })
  })

  describe('reconstitute', () => {
    it('reconstitutes from props', () => {
      const now = new Date()
      const exec = RuntimeExecution.reconstitute({
        id: 'exec-1',
        projectId,
        executionType: 'workflow-run',
        workflowId: 'wf1',
        agentId: null,
        status: 'running',
        startedAt: now,
        completedAt: null,
        input: {},
        output: null,
        errors: [],
        waitingFor: null,
        approvals: [],
        aiCost: 5.0,
        logSummary: 'test',
        parentExecutionId: null,
        operationsRunId: 'run-1',
        createdAt: now,
        updatedAt: now,
      })
      expect(exec.id).toBe('exec-1')
      expect(exec.status).toBe('running')
      expect(exec.aiCost).toBe(5.0)
      expect(exec.operationsRunId).toBe('run-1')
    })
  })

  describe('status transitions', () => {
    it('transitions pending → running and sets startedAt', () => {
      const exec = RuntimeExecution.create(projectId, {
        executionType: 'agent-task',
        agentId: 'a1',
      })
      exec.update({ status: 'running' })
      expect(exec.status).toBe('running')
      expect(exec.startedAt).not.toBeNull()
    })

    it('transitions running → completed and sets completedAt', () => {
      const exec = RuntimeExecution.create(projectId, {
        executionType: 'agent-task',
        agentId: 'a1',
      })
      exec.update({ status: 'running' })
      exec.update({ status: 'completed', output: { result: 'done' } })
      expect(exec.status).toBe('completed')
      expect(exec.completedAt).not.toBeNull()
      expect(exec.output).toEqual({ result: 'done' })
    })

    it('transitions running → failed', () => {
      const exec = RuntimeExecution.create(projectId, {
        executionType: 'agent-task',
        agentId: 'a1',
      })
      exec.update({ status: 'running' })
      exec.update({ status: 'failed' })
      expect(exec.status).toBe('failed')
      expect(exec.completedAt).not.toBeNull()
    })

    it('transitions running → waiting with waitingFor', () => {
      const exec = RuntimeExecution.create(projectId, {
        executionType: 'agent-task',
        agentId: 'a1',
      })
      exec.update({ status: 'running' })
      exec.update({ status: 'waiting', waitingFor: 'approval' })
      expect(exec.status).toBe('waiting')
      expect(exec.waitingFor).toBe('approval')
    })

    it('transitions waiting → blocked', () => {
      const exec = RuntimeExecution.create(projectId, {
        executionType: 'agent-task',
        agentId: 'a1',
      })
      exec.update({ status: 'running' })
      exec.update({ status: 'waiting', waitingFor: 'review' })
      exec.update({ status: 'blocked', waitingFor: 'external dependency' })
      expect(exec.status).toBe('blocked')
      expect(exec.waitingFor).toBe('external dependency')
    })

    it('transitions waiting → running clears waitingFor', () => {
      const exec = RuntimeExecution.create(projectId, {
        executionType: 'agent-task',
        agentId: 'a1',
      })
      exec.update({ status: 'running' })
      exec.update({ status: 'waiting', waitingFor: 'review' })
      exec.update({ status: 'running' })
      expect(exec.status).toBe('running')
      expect(exec.waitingFor).toBeNull()
    })

    it('rejects invalid transition: pending → completed', () => {
      const exec = RuntimeExecution.create(projectId, {
        executionType: 'agent-task',
        agentId: 'a1',
      })
      expect(() => exec.update({ status: 'completed' })).toThrow('Invalid status transition')
    })

    it('rejects invalid transition: completed → running', () => {
      const exec = RuntimeExecution.create(projectId, {
        executionType: 'agent-task',
        agentId: 'a1',
      })
      exec.update({ status: 'running' })
      exec.update({ status: 'completed' })
      expect(() => exec.update({ status: 'running' })).toThrow('Invalid status transition')
    })

    it('transitions pending → cancelled', () => {
      const exec = RuntimeExecution.create(projectId, {
        executionType: 'agent-task',
        agentId: 'a1',
      })
      exec.update({ status: 'cancelled' })
      expect(exec.status).toBe('cancelled')
      expect(exec.completedAt).not.toBeNull()
    })
  })

  describe('errors', () => {
    it('adds errors', () => {
      const exec = RuntimeExecution.create(projectId, {
        executionType: 'agent-task',
        agentId: 'a1',
      })
      exec.update({
        addError: {
          message: 'timeout',
          occurredAt: new Date().toISOString(),
          severity: 'error',
          context: null,
        },
      })
      expect(exec.errors).toHaveLength(1)
      expect(exec.errors[0]!.message).toBe('timeout')
    })
  })

  describe('approvals', () => {
    it('adds approval and resolves it', () => {
      const exec = RuntimeExecution.create(projectId, {
        executionType: 'agent-task',
        agentId: 'a1',
      })
      exec.update({
        addApproval: {
          requestedAt: new Date().toISOString(),
          subject: 'budget increase',
          status: 'pending',
        },
      })
      expect(exec.approvals).toHaveLength(1)
      expect(exec.approvals[0]!.status).toBe('pending')

      exec.update({
        resolveApproval: {
          subject: 'budget increase',
          status: 'approved',
          approvedBy: 'user-1',
        },
      })
      expect(exec.approvals[0]!.status).toBe('approved')
      expect(exec.approvals[0]!.approvedBy).toBe('user-1')
    })
  })

  describe('cost', () => {
    it('accumulates cost', () => {
      const exec = RuntimeExecution.create(projectId, {
        executionType: 'agent-task',
        agentId: 'a1',
      })
      exec.update({ addCost: 1.5 })
      exec.update({ addCost: 2.3 })
      expect(exec.aiCost).toBeCloseTo(3.8)
    })

    it('ignores zero or negative cost', () => {
      const exec = RuntimeExecution.create(projectId, {
        executionType: 'agent-task',
        agentId: 'a1',
      })
      exec.update({ addCost: 0 })
      exec.update({ addCost: -1 })
      expect(exec.aiCost).toBe(0)
    })
  })

  describe('logSummary', () => {
    it('updates logSummary', () => {
      const exec = RuntimeExecution.create(projectId, {
        executionType: 'agent-task',
        agentId: 'a1',
      })
      exec.update({ logSummary: 'Processed 10 items' })
      expect(exec.logSummary).toBe('Processed 10 items')
    })
  })
})
