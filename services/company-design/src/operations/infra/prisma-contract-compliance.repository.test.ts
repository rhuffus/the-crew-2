import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'

vi.mock('@prisma/client', () => {
  class MockPrismaClient {
    $connect = vi.fn().mockResolvedValue(undefined)
    $disconnect = vi.fn().mockResolvedValue(undefined)
  }
  return { PrismaClient: MockPrismaClient }
})

import { PrismaContractComplianceRepository } from './prisma-contract-compliance.repository'
import { CompanyDesignPrismaService } from '../../prisma/company-design-prisma.service'
import { ContractCompliance } from '../domain/contract-compliance'

interface MockDelegate {
  findUnique: Mock
  findFirst: Mock
  findMany: Mock
  upsert: Mock
  delete: Mock
}

function createMockPrisma() {
  const service = new CompanyDesignPrismaService()
  Object.defineProperty(service, 'contractCompliance', {
    value: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
    },
    writable: true,
  })
  return service as CompanyDesignPrismaService & { contractCompliance: MockDelegate }
}

const now = new Date('2026-01-01T00:00:00Z')
const sampleRow = {
  id: 'cc-1',
  projectId: 'proj-1',
  contractId: 'ctr-1',
  status: 'compliant',
  reason: null,
  lastCheckedAt: now,
  createdAt: now,
  updatedAt: now,
}

describe('PrismaContractComplianceRepository', () => {
  let repo: PrismaContractComplianceRepository
  let prisma: CompanyDesignPrismaService & { contractCompliance: MockDelegate }

  beforeEach(() => {
    prisma = createMockPrisma()
    repo = new PrismaContractComplianceRepository(prisma)
  })

  it('findById returns domain entity', async () => {
    prisma.contractCompliance.findUnique.mockResolvedValue(sampleRow)
    const result = await repo.findById('cc-1')
    expect(result).not.toBeNull()
    expect(result!.contractId).toBe('ctr-1')
  })

  it('findByContract uses findFirst with projectId+contractId', async () => {
    prisma.contractCompliance.findFirst.mockResolvedValue(sampleRow)
    const result = await repo.findByContract('proj-1', 'ctr-1')
    expect(result).not.toBeNull()
    expect(prisma.contractCompliance.findFirst).toHaveBeenCalledWith({
      where: { projectId: 'proj-1', contractId: 'ctr-1' },
    })
  })

  it('findByContract returns null when not found', async () => {
    prisma.contractCompliance.findFirst.mockResolvedValue(null)
    expect(await repo.findByContract('proj-1', 'missing')).toBeNull()
  })

  it('listByProject returns array', async () => {
    prisma.contractCompliance.findMany.mockResolvedValue([sampleRow])
    const results = await repo.listByProject('proj-1')
    expect(results).toHaveLength(1)
  })

  it('save upserts the compliance record', async () => {
    prisma.contractCompliance.upsert.mockResolvedValue(sampleRow)
    const cc = ContractCompliance.reconstitute({
      ...sampleRow,
      status: 'compliant' as const,
    })
    await repo.save(cc)
    expect(prisma.contractCompliance.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'cc-1' } }),
    )
  })

  it('delete removes by id', async () => {
    prisma.contractCompliance.delete.mockResolvedValue(sampleRow)
    await repo.delete('cc-1')
    expect(prisma.contractCompliance.delete).toHaveBeenCalledWith({ where: { id: 'cc-1' } })
  })
})
