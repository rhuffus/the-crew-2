import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'

vi.mock('@prisma/client', () => {
  class MockPrismaClient {
    $connect = vi.fn().mockResolvedValue(undefined)
    $disconnect = vi.fn().mockResolvedValue(undefined)
  }
  return { PrismaClient: MockPrismaClient }
})

import { PrismaChatRepository } from './prisma-chat.repository'
import { CompanyDesignPrismaService } from '../../prisma/company-design-prisma.service'
import { ChatThread } from '../domain/chat-thread'

interface MockThreadDelegate {
  findFirst: Mock
  findUnique: Mock
  findMany: Mock
  upsert: Mock
  delete: Mock
}

interface MockMessageDelegate {
  findMany: Mock
  createMany: Mock
  deleteMany: Mock
}

function createMockPrisma() {
  const service = new CompanyDesignPrismaService()
  const threadDelegate: MockThreadDelegate = {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    upsert: vi.fn(),
    delete: vi.fn(),
  }
  const messageDelegate: MockMessageDelegate = {
    findMany: vi.fn(),
    createMany: vi.fn(),
    deleteMany: vi.fn(),
  }
  Object.defineProperty(service, 'chatThread', { value: threadDelegate, writable: true })
  Object.defineProperty(service, 'chatMessage', { value: messageDelegate, writable: true })
  Object.defineProperty(service, '$transaction', {
    value: vi.fn(async (fn: (tx: any) => Promise<void>) => {
      await fn({
        chatThread: threadDelegate,
        chatMessage: messageDelegate,
      })
    }),
    writable: true,
  })
  return service as CompanyDesignPrismaService & {
    chatThread: MockThreadDelegate
    chatMessage: MockMessageDelegate
    $transaction: Mock
  }
}

const sampleThreadRow = {
  id: 'thread-1',
  projectId: 'proj-1',
  scopeType: 'project',
  entityId: null,
  title: 'Chat: project',
  createdAt: new Date('2026-01-01T00:00:00Z'),
}

const sampleMessageRow = {
  id: 'msg-1',
  threadId: 'thread-1',
  role: 'user',
  content: 'Hello',
  entityRefs: [],
  actions: [],
  createdAt: new Date('2026-01-01T00:00:00Z'),
}

describe('PrismaChatRepository', () => {
  let repo: PrismaChatRepository
  let prisma: ReturnType<typeof createMockPrisma>

  beforeEach(() => {
    prisma = createMockPrisma()
    repo = new PrismaChatRepository(prisma)
  })

  describe('findByScope', () => {
    it('should return a thread when found', async () => {
      prisma.chatThread.findFirst.mockResolvedValue(sampleThreadRow)
      prisma.chatMessage.findMany.mockResolvedValue([sampleMessageRow])
      const result = await repo.findByScope('proj-1', 'project' as any, null)
      expect(result).not.toBeNull()
      expect(result!.id).toBe('thread-1')
      expect(result!.messages).toHaveLength(1)
    })

    it('should return null when not found', async () => {
      prisma.chatThread.findFirst.mockResolvedValue(null)
      const result = await repo.findByScope('proj-1', 'project' as any, null)
      expect(result).toBeNull()
    })
  })

  describe('findById', () => {
    it('should return a thread by id', async () => {
      prisma.chatThread.findUnique.mockResolvedValue(sampleThreadRow)
      prisma.chatMessage.findMany.mockResolvedValue([])
      const result = await repo.findById('thread-1')
      expect(result).not.toBeNull()
      expect(result!.id).toBe('thread-1')
      expect(result!.messages).toHaveLength(0)
    })

    it('should return null when not found', async () => {
      prisma.chatThread.findUnique.mockResolvedValue(null)
      const result = await repo.findById('missing')
      expect(result).toBeNull()
    })
  })

  describe('listByProject', () => {
    it('should return all threads for project', async () => {
      prisma.chatThread.findMany.mockResolvedValue([sampleThreadRow])
      prisma.chatMessage.findMany.mockResolvedValue([])
      const result = await repo.listByProject('proj-1')
      expect(result).toHaveLength(1)
    })
  })

  describe('save', () => {
    it('should upsert thread and recreate messages in transaction', async () => {
      const thread = ChatThread.create('proj-1', 'project' as any, null)
      thread.addMessage('user' as any, 'Hello')
      await repo.save(thread)
      expect(prisma.$transaction).toHaveBeenCalled()
      expect(prisma.chatThread.upsert).toHaveBeenCalled()
      expect(prisma.chatMessage.deleteMany).toHaveBeenCalledWith({ where: { threadId: thread.id } })
      expect(prisma.chatMessage.createMany).toHaveBeenCalled()
    })

    it('should not createMany when no messages', async () => {
      const thread = ChatThread.create('proj-1', 'project' as any, null)
      await repo.save(thread)
      expect(prisma.chatMessage.createMany).not.toHaveBeenCalled()
    })
  })

  describe('delete', () => {
    it('should delete messages then thread in transaction', async () => {
      await repo.delete('thread-1')
      expect(prisma.$transaction).toHaveBeenCalled()
      expect(prisma.chatMessage.deleteMany).toHaveBeenCalledWith({ where: { threadId: 'thread-1' } })
      expect(prisma.chatThread.delete).toHaveBeenCalledWith({ where: { id: 'thread-1' } })
    })
  })
})
