import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'

vi.mock('@prisma/client', () => {
  class MockPrismaClient {
    $connect = vi.fn().mockResolvedValue(undefined)
    $disconnect = vi.fn().mockResolvedValue(undefined)
  }
  return { PrismaClient: MockPrismaClient }
})

import { PrismaDepartmentRepository } from './prisma-department.repository'
import { CompanyDesignPrismaService } from '../../prisma/company-design-prisma.service'
import { Department } from '../domain/department'

interface MockDelegate {
  findUnique: Mock
  findMany: Mock
  upsert: Mock
  delete: Mock
}

function createMockPrisma() {
  const service = new CompanyDesignPrismaService()
  Object.defineProperty(service, 'department', {
    value: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
    },
    writable: true,
  })
  return service as CompanyDesignPrismaService & { department: MockDelegate }
}

const sampleRow = {
  id: 'dept-1',
  projectId: 'proj-1',
  name: 'Engineering',
  description: 'Tech department',
  mandate: 'Build products',
  parentId: null,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
}

describe('PrismaDepartmentRepository', () => {
  let repo: PrismaDepartmentRepository
  let prisma: CompanyDesignPrismaService & { department: MockDelegate }

  beforeEach(() => {
    prisma = createMockPrisma()
    repo = new PrismaDepartmentRepository(prisma)
  })

  describe('findById', () => {
    it('should return a Department when found', async () => {
      prisma.department.findUnique.mockResolvedValue(sampleRow)

      const result = await repo.findById('dept-1')
      expect(result).not.toBeNull()
      expect(result!.id).toBe('dept-1')
      expect(result!.name).toBe('Engineering')
      expect(prisma.department.findUnique).toHaveBeenCalledWith({
        where: { id: 'dept-1' },
      })
    })

    it('should return null when not found', async () => {
      prisma.department.findUnique.mockResolvedValue(null)
      const result = await repo.findById('missing')
      expect(result).toBeNull()
    })
  })

  describe('findByProjectId', () => {
    it('should return all departments for project', async () => {
      prisma.department.findMany.mockResolvedValue([sampleRow])
      const result = await repo.findByProjectId('proj-1')
      expect(result).toHaveLength(1)
      expect(result[0]!.name).toBe('Engineering')
    })

    it('should return empty array when none found', async () => {
      prisma.department.findMany.mockResolvedValue([])
      const result = await repo.findByProjectId('proj-1')
      expect(result).toEqual([])
    })
  })

  describe('save', () => {
    it('should upsert the department', async () => {
      prisma.department.upsert.mockResolvedValue(sampleRow)

      const dept = Department.create({
        id: 'dept-1',
        projectId: 'proj-1',
        name: 'Engineering',
        description: 'Tech department',
        mandate: 'Build products',
      })
      await repo.save(dept)

      expect(prisma.department.upsert).toHaveBeenCalledWith({
        where: { id: 'dept-1' },
        create: expect.objectContaining({ id: 'dept-1', name: 'Engineering' }),
        update: expect.objectContaining({ name: 'Engineering' }),
      })
    })
  })

  describe('delete', () => {
    it('should delete by id', async () => {
      prisma.department.delete.mockResolvedValue(sampleRow)
      await repo.delete('dept-1')
      expect(prisma.department.delete).toHaveBeenCalledWith({
        where: { id: 'dept-1' },
      })
    })
  })

  describe('domain mapping', () => {
    it('should handle parentId correctly', async () => {
      prisma.department.findUnique.mockResolvedValue({
        ...sampleRow,
        parentId: 'parent-1',
      })
      const result = await repo.findById('dept-1')
      expect(result!.parentId).toBe('parent-1')
    })
  })
})
