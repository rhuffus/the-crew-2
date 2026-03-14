import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'

vi.mock('@prisma/client', () => {
  class MockPrismaClient {
    $connect = vi.fn().mockResolvedValue(undefined)
    $disconnect = vi.fn().mockResolvedValue(undefined)
  }
  return { PrismaClient: MockPrismaClient }
})

import { PrismaCapabilityRepository } from './prisma-capability.repository'
import { CompanyDesignPrismaService } from '../../prisma/company-design-prisma.service'
import { Capability } from '../domain/capability'

interface MockDelegate {
  findUnique: Mock
  findMany: Mock
  upsert: Mock
  delete: Mock
}

function createMockPrisma() {
  const service = new CompanyDesignPrismaService()
  Object.defineProperty(service, 'capability', {
    value: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
    },
    writable: true,
  })
  return service as CompanyDesignPrismaService & { capability: MockDelegate }
}

const sampleRow = {
  id: 'cap-1',
  projectId: 'proj-1',
  name: 'API Design',
  description: 'Design REST APIs',
  ownerDepartmentId: 'dept-1',
  inputs: ['requirements'],
  outputs: ['api-spec'],
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
}

describe('PrismaCapabilityRepository', () => {
  let repo: PrismaCapabilityRepository
  let prisma: CompanyDesignPrismaService & { capability: MockDelegate }

  beforeEach(() => {
    prisma = createMockPrisma()
    repo = new PrismaCapabilityRepository(prisma)
  })

  describe('findById', () => {
    it('should return a Capability when found', async () => {
      prisma.capability.findUnique.mockResolvedValue(sampleRow)

      const result = await repo.findById('cap-1')
      expect(result).not.toBeNull()
      expect(result!.id).toBe('cap-1')
      expect(result!.name).toBe('API Design')
      expect(result!.inputs).toEqual(['requirements'])
      expect(result!.outputs).toEqual(['api-spec'])
    })

    it('should return null when not found', async () => {
      prisma.capability.findUnique.mockResolvedValue(null)
      const result = await repo.findById('missing')
      expect(result).toBeNull()
    })
  })

  describe('findByProjectId', () => {
    it('should return all capabilities for project', async () => {
      prisma.capability.findMany.mockResolvedValue([sampleRow])
      const result = await repo.findByProjectId('proj-1')
      expect(result).toHaveLength(1)
    })
  })

  describe('save', () => {
    it('should upsert the capability', async () => {
      prisma.capability.upsert.mockResolvedValue(sampleRow)

      const cap = Capability.create({
        id: 'cap-1',
        projectId: 'proj-1',
        name: 'API Design',
        description: 'Design REST APIs',
        ownerDepartmentId: 'dept-1',
        inputs: ['requirements'],
        outputs: ['api-spec'],
      })
      await repo.save(cap)

      expect(prisma.capability.upsert).toHaveBeenCalledWith({
        where: { id: 'cap-1' },
        create: expect.objectContaining({ id: 'cap-1', name: 'API Design' }),
        update: expect.objectContaining({ name: 'API Design' }),
      })
    })
  })

  describe('delete', () => {
    it('should delete by id', async () => {
      prisma.capability.delete.mockResolvedValue(sampleRow)
      await repo.delete('cap-1')
      expect(prisma.capability.delete).toHaveBeenCalledWith({
        where: { id: 'cap-1' },
      })
    })
  })

  describe('domain mapping', () => {
    it('should handle null ownerDepartmentId', async () => {
      prisma.capability.findUnique.mockResolvedValue({
        ...sampleRow,
        ownerDepartmentId: null,
      })
      const result = await repo.findById('cap-1')
      expect(result!.ownerDepartmentId).toBeNull()
    })
  })
})
