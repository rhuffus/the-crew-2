import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'

vi.mock('@prisma/client', () => {
  class MockPrismaClient {
    $connect = vi.fn().mockResolvedValue(undefined)
    $disconnect = vi.fn().mockResolvedValue(undefined)
  }
  return { PrismaClient: MockPrismaClient }
})

import { PrismaBootstrapConversationRepository } from './prisma-bootstrap-conversation.repository'
import { CompanyDesignPrismaService } from '../../prisma/company-design-prisma.service'
import { BootstrapConversation } from '../domain/bootstrap-conversation'

interface MockDelegate {
  findUnique: Mock
  upsert: Mock
}

function createMockPrisma() {
  const service = new CompanyDesignPrismaService()
  Object.defineProperty(service, 'bootstrapConversation', {
    value: { findUnique: vi.fn(), upsert: vi.fn() },
    writable: true,
  })
  return service as CompanyDesignPrismaService & { bootstrapConversation: MockDelegate }
}

const now = new Date('2026-01-01T00:00:00Z')
const sampleRow = {
  id: 'conv-1',
  projectId: 'proj-1',
  threadId: 'thread-1',
  ceoAgentId: 'agent-1',
  status: 'collecting-context',
  createdAt: now,
  updatedAt: now,
}

describe('PrismaBootstrapConversationRepository', () => {
  let repo: PrismaBootstrapConversationRepository
  let prisma: CompanyDesignPrismaService & { bootstrapConversation: MockDelegate }

  beforeEach(() => {
    prisma = createMockPrisma()
    repo = new PrismaBootstrapConversationRepository(prisma)
  })

  it('findByProjectId returns domain entity', async () => {
    prisma.bootstrapConversation.findUnique.mockResolvedValue(sampleRow)
    const result = await repo.findByProjectId('proj-1')
    expect(result).not.toBeNull()
    expect(result!.status).toBe('collecting-context')
  })

  it('findByProjectId returns null when not found', async () => {
    prisma.bootstrapConversation.findUnique.mockResolvedValue(null)
    expect(await repo.findByProjectId('missing')).toBeNull()
  })

  it('findById returns domain entity', async () => {
    prisma.bootstrapConversation.findUnique.mockResolvedValue(sampleRow)
    const result = await repo.findById('conv-1')
    expect(result).not.toBeNull()
    expect(result!.id).toBe('conv-1')
  })

  it('save upserts the conversation', async () => {
    prisma.bootstrapConversation.upsert.mockResolvedValue(sampleRow)
    const conv = BootstrapConversation.reconstitute({
      ...sampleRow,
      status: 'collecting-context' as const,
    })
    await repo.save(conv)
    expect(prisma.bootstrapConversation.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'conv-1' } }),
    )
  })
})
