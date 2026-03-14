import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'

vi.mock('@prisma/client', () => {
  class MockPrismaClient {
    $connect = vi.fn().mockResolvedValue(undefined)
    $disconnect = vi.fn().mockResolvedValue(undefined)
  }
  return { PrismaClient: MockPrismaClient }
})

import { PrismaRoleRepository } from './prisma-role.repository'
import { CompanyDesignPrismaService } from '../../prisma/company-design-prisma.service'
import { Role } from '../domain/role'

interface MockDelegate {
  findUnique: Mock
  findMany: Mock
  upsert: Mock
  delete: Mock
}

function createMockPrisma() {
  const service = new CompanyDesignPrismaService()
  Object.defineProperty(service, 'role', {
    value: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
    },
    writable: true,
  })
  return service as CompanyDesignPrismaService & { role: MockDelegate }
}

const sampleRow = {
  id: 'role-1',
  projectId: 'proj-1',
  name: 'Backend Engineer',
  description: 'Builds APIs',
  departmentId: 'dept-1',
  capabilityIds: ['cap-1', 'cap-2'],
  accountability: 'API quality',
  authority: 'Technical decisions',
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
}

describe('PrismaRoleRepository', () => {
  let repo: PrismaRoleRepository
  let prisma: CompanyDesignPrismaService & { role: MockDelegate }

  beforeEach(() => {
    prisma = createMockPrisma()
    repo = new PrismaRoleRepository(prisma)
  })

  describe('findById', () => {
    it('should return a Role when found', async () => {
      prisma.role.findUnique.mockResolvedValue(sampleRow)

      const result = await repo.findById('role-1')
      expect(result).not.toBeNull()
      expect(result!.id).toBe('role-1')
      expect(result!.name).toBe('Backend Engineer')
      expect(result!.capabilityIds).toEqual(['cap-1', 'cap-2'])
    })

    it('should return null when not found', async () => {
      prisma.role.findUnique.mockResolvedValue(null)
      const result = await repo.findById('missing')
      expect(result).toBeNull()
    })
  })

  describe('findByProjectId', () => {
    it('should return all roles for project', async () => {
      prisma.role.findMany.mockResolvedValue([sampleRow])
      const result = await repo.findByProjectId('proj-1')
      expect(result).toHaveLength(1)
    })
  })

  describe('save', () => {
    it('should upsert the role', async () => {
      prisma.role.upsert.mockResolvedValue(sampleRow)

      const role = Role.create({
        id: 'role-1',
        projectId: 'proj-1',
        name: 'Backend Engineer',
        description: 'Builds APIs',
        departmentId: 'dept-1',
        capabilityIds: ['cap-1', 'cap-2'],
        accountability: 'API quality',
        authority: 'Technical decisions',
      })
      await repo.save(role)

      expect(prisma.role.upsert).toHaveBeenCalledWith({
        where: { id: 'role-1' },
        create: expect.objectContaining({ id: 'role-1', name: 'Backend Engineer' }),
        update: expect.objectContaining({ name: 'Backend Engineer' }),
      })
    })
  })

  describe('delete', () => {
    it('should delete by id', async () => {
      prisma.role.delete.mockResolvedValue(sampleRow)
      await repo.delete('role-1')
      expect(prisma.role.delete).toHaveBeenCalledWith({
        where: { id: 'role-1' },
      })
    })
  })
})
