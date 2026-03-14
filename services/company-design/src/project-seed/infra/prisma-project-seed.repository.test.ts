import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'

vi.mock('@prisma/client', () => {
  class MockPrismaClient {
    $connect = vi.fn().mockResolvedValue(undefined)
    $disconnect = vi.fn().mockResolvedValue(undefined)
  }
  return { PrismaClient: MockPrismaClient }
})

import { PrismaProjectSeedRepository } from './prisma-project-seed.repository'
import { CompanyDesignPrismaService } from '../../prisma/company-design-prisma.service'
import { ProjectSeed } from '../domain/project-seed'

interface MockDelegate {
  findUnique: Mock
  upsert: Mock
}

function createMockPrisma() {
  const service = new CompanyDesignPrismaService()
  Object.defineProperty(service, 'projectSeed', {
    value: { findUnique: vi.fn(), upsert: vi.fn() },
    writable: true,
  })
  return service as CompanyDesignPrismaService & { projectSeed: MockDelegate }
}

const now = new Date('2026-01-01T00:00:00Z')
const sampleRow = {
  projectId: 'proj-1',
  name: 'My Startup',
  description: 'A cool startup',
  mission: 'Innovate',
  vision: 'Be the best',
  companyType: 'startup',
  restrictions: [],
  principles: ['quality'],
  aiBudget: { maxMonthlyTokens: null, maxConcurrentAgents: null, costAlertThreshold: null },
  initialObjectives: ['launch'],
  founderPreferences: { approvalLevel: 'structural-only' as const, communicationStyle: 'concise' as const, growthPace: 'moderate' as const },
  maturityPhase: 'seed',
  createdAt: now,
  updatedAt: now,
}

describe('PrismaProjectSeedRepository', () => {
  let repo: PrismaProjectSeedRepository
  let prisma: CompanyDesignPrismaService & { projectSeed: MockDelegate }

  beforeEach(() => {
    prisma = createMockPrisma()
    repo = new PrismaProjectSeedRepository(prisma)
  })

  it('findByProjectId returns domain entity', async () => {
    prisma.projectSeed.findUnique.mockResolvedValue(sampleRow)
    const result = await repo.findByProjectId('proj-1')
    expect(result).not.toBeNull()
    expect(result!.name).toBe('My Startup')
    expect(result!.maturityPhase).toBe('seed')
  })

  it('findByProjectId returns null when not found', async () => {
    prisma.projectSeed.findUnique.mockResolvedValue(null)
    expect(await repo.findByProjectId('missing')).toBeNull()
  })

  it('save upserts by projectId', async () => {
    prisma.projectSeed.upsert.mockResolvedValue(sampleRow)
    const seed = ProjectSeed.reconstitute('proj-1', {
      ...sampleRow,
      aiBudget: sampleRow.aiBudget,
      founderPreferences: sampleRow.founderPreferences,
      maturityPhase: 'seed' as const,
    })
    await repo.save(seed)
    expect(prisma.projectSeed.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { projectId: 'proj-1' } }),
    )
  })
})
