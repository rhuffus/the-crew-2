import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'

vi.mock('@prisma/client', () => {
  class MockPrismaClient {
    $connect = vi.fn().mockResolvedValue(undefined)
    $disconnect = vi.fn().mockResolvedValue(undefined)
  }
  return { PrismaClient: MockPrismaClient }
})

import { PrismaCompanyModelRepository } from './prisma-company-model.repository'
import { CompanyDesignPrismaService } from '../../prisma/company-design-prisma.service'
import { CompanyModel } from '../domain/company-model'

interface MockDelegate {
  findUnique: Mock
  upsert: Mock
}

function createMockPrisma() {
  const service = new CompanyDesignPrismaService()
  Object.defineProperty(service, 'companyModel', {
    value: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    writable: true,
  })
  return service as CompanyDesignPrismaService & { companyModel: MockDelegate }
}

const sampleRow = {
  projectId: 'proj-1',
  purpose: 'Build widgets',
  type: 'startup',
  scope: 'global',
  principles: ['quality', 'speed'],
  updatedAt: new Date('2026-01-01T00:00:00Z'),
}

describe('PrismaCompanyModelRepository', () => {
  let repo: PrismaCompanyModelRepository
  let prisma: CompanyDesignPrismaService & { companyModel: MockDelegate }

  beforeEach(() => {
    prisma = createMockPrisma()
    repo = new PrismaCompanyModelRepository(prisma)
  })

  describe('findByProjectId', () => {
    it('should return a CompanyModel when found', async () => {
      prisma.companyModel.findUnique.mockResolvedValue(sampleRow)

      const result = await repo.findByProjectId('proj-1')
      expect(result).not.toBeNull()
      expect(result!.projectId).toBe('proj-1')
      expect(result!.purpose).toBe('Build widgets')
      expect(result!.principles).toEqual(['quality', 'speed'])
      expect(prisma.companyModel.findUnique).toHaveBeenCalledWith({
        where: { projectId: 'proj-1' },
      })
    })

    it('should return null when not found', async () => {
      prisma.companyModel.findUnique.mockResolvedValue(null)

      const result = await repo.findByProjectId('missing')
      expect(result).toBeNull()
    })
  })

  describe('save', () => {
    it('should upsert the company model', async () => {
      prisma.companyModel.upsert.mockResolvedValue(sampleRow)

      const model = CompanyModel.reconstitute('proj-1', {
        purpose: 'Build widgets',
        type: 'startup',
        scope: 'global',
        principles: ['quality', 'speed'],
        updatedAt: new Date('2026-01-01T00:00:00Z'),
      })
      await repo.save(model)

      expect(prisma.companyModel.upsert).toHaveBeenCalledWith({
        where: { projectId: 'proj-1' },
        create: expect.objectContaining({
          projectId: 'proj-1',
          purpose: 'Build widgets',
          type: 'startup',
        }),
        update: expect.objectContaining({
          purpose: 'Build widgets',
          type: 'startup',
        }),
      })
    })
  })

  describe('domain mapping', () => {
    it('should reconstitute CompanyModel with correct props', async () => {
      prisma.companyModel.findUnique.mockResolvedValue({
        ...sampleRow,
        type: 'enterprise',
      })

      const result = await repo.findByProjectId('proj-1')
      expect(result!.type).toBe('enterprise')
      expect(result!.updatedAt).toEqual(new Date('2026-01-01T00:00:00Z'))
    })
  })
})
