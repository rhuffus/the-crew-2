import { describe, it, expect, beforeEach } from 'vitest'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { RuntimeService } from './runtime.service'
import { RuntimeStatusProjector } from './runtime-status.projector'
import { InMemoryRuntimeExecutionRepository } from '../infra/in-memory-runtime-execution.repository'
import { InMemoryRuntimeEventRepository } from '../infra/in-memory-runtime-event.repository'

describe('RuntimeService', () => {
  let service: RuntimeService
  let executionRepo: InMemoryRuntimeExecutionRepository
  let eventRepo: InMemoryRuntimeEventRepository
  let eventEmitter: EventEmitter2
  let projector: RuntimeStatusProjector

  const projectId = 'p1'

  beforeEach(() => {
    executionRepo = new InMemoryRuntimeExecutionRepository()
    eventRepo = new InMemoryRuntimeEventRepository()
    eventEmitter = new EventEmitter2()
    projector = new RuntimeStatusProjector(executionRepo, eventRepo)
    service = new RuntimeService(executionRepo, eventRepo, eventEmitter, projector)
  })

  describe('createExecution', () => {
    it('creates a workflow-run execution and emits event', async () => {
      const events: unknown[] = []
      eventEmitter.on('runtime.event', (e: unknown) => events.push(e))

      const dto = await service.createExecution(projectId, {
        executionType: 'workflow-run',
        workflowId: 'wf-1',
        input: { trigger: 'manual' },
      })

      expect(dto.id).toBeDefined()
      expect(dto.projectId).toBe(projectId)
      expect(dto.executionType).toBe('workflow-run')
      expect(dto.status).toBe('pending')
      expect(dto.workflowId).toBe('wf-1')

      // Should emit an execution-started event
      expect(events).toHaveLength(1)
    })

    it('creates an agent-task execution', async () => {
      const dto = await service.createExecution(projectId, {
        executionType: 'agent-task',
        agentId: 'agent-1',
      })
      expect(dto.executionType).toBe('agent-task')
      expect(dto.agentId).toBe('agent-1')
    })
  })

  describe('getExecution', () => {
    it('returns null for nonexistent execution', async () => {
      const result = await service.getExecution('nonexistent')
      expect(result).toBeNull()
    })

    it('returns execution by id', async () => {
      const created = await service.createExecution(projectId, {
        executionType: 'agent-task',
        agentId: 'a1',
      })
      const fetched = await service.getExecution(created.id)
      expect(fetched).not.toBeNull()
      expect(fetched!.id).toBe(created.id)
    })
  })

  describe('updateExecution', () => {
    it('transitions status and emits event', async () => {
      const events: unknown[] = []
      eventEmitter.on('runtime.event', (e: unknown) => events.push(e))

      const created = await service.createExecution(projectId, {
        executionType: 'agent-task',
        agentId: 'a1',
      })
      events.length = 0 // clear creation event

      const updated = await service.updateExecution(created.id, { status: 'running' })
      expect(updated!.status).toBe('running')
      expect(updated!.startedAt).not.toBeNull()
      expect(events.length).toBeGreaterThanOrEqual(1)
    })

    it('returns null for nonexistent execution', async () => {
      const result = await service.updateExecution('nonexistent', { status: 'running' })
      expect(result).toBeNull()
    })

    it('adds cost to execution', async () => {
      const created = await service.createExecution(projectId, {
        executionType: 'agent-task',
        agentId: 'a1',
      })
      const updated = await service.updateExecution(created.id, { addCost: 5.0 })
      expect(updated!.aiCost).toBe(5.0)
    })
  })

  describe('listExecutions', () => {
    it('lists executions by project', async () => {
      await service.createExecution(projectId, {
        executionType: 'agent-task',
        agentId: 'a1',
      })
      await service.createExecution(projectId, {
        executionType: 'workflow-run',
        workflowId: 'wf1',
      })
      await service.createExecution('other-project', {
        executionType: 'agent-task',
        agentId: 'a2',
      })

      const executions = await service.listExecutions(projectId)
      expect(executions).toHaveLength(2)
    })
  })

  describe('emitRuntimeEvent', () => {
    it('creates and emits an event', async () => {
      const emitted: unknown[] = []
      eventEmitter.on('runtime.event', (e: unknown) => emitted.push(e))

      const event = await service.emitRuntimeEvent(projectId, {
        eventType: 'incident-detected',
        severity: 'error',
        title: 'API failure',
        description: 'External API is down',
        sourceEntityType: 'specialist-agent',
        sourceEntityId: 'agent-5',
      })

      expect(event.id).toBeDefined()
      expect(event.eventType).toBe('incident-detected')
      expect(event.severity).toBe('error')
      expect(emitted).toHaveLength(1)
    })
  })

  describe('listEvents', () => {
    it('lists events by project with pagination', async () => {
      for (let i = 0; i < 5; i++) {
        await service.emitRuntimeEvent(projectId, {
          eventType: 'agent-activated',
          severity: 'info',
          title: `Agent ${i} activated`,
          description: '',
          sourceEntityType: 'agent',
          sourceEntityId: `a${i}`,
        })
      }

      const all = await service.listEvents(projectId, 50)
      expect(all).toHaveLength(5)

      const limited = await service.listEvents(projectId, 3)
      expect(limited).toHaveLength(3)
    })
  })

  describe('listEventsByEntity', () => {
    it('filters events by entity id', async () => {
      await service.emitRuntimeEvent(projectId, {
        eventType: 'agent-activated',
        severity: 'info',
        title: 'Agent A activated',
        description: '',
        sourceEntityType: 'agent',
        sourceEntityId: 'a1',
      })
      await service.emitRuntimeEvent(projectId, {
        eventType: 'agent-activated',
        severity: 'info',
        title: 'Agent B activated',
        description: '',
        sourceEntityType: 'agent',
        sourceEntityId: 'a2',
      })

      const events = await service.listEventsByEntity('a1')
      expect(events).toHaveLength(1)
      expect(events[0]!.sourceEntityId).toBe('a1')
    })
  })

  describe('getStatus', () => {
    it('returns empty status for project with no executions', async () => {
      const status = await service.getStatus(projectId)
      expect(status.projectId).toBe(projectId)
      expect(status.nodeStatuses).toEqual([])
      expect(status.summary.activeExecutionCount).toBe(0)
    })

    it('returns node statuses for active executions', async () => {
      await service.createExecution(projectId, {
        executionType: 'agent-task',
        agentId: 'a1',
      })
      const created = await service.createExecution(projectId, {
        executionType: 'workflow-run',
        workflowId: 'wf1',
      })
      await service.updateExecution(created.id, { status: 'running' })

      const status = await service.getStatus(projectId)
      expect(status.nodeStatuses.length).toBeGreaterThanOrEqual(1)
      expect(status.summary.activeExecutionCount).toBeGreaterThan(0)
    })
  })

  describe('getCostSummary', () => {
    it('returns zero cost for empty project', async () => {
      const cost = await service.getCostSummary(projectId)
      expect(cost.projectId).toBe(projectId)
      expect(cost.totalCost).toBe(0)
      expect(cost.costByAgent).toEqual([])
    })

    it('aggregates cost across executions', async () => {
      const e1 = await service.createExecution(projectId, {
        executionType: 'agent-task',
        agentId: 'a1',
      })
      await service.updateExecution(e1.id, { addCost: 3.0 })

      const e2 = await service.createExecution(projectId, {
        executionType: 'agent-task',
        agentId: 'a1',
      })
      await service.updateExecution(e2.id, { addCost: 2.0 })

      const cost = await service.getCostSummary(projectId)
      expect(cost.totalCost).toBe(5.0)
      expect(cost.costByAgent).toHaveLength(1)
      expect(cost.costByAgent[0]!.cost).toBe(5.0)
    })
  })

  describe('getEventStream', () => {
    it('emits events matching project via observable', async () => {
      const received: unknown[] = []
      const sub = service.getEventStream(projectId).subscribe(e => received.push(e))

      await service.emitRuntimeEvent(projectId, {
        eventType: 'agent-activated',
        severity: 'info',
        title: 'Test',
        description: '',
        sourceEntityType: 'agent',
        sourceEntityId: 'a1',
      })

      // Event from different project should not be received
      await service.emitRuntimeEvent('other', {
        eventType: 'agent-activated',
        severity: 'info',
        title: 'Other',
        description: '',
        sourceEntityType: 'agent',
        sourceEntityId: 'a2',
      })

      expect(received).toHaveLength(1)
      sub.unsubscribe()
    })

    it('filters by scope and entity', async () => {
      const received: unknown[] = []
      const sub = service.getEventStream(projectId, 'agent', 'a1').subscribe(e => received.push(e))

      await service.emitRuntimeEvent(projectId, {
        eventType: 'agent-activated',
        severity: 'info',
        title: 'Agent A1',
        description: '',
        sourceEntityType: 'agent',
        sourceEntityId: 'a1',
      })

      await service.emitRuntimeEvent(projectId, {
        eventType: 'agent-activated',
        severity: 'info',
        title: 'Agent A2',
        description: '',
        sourceEntityType: 'agent',
        sourceEntityId: 'a2',
      })

      expect(received).toHaveLength(1)
      sub.unsubscribe()
    })
  })
})
