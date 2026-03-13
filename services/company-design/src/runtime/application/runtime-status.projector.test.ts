import { describe, it, expect, beforeEach } from 'vitest'
import { RuntimeStatusProjector } from './runtime-status.projector'
import { RuntimeExecution } from '../domain/runtime-execution'
import { RuntimeEvent } from '../domain/runtime-event'
import { InMemoryRuntimeExecutionRepository } from '../infra/in-memory-runtime-execution.repository'
import { InMemoryRuntimeEventRepository } from '../infra/in-memory-runtime-event.repository'

describe('RuntimeStatusProjector', () => {
  let projector: RuntimeStatusProjector
  let executionRepo: InMemoryRuntimeExecutionRepository
  let eventRepo: InMemoryRuntimeEventRepository
  const projectId = 'p1'

  beforeEach(() => {
    executionRepo = new InMemoryRuntimeExecutionRepository()
    eventRepo = new InMemoryRuntimeEventRepository()
    projector = new RuntimeStatusProjector(executionRepo, eventRepo)
  })

  describe('computeNodeStatus', () => {
    it('returns idle when no executions exist', async () => {
      const status = await projector.computeNodeStatus('a1', 'agent')
      expect(status.state).toBe('idle')
      expect(status.badges).toEqual([])
      expect(status.lastEventAt).toBeNull()
    })

    it('returns active when execution is running', async () => {
      const exec = RuntimeExecution.create(projectId, {
        executionType: 'agent-task',
        agentId: 'a1',
      })
      exec.update({ status: 'running' })
      await executionRepo.save(exec)

      const status = await projector.computeNodeStatus('a1', 'agent')
      expect(status.state).toBe('active')
      expect(status.badges.some(b => b.type === 'running')).toBe(true)
    })

    it('returns waiting when execution is waiting', async () => {
      const exec = RuntimeExecution.create(projectId, {
        executionType: 'agent-task',
        agentId: 'a1',
      })
      exec.update({ status: 'running' })
      exec.update({ status: 'waiting', waitingFor: 'approval' })
      await executionRepo.save(exec)

      const status = await projector.computeNodeStatus('a1', 'agent')
      expect(status.state).toBe('waiting')
      expect(status.badges.some(b => b.type === 'waiting')).toBe(true)
    })

    it('returns blocked when execution is blocked', async () => {
      const exec = RuntimeExecution.create(projectId, {
        executionType: 'agent-task',
        agentId: 'a1',
      })
      exec.update({ status: 'running' })
      exec.update({ status: 'waiting' })
      exec.update({ status: 'blocked' })
      await executionRepo.save(exec)

      const status = await projector.computeNodeStatus('a1', 'agent')
      expect(status.state).toBe('blocked')
      expect(status.badges.some(b => b.type === 'blocked')).toBe(true)
    })

    it('returns error when execution has failed', async () => {
      const exec = RuntimeExecution.create(projectId, {
        executionType: 'agent-task',
        agentId: 'a1',
      })
      exec.update({ status: 'running' })
      exec.update({ status: 'failed' })
      await executionRepo.save(exec)

      const status = await projector.computeNodeStatus('a1', 'agent')
      expect(status.badges.some(b => b.type === 'error')).toBe(true)
    })

    it('escalates: error > blocked > active', async () => {
      const running = RuntimeExecution.create(projectId, {
        executionType: 'agent-task',
        agentId: 'a1',
      })
      running.update({ status: 'running' })
      await executionRepo.save(running)

      const blocked = RuntimeExecution.create(projectId, {
        executionType: 'agent-task',
        agentId: 'a1',
      })
      blocked.update({ status: 'running' })
      blocked.update({ status: 'waiting' })
      blocked.update({ status: 'blocked' })
      await executionRepo.save(blocked)

      const status = await projector.computeNodeStatus('a1', 'agent')
      expect(status.state).toBe('blocked')
    })

    it('includes cost badge when cost > 0', async () => {
      const exec = RuntimeExecution.create(projectId, {
        executionType: 'agent-task',
        agentId: 'a1',
      })
      exec.update({ addCost: 15 })
      await executionRepo.save(exec)

      const status = await projector.computeNodeStatus('a1', 'agent')
      expect(status.badges.some(b => b.type === 'cost')).toBe(true)
    })

    it('includes lastEventAt from latest event', async () => {
      const event = RuntimeEvent.create(projectId, {
        eventType: 'agent-activated',
        severity: 'info',
        title: 'Active',
        description: '',
        sourceEntityType: 'agent',
        sourceEntityId: 'a1',
      })
      await eventRepo.append(event)

      const status = await projector.computeNodeStatus('a1', 'agent')
      expect(status.lastEventAt).not.toBeNull()
    })
  })

  describe('computeProjectSummary', () => {
    it('returns zero counts for empty project', async () => {
      const summary = await projector.computeProjectSummary(projectId)
      expect(summary.activeExecutionCount).toBe(0)
      expect(summary.blockedExecutionCount).toBe(0)
      expect(summary.failedExecutionCount).toBe(0)
      expect(summary.pendingApprovalCount).toBe(0)
      expect(summary.totalCostCurrentPeriod).toBe(0)
    })

    it('counts active and failed executions', async () => {
      const exec1 = RuntimeExecution.create(projectId, {
        executionType: 'agent-task',
        agentId: 'a1',
      })
      exec1.update({ status: 'running' })
      await executionRepo.save(exec1)

      const exec2 = RuntimeExecution.create(projectId, {
        executionType: 'agent-task',
        agentId: 'a2',
      })
      exec2.update({ status: 'running' })
      exec2.update({ status: 'failed' })
      await executionRepo.save(exec2)

      const summary = await projector.computeProjectSummary(projectId)
      expect(summary.activeExecutionCount).toBe(1)
      expect(summary.failedExecutionCount).toBe(1)
    })

    it('counts pending approvals', async () => {
      const exec = RuntimeExecution.create(projectId, {
        executionType: 'agent-task',
        agentId: 'a1',
      })
      exec.update({
        addApproval: {
          requestedAt: new Date().toISOString(),
          subject: 'test',
          status: 'pending',
        },
      })
      await executionRepo.save(exec)

      const summary = await projector.computeProjectSummary(projectId)
      expect(summary.pendingApprovalCount).toBe(1)
    })

    it('sums cost', async () => {
      const exec1 = RuntimeExecution.create(projectId, {
        executionType: 'agent-task',
        agentId: 'a1',
      })
      exec1.update({ addCost: 3 })
      await executionRepo.save(exec1)

      const exec2 = RuntimeExecution.create(projectId, {
        executionType: 'agent-task',
        agentId: 'a2',
      })
      exec2.update({ addCost: 7 })
      await executionRepo.save(exec2)

      const summary = await projector.computeProjectSummary(projectId)
      expect(summary.totalCostCurrentPeriod).toBe(10)
    })
  })
})
