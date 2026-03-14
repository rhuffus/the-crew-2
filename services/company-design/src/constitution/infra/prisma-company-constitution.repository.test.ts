import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'

vi.mock('@prisma/client', () => {
  class MockPrismaClient {
    $connect = vi.fn().mockResolvedValue(undefined)
    $disconnect = vi.fn().mockResolvedValue(undefined)
  }
  return { PrismaClient: MockPrismaClient }
})

import { PrismaCompanyConstitutionRepository } from './prisma-company-constitution.repository'
import { CompanyDesignPrismaService } from '../../prisma/company-design-prisma.service'
import { CompanyConstitution } from '../domain/company-constitution'

interface MockDelegate {
  findUnique: Mock
  upsert: Mock
}

function createMockPrisma() {
  const service = new CompanyDesignPrismaService()
  Object.defineProperty(service, 'companyConstitution', {
    value: { findUnique: vi.fn(), upsert: vi.fn() },
    writable: true,
  })
  return service as CompanyDesignPrismaService & { companyConstitution: MockDelegate }
}

const now = new Date('2026-01-01T00:00:00Z')
const sampleRow = {
  projectId: 'proj-1',
  operationalPrinciples: ['transparency'],
  autonomyLimits: { maxDepth: 3, maxFanOut: 5, maxAgentsPerTeam: 10, coordinatorToSpecialistRatio: 0.2 },
  budgetConfig: { globalBudget: 500, perUoBudget: 100, perAgentBudget: 50, alertThresholds: [80, 90] },
  approvalCriteria: [{ scope: 'create-department' as const, requiredApprover: 'founder' as const, requiresJustification: true }],
  namingConventions: ['kebab-case'],
  expansionRules: [{ targetType: 'department' as const, conditions: ['growth'], requiresBudget: true, requiresOwner: true }],
  contextMinimizationPolicy: 'minimize',
  qualityRules: ['test-first'],
  deliveryRules: ['ci-cd'],
  createdAt: now,
  updatedAt: now,
}

describe('PrismaCompanyConstitutionRepository', () => {
  let repo: PrismaCompanyConstitutionRepository
  let prisma: CompanyDesignPrismaService & { companyConstitution: MockDelegate }

  beforeEach(() => {
    prisma = createMockPrisma()
    repo = new PrismaCompanyConstitutionRepository(prisma)
  })

  it('findByProjectId returns domain entity', async () => {
    prisma.companyConstitution.findUnique.mockResolvedValue(sampleRow)
    const result = await repo.findByProjectId('proj-1')
    expect(result).not.toBeNull()
    expect(result!.operationalPrinciples).toEqual(['transparency'])
  })

  it('findByProjectId returns null when not found', async () => {
    prisma.companyConstitution.findUnique.mockResolvedValue(null)
    expect(await repo.findByProjectId('missing')).toBeNull()
  })

  it('save upserts by projectId', async () => {
    prisma.companyConstitution.upsert.mockResolvedValue(sampleRow)
    const constitution = CompanyConstitution.reconstitute('proj-1', {
      ...sampleRow,
      autonomyLimits: sampleRow.autonomyLimits,
      budgetConfig: sampleRow.budgetConfig,
      approvalCriteria: sampleRow.approvalCriteria,
      expansionRules: sampleRow.expansionRules,
    })
    await repo.save(constitution)
    expect(prisma.companyConstitution.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { projectId: 'proj-1' } }),
    )
  })
})
