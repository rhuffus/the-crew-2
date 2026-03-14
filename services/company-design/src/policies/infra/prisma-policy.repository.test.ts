import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'

vi.mock('@prisma/client', () => {
  class MockPrismaClient {
    $connect = vi.fn().mockResolvedValue(undefined)
    $disconnect = vi.fn().mockResolvedValue(undefined)
  }
  return { PrismaClient: MockPrismaClient }
})

import { PrismaPolicyRepository } from './prisma-policy.repository'
import { CompanyDesignPrismaService } from '../../prisma/company-design-prisma.service'
import { Policy } from '../domain/policy'

interface MockDelegate {
  findUnique: Mock
  findMany: Mock
  upsert: Mock
  delete: Mock
}

function createMockPrisma() {
  const service = new CompanyDesignPrismaService()
  Object.defineProperty(service, 'policy', {
    value: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
    },
    writable: true,
  })
  return service as CompanyDesignPrismaService & { policy: MockDelegate }
}

const sampleRow = {
  id: 'pol-1',
  projectId: 'proj-1',
  name: 'Code Review Policy',
  description: 'All code must be reviewed',
  scope: 'global',
  departmentId: null,
  type: 'approval-gate',
  condition: 'PR submitted',
  enforcement: 'mandatory',
  status: 'active',
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
}

describe('PrismaPolicyRepository', () => {
  let repo: PrismaPolicyRepository
  let prisma: CompanyDesignPrismaService & { policy: MockDelegate }

  beforeEach(() => {
    prisma = createMockPrisma()
    repo = new PrismaPolicyRepository(prisma)
  })

  describe('findById', () => {
    it('should return a Policy when found', async () => {
      prisma.policy.findUnique.mockResolvedValue(sampleRow)

      const result = await repo.findById('pol-1')
      expect(result).not.toBeNull()
      expect(result!.id).toBe('pol-1')
      expect(result!.name).toBe('Code Review Policy')
      expect(result!.scope).toBe('global')
      expect(result!.enforcement).toBe('mandatory')
    })

    it('should return null when not found', async () => {
      prisma.policy.findUnique.mockResolvedValue(null)
      const result = await repo.findById('missing')
      expect(result).toBeNull()
    })
  })

  describe('findByProjectId', () => {
    it('should return all policies for project', async () => {
      prisma.policy.findMany.mockResolvedValue([sampleRow])
      const result = await repo.findByProjectId('proj-1')
      expect(result).toHaveLength(1)
    })
  })

  describe('save', () => {
    it('should upsert the policy', async () => {
      prisma.policy.upsert.mockResolvedValue(sampleRow)

      const policy = Policy.create({
        id: 'pol-1',
        projectId: 'proj-1',
        name: 'Code Review Policy',
        description: 'All code must be reviewed',
        scope: 'global',
        type: 'approval-gate',
        condition: 'PR submitted',
        enforcement: 'mandatory',
      })
      await repo.save(policy)

      expect(prisma.policy.upsert).toHaveBeenCalledWith({
        where: { id: 'pol-1' },
        create: expect.objectContaining({ id: 'pol-1', name: 'Code Review Policy' }),
        update: expect.objectContaining({ name: 'Code Review Policy' }),
      })
    })
  })

  describe('delete', () => {
    it('should delete by id', async () => {
      prisma.policy.delete.mockResolvedValue(sampleRow)
      await repo.delete('pol-1')
      expect(prisma.policy.delete).toHaveBeenCalledWith({
        where: { id: 'pol-1' },
      })
    })
  })

  describe('domain mapping', () => {
    it('should handle department-scoped policy', async () => {
      prisma.policy.findUnique.mockResolvedValue({
        ...sampleRow,
        scope: 'department',
        departmentId: 'dept-1',
      })
      const result = await repo.findById('pol-1')
      expect(result!.scope).toBe('department')
      expect(result!.departmentId).toBe('dept-1')
    })
  })
})
