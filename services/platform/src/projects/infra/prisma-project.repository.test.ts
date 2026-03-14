import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'

vi.mock('.prisma/platform-client', () => {
  class MockPrismaClient {
    $connect = vi.fn().mockResolvedValue(undefined)
    $disconnect = vi.fn().mockResolvedValue(undefined)
  }
  return { PrismaClient: MockPrismaClient }
})

import { PrismaProjectRepository } from './prisma-project.repository'
import { PlatformPrismaService } from '../../prisma/platform-prisma.service'
import { Project } from '../domain/project'

interface MockProjectDelegate {
  findUnique: Mock
  findMany: Mock
  upsert: Mock
  delete: Mock
}

function createMockPrisma() {
  const service = new PlatformPrismaService()
  Object.defineProperty(service, 'project', {
    value: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
    },
    writable: true,
  })
  return service as PlatformPrismaService & { project: MockProjectDelegate }
}

const sampleRow = {
  id: 'proj-1',
  name: 'Acme',
  description: 'A company',
  status: 'active',
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
}

describe('PrismaProjectRepository', () => {
  let repo: PrismaProjectRepository
  let prisma: PlatformPrismaService & { project: MockProjectDelegate }

  beforeEach(() => {
    prisma = createMockPrisma()
    repo = new PrismaProjectRepository(prisma)
  })

  describe('findById', () => {
    it('should return a Project when found', async () => {
      prisma.project.findUnique.mockResolvedValue(sampleRow)

      const result = await repo.findById('proj-1')
      expect(result).not.toBeNull()
      expect(result!.id).toBe('proj-1')
      expect(result!.name).toBe('Acme')
      expect(result!.status).toBe('active')
      expect(prisma.project.findUnique).toHaveBeenCalledWith({
        where: { id: 'proj-1' },
      })
    })

    it('should return null when not found', async () => {
      prisma.project.findUnique.mockResolvedValue(null)

      const result = await repo.findById('missing')
      expect(result).toBeNull()
    })
  })

  describe('findAll', () => {
    it('should return all projects', async () => {
      prisma.project.findMany.mockResolvedValue([sampleRow])

      const result = await repo.findAll()
      expect(result).toHaveLength(1)
      expect(result[0]!.name).toBe('Acme')
    })

    it('should return empty array when no projects', async () => {
      prisma.project.findMany.mockResolvedValue([])

      const result = await repo.findAll()
      expect(result).toEqual([])
    })
  })

  describe('save', () => {
    it('should upsert the project', async () => {
      prisma.project.upsert.mockResolvedValue(sampleRow)

      const project = Project.create({ id: 'proj-1', name: 'Acme', description: 'A company' })
      await repo.save(project)

      expect(prisma.project.upsert).toHaveBeenCalledWith({
        where: { id: 'proj-1' },
        create: expect.objectContaining({
          id: 'proj-1',
          name: 'Acme',
          description: 'A company',
          status: 'active',
        }),
        update: expect.objectContaining({
          name: 'Acme',
          description: 'A company',
          status: 'active',
        }),
      })
    })
  })

  describe('delete', () => {
    it('should delete by id', async () => {
      prisma.project.delete.mockResolvedValue(sampleRow)

      await repo.delete('proj-1')
      expect(prisma.project.delete).toHaveBeenCalledWith({
        where: { id: 'proj-1' },
      })
    })
  })

  describe('domain mapping', () => {
    it('should reconstitute Project with correct props', async () => {
      prisma.project.findUnique.mockResolvedValue({
        ...sampleRow,
        status: 'archived',
      })

      const result = await repo.findById('proj-1')
      expect(result!.status).toBe('archived')
      expect(result!.createdAt).toEqual(new Date('2026-01-01T00:00:00Z'))
      expect(result!.updatedAt).toEqual(new Date('2026-01-01T00:00:00Z'))
    })
  })
})
