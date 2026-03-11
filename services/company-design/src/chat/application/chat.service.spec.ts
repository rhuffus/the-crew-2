import 'reflect-metadata'
import { describe, it, expect, beforeEach } from 'vitest'
import { ChatService } from './chat.service'
import { InMemoryChatRepository } from '../infrastructure/in-memory-chat.repository'

describe('ChatService', () => {
  let service: ChatService
  let repo: InMemoryChatRepository

  beforeEach(() => {
    repo = new InMemoryChatRepository()
    service = new ChatService(repo)
  })

  describe('getOrCreateThread', () => {
    it('creates a new thread when none exists', async () => {
      const result = await service.getOrCreateThread('p1', 'company', null)
      expect(result.projectId).toBe('p1')
      expect(result.scopeType).toBe('company')
      expect(result.entityId).toBeNull()
      expect(result.messageCount).toBe(0)
      expect(result.id).toBeDefined()
    })

    it('returns existing thread on second call', async () => {
      const first = await service.getOrCreateThread('p1', 'company', null)
      const second = await service.getOrCreateThread('p1', 'company', null)
      expect(first.id).toBe(second.id)
    })

    it('creates separate threads for different scopes', async () => {
      const company = await service.getOrCreateThread('p1', 'company', null)
      const dept = await service.getOrCreateThread('p1', 'department', 'd1')
      expect(company.id).not.toBe(dept.id)
    })

    it('creates separate threads for different entities', async () => {
      const d1 = await service.getOrCreateThread('p1', 'department', 'd1')
      const d2 = await service.getOrCreateThread('p1', 'department', 'd2')
      expect(d1.id).not.toBe(d2.id)
    })

    it('creates separate threads for different projects', async () => {
      const p1 = await service.getOrCreateThread('p1', 'company', null)
      const p2 = await service.getOrCreateThread('p2', 'company', null)
      expect(p1.id).not.toBe(p2.id)
    })
  })

  describe('sendMessage', () => {
    it('adds a user message to the thread', async () => {
      const thread = await service.getOrCreateThread('p1', 'company', null)
      const msg = await service.sendMessage(thread.id, { content: 'Hello' })
      expect(msg.role).toBe('user')
      expect(msg.content).toBe('Hello')
      expect(msg.threadId).toBe(thread.id)
      expect(msg.entityRefs).toEqual([])
      expect(msg.actions).toEqual([])
    })

    it('includes entity refs when provided', async () => {
      const thread = await service.getOrCreateThread('p1', 'company', null)
      const refs = [{ entityId: 'e1', entityType: 'department' as const, label: 'Engineering' }]
      const msg = await service.sendMessage(thread.id, { content: 'About @Engineering', entityRefs: refs })
      expect(msg.entityRefs).toEqual(refs)
    })

    it('increments message count', async () => {
      const thread = await service.getOrCreateThread('p1', 'company', null)
      await service.sendMessage(thread.id, { content: 'First' })
      await service.sendMessage(thread.id, { content: 'Second' })
      const updated = await service.getOrCreateThread('p1', 'company', null)
      expect(updated.messageCount).toBe(2)
    })

    it('throws for non-existent thread', async () => {
      await expect(service.sendMessage('unknown', { content: 'Hi' })).rejects.toThrow('not found')
    })
  })

  describe('listMessages', () => {
    it('returns messages in chronological order', async () => {
      const thread = await service.getOrCreateThread('p1', 'company', null)
      await service.sendMessage(thread.id, { content: 'First' })
      await service.sendMessage(thread.id, { content: 'Second' })
      const msgs = await service.listMessages(thread.id)
      expect(msgs).toHaveLength(2)
      expect(msgs[0]!.content).toBe('First')
      expect(msgs[1]!.content).toBe('Second')
    })

    it('respects limit', async () => {
      const thread = await service.getOrCreateThread('p1', 'company', null)
      for (let i = 0; i < 5; i++) {
        await service.sendMessage(thread.id, { content: `Msg ${i}` })
      }
      const msgs = await service.listMessages(thread.id, 2)
      expect(msgs).toHaveLength(2)
      expect(msgs[0]!.content).toBe('Msg 3')
      expect(msgs[1]!.content).toBe('Msg 4')
    })

    it('throws for non-existent thread', async () => {
      await expect(service.listMessages('unknown')).rejects.toThrow('not found')
    })

    it('filters by before cursor', async () => {
      const thread = await service.getOrCreateThread('p1', 'company', null)
      const m1 = await service.sendMessage(thread.id, { content: 'First' })
      await service.sendMessage(thread.id, { content: 'Second' })
      const msgs = await service.listMessages(thread.id, 50, m1.createdAt)
      expect(msgs).toHaveLength(0)
    })
  })

  describe('listThreads', () => {
    it('returns all threads for a project', async () => {
      await service.getOrCreateThread('p1', 'company', null)
      await service.getOrCreateThread('p1', 'department', 'd1')
      const threads = await service.listThreads('p1')
      expect(threads).toHaveLength(2)
    })

    it('does not return threads from other projects', async () => {
      await service.getOrCreateThread('p1', 'company', null)
      await service.getOrCreateThread('p2', 'company', null)
      const threads = await service.listThreads('p1')
      expect(threads).toHaveLength(1)
    })
  })

  describe('deleteThread', () => {
    it('deletes an existing thread', async () => {
      const thread = await service.getOrCreateThread('p1', 'company', null)
      await service.deleteThread(thread.id)
      const threads = await service.listThreads('p1')
      expect(threads).toHaveLength(0)
    })

    it('throws for non-existent thread', async () => {
      await expect(service.deleteThread('unknown')).rejects.toThrow('not found')
    })
  })
})
