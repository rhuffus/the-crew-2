import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'

vi.mock('@prisma/client', () => {
  class MockPrismaClient {
    $connect = vi.fn().mockResolvedValue(undefined)
    $disconnect = vi.fn().mockResolvedValue(undefined)
  }
  return { PrismaClient: MockPrismaClient, Prisma: { JsonNull: 'DbNull' } }
})

import { PrismaLcpAgentRepository } from './prisma-lcp-agent.repository'
import { CompanyDesignPrismaService } from '../../prisma/company-design-prisma.service'
import { LcpAgent } from '../domain/lcp-agent'

interface MockDelegate {
  findUnique: Mock
  findMany: Mock
  upsert: Mock
  delete: Mock
}

function createMockPrisma() {
  const service = new CompanyDesignPrismaService()
  Object.defineProperty(service, 'lcpAgent', {
    value: { findUnique: vi.fn(), findMany: vi.fn(), upsert: vi.fn(), delete: vi.fn() },
    writable: true,
  })
  return service as CompanyDesignPrismaService & { lcpAgent: MockDelegate }
}

const now = new Date('2026-01-01T00:00:00Z')
const sampleRow = {
  id: 'agent-1',
  projectId: 'proj-1',
  name: 'CEO Agent',
  description: 'Chief executive officer',
  agentType: 'coordinator',
  uoId: 'uo-1',
  role: 'lead',
  skills: [{ name: 'planning', description: 'Strategic planning', category: 'management' }],
  inputs: ['context'],
  outputs: ['decisions'],
  responsibilities: ['oversight'],
  budget: { maxMonthlyTokens: null, maxConcurrentTasks: null, costLimit: 10 },
  contextWindow: 8000,
  status: 'active',
  systemPromptRef: null,
  createdAt: now,
  updatedAt: now,
}

describe('PrismaLcpAgentRepository', () => {
  let repo: PrismaLcpAgentRepository
  let prisma: CompanyDesignPrismaService & { lcpAgent: MockDelegate }

  beforeEach(() => {
    prisma = createMockPrisma()
    repo = new PrismaLcpAgentRepository(prisma)
  })

  it('findById returns domain entity', async () => {
    prisma.lcpAgent.findUnique.mockResolvedValue(sampleRow)
    const result = await repo.findById('agent-1')
    expect(result).not.toBeNull()
    expect(result!.name).toBe('CEO Agent')
    expect(result!.agentType).toBe('coordinator')
  })

  it('findById returns null when not found', async () => {
    prisma.lcpAgent.findUnique.mockResolvedValue(null)
    expect(await repo.findById('missing')).toBeNull()
  })

  it('findByProjectId returns array', async () => {
    prisma.lcpAgent.findMany.mockResolvedValue([sampleRow])
    const results = await repo.findByProjectId('proj-1')
    expect(results).toHaveLength(1)
  })

  it('save upserts the agent', async () => {
    prisma.lcpAgent.upsert.mockResolvedValue(sampleRow)
    const agent = LcpAgent.reconstitute('agent-1', {
      ...sampleRow,
      agentType: 'coordinator' as const,
      status: 'active' as const,
      skills: sampleRow.skills,
      budget: sampleRow.budget,
    })
    await repo.save(agent)
    expect(prisma.lcpAgent.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'agent-1' } }),
    )
  })

  it('delete removes by id', async () => {
    prisma.lcpAgent.delete.mockResolvedValue(sampleRow)
    await repo.delete('agent-1')
    expect(prisma.lcpAgent.delete).toHaveBeenCalledWith({ where: { id: 'agent-1' } })
  })
})
