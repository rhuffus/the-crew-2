import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'

vi.mock('@prisma/client', () => {
  class MockPrismaClient {
    $connect = vi.fn().mockResolvedValue(undefined)
    $disconnect = vi.fn().mockResolvedValue(undefined)
  }
  return { PrismaClient: MockPrismaClient }
})

import { PrismaContractRepository } from './prisma-contract.repository'
import { CompanyDesignPrismaService } from '../../prisma/company-design-prisma.service'
import { Contract } from '../domain/contract'

interface MockDelegate {
  findUnique: Mock
  findMany: Mock
  upsert: Mock
  delete: Mock
}

function createMockPrisma() {
  const service = new CompanyDesignPrismaService()
  Object.defineProperty(service, 'contract', {
    value: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
    },
    writable: true,
  })
  return service as CompanyDesignPrismaService & { contract: MockDelegate }
}

const sampleRow = {
  id: 'con-1',
  projectId: 'proj-1',
  name: 'API Contract',
  description: 'REST API agreement',
  type: 'SLA',
  status: 'draft',
  providerId: 'dept-1',
  providerType: 'department',
  consumerId: 'dept-2',
  consumerType: 'department',
  acceptanceCriteria: ['uptime > 99%'],
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
}

describe('PrismaContractRepository', () => {
  let repo: PrismaContractRepository
  let prisma: CompanyDesignPrismaService & { contract: MockDelegate }

  beforeEach(() => {
    prisma = createMockPrisma()
    repo = new PrismaContractRepository(prisma)
  })

  describe('findById', () => {
    it('should return a Contract when found', async () => {
      prisma.contract.findUnique.mockResolvedValue(sampleRow)

      const result = await repo.findById('con-1')
      expect(result).not.toBeNull()
      expect(result!.id).toBe('con-1')
      expect(result!.name).toBe('API Contract')
      expect(result!.type).toBe('SLA')
      expect(result!.acceptanceCriteria).toEqual(['uptime > 99%'])
    })

    it('should return null when not found', async () => {
      prisma.contract.findUnique.mockResolvedValue(null)
      const result = await repo.findById('missing')
      expect(result).toBeNull()
    })
  })

  describe('findByProjectId', () => {
    it('should return all contracts for project', async () => {
      prisma.contract.findMany.mockResolvedValue([sampleRow])
      const result = await repo.findByProjectId('proj-1')
      expect(result).toHaveLength(1)
    })
  })

  describe('save', () => {
    it('should upsert the contract', async () => {
      prisma.contract.upsert.mockResolvedValue(sampleRow)

      const contract = Contract.create({
        id: 'con-1',
        projectId: 'proj-1',
        name: 'API Contract',
        description: 'REST API agreement',
        type: 'SLA',
        providerId: 'dept-1',
        providerType: 'department',
        consumerId: 'dept-2',
        consumerType: 'department',
        acceptanceCriteria: ['uptime > 99%'],
      })
      await repo.save(contract)

      expect(prisma.contract.upsert).toHaveBeenCalledWith({
        where: { id: 'con-1' },
        create: expect.objectContaining({ id: 'con-1', name: 'API Contract' }),
        update: expect.objectContaining({ name: 'API Contract' }),
      })
    })
  })

  describe('delete', () => {
    it('should delete by id', async () => {
      prisma.contract.delete.mockResolvedValue(sampleRow)
      await repo.delete('con-1')
      expect(prisma.contract.delete).toHaveBeenCalledWith({
        where: { id: 'con-1' },
      })
    })
  })
})
