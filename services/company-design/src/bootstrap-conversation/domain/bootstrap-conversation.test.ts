import { describe, it, expect } from 'vitest'
import { BootstrapConversation } from './bootstrap-conversation'

describe('BootstrapConversation', () => {
  const projectId = 'proj-001'
  const threadId = 'thread-001'
  const ceoAgentId = 'ceo-001'

  describe('create', () => {
    it('should create with not-started status', () => {
      const conv = BootstrapConversation.create(projectId, threadId, ceoAgentId)

      expect(conv.projectId).toBe(projectId)
      expect(conv.threadId).toBe(threadId)
      expect(conv.ceoAgentId).toBe(ceoAgentId)
      expect(conv.status).toBe('not-started')
      expect(conv.id).toBeTruthy()
      expect(conv.createdAt).toBeInstanceOf(Date)
      expect(conv.updatedAt).toBeInstanceOf(Date)
    })

    it('should emit BootstrapConversationCreated event', () => {
      const conv = BootstrapConversation.create(projectId, threadId, ceoAgentId)

      const events = conv.domainEvents
      expect(events).toHaveLength(1)
      expect(events[0]!.eventType).toBe('BootstrapConversationCreated')
      expect(events[0]!.payload).toEqual({ projectId, threadId, ceoAgentId })
    })
  })

  describe('advanceTo', () => {
    it('should advance from not-started to collecting-context', () => {
      const conv = BootstrapConversation.create(projectId, threadId, ceoAgentId)

      conv.advanceTo('collecting-context')

      expect(conv.status).toBe('collecting-context')
    })

    it('should advance through all states in order', () => {
      const conv = BootstrapConversation.create(projectId, threadId, ceoAgentId)

      conv.advanceTo('collecting-context')
      conv.advanceTo('drafting-foundation-docs')
      conv.advanceTo('reviewing-foundation-docs')
      conv.advanceTo('ready-to-grow')
      conv.advanceTo('growth-started')

      expect(conv.status).toBe('growth-started')
    })

    it('should skip intermediate states', () => {
      const conv = BootstrapConversation.create(projectId, threadId, ceoAgentId)

      conv.advanceTo('ready-to-grow')

      expect(conv.status).toBe('ready-to-grow')
    })

    it('should reject backward transitions', () => {
      const conv = BootstrapConversation.create(projectId, threadId, ceoAgentId)
      conv.advanceTo('collecting-context')

      expect(() => conv.advanceTo('not-started')).toThrow('must move forward')
    })

    it('should reject same-state transitions', () => {
      const conv = BootstrapConversation.create(projectId, threadId, ceoAgentId)
      conv.advanceTo('collecting-context')

      expect(() => conv.advanceTo('collecting-context')).toThrow('must move forward')
    })

    it('should emit BootstrapConversationAdvanced event', () => {
      const conv = BootstrapConversation.create(projectId, threadId, ceoAgentId)
      conv.clearEvents()

      conv.advanceTo('collecting-context')

      const events = conv.domainEvents
      expect(events).toHaveLength(1)
      expect(events[0]!.eventType).toBe('BootstrapConversationAdvanced')
      expect(events[0]!.payload).toEqual({
        projectId,
        from: 'not-started',
        to: 'collecting-context',
      })
    })

    it('should update updatedAt timestamp', () => {
      const conv = BootstrapConversation.create(projectId, threadId, ceoAgentId)
      const before = conv.updatedAt

      conv.advanceTo('collecting-context')

      expect(conv.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
    })
  })

  describe('canAdvanceTo', () => {
    it('should return true for forward transitions', () => {
      const conv = BootstrapConversation.create(projectId, threadId, ceoAgentId)

      expect(conv.canAdvanceTo('collecting-context')).toBe(true)
      expect(conv.canAdvanceTo('ready-to-grow')).toBe(true)
    })

    it('should return false for backward transitions', () => {
      const conv = BootstrapConversation.create(projectId, threadId, ceoAgentId)
      conv.advanceTo('collecting-context')

      expect(conv.canAdvanceTo('not-started')).toBe(false)
    })

    it('should return false for same-state', () => {
      const conv = BootstrapConversation.create(projectId, threadId, ceoAgentId)

      expect(conv.canAdvanceTo('not-started')).toBe(false)
    })
  })

  describe('reconstitute', () => {
    it('should restore from props', () => {
      const now = new Date()
      const conv = BootstrapConversation.reconstitute({
        id: 'conv-123',
        projectId,
        threadId,
        ceoAgentId,
        status: 'drafting-foundation-docs',
        createdAt: now,
        updatedAt: now,
      })

      expect(conv.id).toBe('conv-123')
      expect(conv.status).toBe('drafting-foundation-docs')
      expect(conv.projectId).toBe(projectId)
    })
  })
})
