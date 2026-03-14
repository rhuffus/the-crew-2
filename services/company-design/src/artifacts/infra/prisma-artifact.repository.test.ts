import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'

vi.mock('@prisma/client', () => {
  class MockPrismaClient {
    $connect = vi.fn().mockResolvedValue(undefined)
    $disconnect = vi.fn().mockResolvedValue(undefined)
  }
  return { PrismaClient: MockPrismaClient }
})

import { PrismaArtifactRepository } from './prisma-artifact.repository'
import { CompanyDesignPrismaService } from '../../prisma/company-design-prisma.service'
import { Artifact } from '../domain/artifact'

interface MockDelegate {
  findUnique: Mock
  findMany: Mock
  upsert: Mock
  delete: Mock
}

function createMockPrisma() {
  const service = new CompanyDesignPrismaService()
  Object.defineProperty(service, 'artifact', {
    value: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
    },
    writable: true,
  })
  return service as CompanyDesignPrismaService & { artifact: MockDelegate }
}

const sampleRow = {
  id: 'art-1',
  projectId: 'proj-1',
  name: 'Design Doc',
  description: 'A design document',
  type: 'document',
  status: 'draft',
  producerId: 'dept-1',
  producerType: 'department',
  consumerIds: ['dept-2'],
  tags: ['design', 'spec'],
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
}

describe('PrismaArtifactRepository', () => {
  let repo: PrismaArtifactRepository
  let prisma: CompanyDesignPrismaService & { artifact: MockDelegate }

  beforeEach(() => {
    prisma = createMockPrisma()
    repo = new PrismaArtifactRepository(prisma)
  })

  describe('findById', () => {
    it('should return an Artifact when found', async () => {
      prisma.artifact.findUnique.mockResolvedValue(sampleRow)
      const result = await repo.findById('art-1')
      expect(result).not.toBeNull()
      expect(result!.id).toBe('art-1')
      expect(result!.name).toBe('Design Doc')
      expect(result!.tags).toEqual(['design', 'spec'])
    })

    it('should return null when not found', async () => {
      prisma.artifact.findUnique.mockResolvedValue(null)
      const result = await repo.findById('missing')
      expect(result).toBeNull()
    })
  })

  describe('findByProjectId', () => {
    it('should return all artifacts for project', async () => {
      prisma.artifact.findMany.mockResolvedValue([sampleRow])
      const result = await repo.findByProjectId('proj-1')
      expect(result).toHaveLength(1)
      expect(result[0]!.type).toBe('document')
    })

    it('should return empty array when none', async () => {
      prisma.artifact.findMany.mockResolvedValue([])
      const result = await repo.findByProjectId('proj-1')
      expect(result).toEqual([])
    })
  })

  describe('save', () => {
    it('should upsert the artifact', async () => {
      prisma.artifact.upsert.mockResolvedValue(sampleRow)
      const artifact = Artifact.create({
        id: 'art-1',
        projectId: 'proj-1',
        name: 'Design Doc',
        description: 'A design document',
        type: 'document' as any,
        tags: ['design'],
      })
      await repo.save(artifact)
      expect(prisma.artifact.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'art-1' },
          create: expect.objectContaining({ id: 'art-1', name: 'Design Doc' }),
          update: expect.objectContaining({ name: 'Design Doc' }),
        }),
      )
    })
  })

  describe('delete', () => {
    it('should delete by id', async () => {
      prisma.artifact.delete.mockResolvedValue(sampleRow)
      await repo.delete('art-1')
      expect(prisma.artifact.delete).toHaveBeenCalledWith({ where: { id: 'art-1' } })
    })
  })

  describe('domain mapping', () => {
    it('should handle null producer fields', async () => {
      prisma.artifact.findUnique.mockResolvedValue({ ...sampleRow, producerId: null, producerType: null })
      const result = await repo.findById('art-1')
      expect(result!.producerId).toBeNull()
      expect(result!.producerType).toBeNull()
    })
  })
})
