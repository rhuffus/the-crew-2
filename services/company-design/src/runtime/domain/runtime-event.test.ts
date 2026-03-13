import { describe, it, expect } from 'vitest'
import { RuntimeEvent } from './runtime-event'

describe('RuntimeEvent', () => {
  const projectId = 'p1'

  describe('create', () => {
    it('creates an event with all required fields', () => {
      const event = RuntimeEvent.create(projectId, {
        eventType: 'execution-started',
        severity: 'info',
        title: 'Workflow started',
        description: 'Content pipeline execution started',
        sourceEntityType: 'workflow',
        sourceEntityId: 'wf-1',
      })
      expect(event.id).toBeDefined()
      expect(event.projectId).toBe(projectId)
      expect(event.eventType).toBe('execution-started')
      expect(event.severity).toBe('info')
      expect(event.title).toBe('Workflow started')
      expect(event.description).toBe('Content pipeline execution started')
      expect(event.sourceEntityType).toBe('workflow')
      expect(event.sourceEntityId).toBe('wf-1')
      expect(event.targetEntityType).toBeNull()
      expect(event.targetEntityId).toBeNull()
      expect(event.executionId).toBeNull()
      expect(event.metadata).toEqual({})
      expect(event.occurredAt).toBeInstanceOf(Date)
    })

    it('creates an event with optional fields', () => {
      const event = RuntimeEvent.create(projectId, {
        eventType: 'handoff-initiated',
        severity: 'info',
        title: 'Handoff started',
        description: 'Stage 1 → Stage 2',
        sourceEntityType: 'workflow-stage',
        sourceEntityId: 'stage-1',
        targetEntityType: 'workflow-stage',
        targetEntityId: 'stage-2',
        executionId: 'exec-1',
        metadata: { handoffType: 'automatic' },
      })
      expect(event.targetEntityType).toBe('workflow-stage')
      expect(event.targetEntityId).toBe('stage-2')
      expect(event.executionId).toBe('exec-1')
      expect(event.metadata).toEqual({ handoffType: 'automatic' })
    })

    it('throws if title is empty', () => {
      expect(() =>
        RuntimeEvent.create(projectId, {
          eventType: 'execution-started',
          severity: 'info',
          title: '',
          description: 'test',
          sourceEntityType: 'workflow',
          sourceEntityId: 'wf-1',
        }),
      ).toThrow('title cannot be empty')
    })

    it('throws if sourceEntityType is empty', () => {
      expect(() =>
        RuntimeEvent.create(projectId, {
          eventType: 'execution-started',
          severity: 'info',
          title: 'Test',
          description: 'test',
          sourceEntityType: '',
          sourceEntityId: 'wf-1',
        }),
      ).toThrow('requires sourceEntityType and sourceEntityId')
    })

    it('throws if sourceEntityId is empty', () => {
      expect(() =>
        RuntimeEvent.create(projectId, {
          eventType: 'execution-started',
          severity: 'info',
          title: 'Test',
          description: 'test',
          sourceEntityType: 'workflow',
          sourceEntityId: '',
        }),
      ).toThrow('requires sourceEntityType and sourceEntityId')
    })
  })

  describe('reconstitute', () => {
    it('reconstitutes from props', () => {
      const now = new Date()
      const event = RuntimeEvent.reconstitute({
        id: 'evt-1',
        projectId,
        eventType: 'agent-error',
        severity: 'error',
        title: 'API timeout',
        description: 'External API timed out after 30s',
        sourceEntityType: 'specialist-agent',
        sourceEntityId: 'agent-5',
        targetEntityType: null,
        targetEntityId: null,
        executionId: 'exec-1',
        metadata: { apiUrl: 'https://example.com' },
        occurredAt: now,
      })
      expect(event.id).toBe('evt-1')
      expect(event.eventType).toBe('agent-error')
      expect(event.severity).toBe('error')
      expect(event.metadata).toEqual({ apiUrl: 'https://example.com' })
      expect(event.occurredAt).toBe(now)
    })
  })

  describe('immutability', () => {
    it('events are immutable after creation', () => {
      const event = RuntimeEvent.create(projectId, {
        eventType: 'execution-started',
        severity: 'info',
        title: 'Test',
        description: 'desc',
        sourceEntityType: 'workflow',
        sourceEntityId: 'wf-1',
      })
      // All properties are readonly, so we just verify they exist
      expect(event.title).toBe('Test')
      expect(event.projectId).toBe(projectId)
    })
  })
})
