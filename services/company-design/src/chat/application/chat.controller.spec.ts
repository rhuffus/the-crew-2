import 'reflect-metadata'
import { describe, it, expect, beforeEach } from 'vitest'
import { ChatController } from './chat.controller'
import { ChatService } from './chat.service'
import { InMemoryChatRepository } from '../infrastructure/in-memory-chat.repository'

describe('ChatController', () => {
  let controller: ChatController
  let service: ChatService

  beforeEach(() => {
    const repo = new InMemoryChatRepository()
    service = new ChatService(repo)
    controller = new ChatController(service)
  })

  it('GET /threads returns project threads', async () => {
    await service.getOrCreateThread('p1', 'company', null)
    const result = await controller.listThreads('p1')
    expect(result).toHaveLength(1)
    expect(result[0]!.scopeType).toBe('company')
  })

  it('GET /threads/by-scope creates thread on first access', async () => {
    const result = await controller.getOrCreateThread('p1', 'department', 'd1')
    expect(result.scopeType).toBe('department')
    expect(result.entityId).toBe('d1')
  })

  it('GET /threads/by-scope without entityId defaults to null', async () => {
    const result = await controller.getOrCreateThread('p1', 'company')
    expect(result.entityId).toBeNull()
  })

  it('POST /threads/:threadId/messages adds a message', async () => {
    const thread = await service.getOrCreateThread('p1', 'company', null)
    const msg = await controller.sendMessage(thread.id, { content: 'Test message' })
    expect(msg.content).toBe('Test message')
    expect(msg.role).toBe('user')
  })

  it('GET /threads/:threadId/messages returns messages', async () => {
    const thread = await service.getOrCreateThread('p1', 'company', null)
    await service.sendMessage(thread.id, { content: 'Hello' })
    const msgs = await controller.listMessages(thread.id)
    expect(msgs).toHaveLength(1)
  })

  it('GET /threads/:threadId/messages parses limit string', async () => {
    const thread = await service.getOrCreateThread('p1', 'company', null)
    for (let i = 0; i < 5; i++) {
      await service.sendMessage(thread.id, { content: `Msg ${i}` })
    }
    const msgs = await controller.listMessages(thread.id, '2')
    expect(msgs).toHaveLength(2)
  })

  it('DELETE /threads/:threadId removes the thread', async () => {
    const thread = await service.getOrCreateThread('p1', 'company', null)
    await controller.deleteThread(thread.id)
    const threads = await service.listThreads('p1')
    expect(threads).toHaveLength(0)
  })
})
