import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'

vi.mock('@prisma/client', () => {
  class MockPrismaClient {
    $connect = vi.fn().mockResolvedValue(undefined)
    $disconnect = vi.fn().mockResolvedValue(undefined)
  }
  return { PrismaClient: MockPrismaClient }
})

import { PrismaLockRepository } from './prisma-lock.repository'
import { CompanyDesignPrismaService } from '../../prisma/company-design-prisma.service'

interface MockDelegate {
  findFirst: Mock
  findMany: Mock
  upsert: Mock
  delete: Mock
}

function createMockPrisma() {
  const service = new CompanyDesignPrismaService()
  Object.defineProperty(service, 'entityLock', {
    value: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
    },
    writable: true,
  })
  return service as CompanyDesignPrismaService & { entityLock: MockDelegate }
}

const sampleRow = {
  id: 'lock-1',
  projectId: 'proj-1',
  entityId: 'dept-1',
  nodeType: 'department',
  lockedBy: 'user-1',
  lockedByName: 'Alice',
  lockedAt: new Date('2026-01-01T00:00:00Z'),
  expiresAt: new Date('2026-01-01T00:05:00Z'),
}

describe('PrismaLockRepository', () => {
  let repo: PrismaLockRepository
  let prisma: CompanyDesignPrismaService & { entityLock: MockDelegate }

  beforeEach(() => {
    prisma = createMockPrisma()
    repo = new PrismaLockRepository(prisma)
  })

  describe('findByEntity', () => {
    it('should return a lock when found', async () => {
      prisma.entityLock.findFirst.mockResolvedValue(sampleRow)
      const result = await repo.findByEntity('proj-1', 'dept-1')
      expect(result).not.toBeNull()
      expect(result!.id).toBe('lock-1')
      expect(result!.lockedBy).toBe('user-1')
      expect(prisma.entityLock.findFirst).toHaveBeenCalledWith({
        where: { projectId: 'proj-1', entityId: 'dept-1' },
      })
    })

    it('should return null when not found', async () => {
      prisma.entityLock.findFirst.mockResolvedValue(null)
      const result = await repo.findByEntity('proj-1', 'missing')
      expect(result).toBeNull()
    })
  })

  describe('listByProject', () => {
    it('should return all locks for project', async () => {
      prisma.entityLock.findMany.mockResolvedValue([sampleRow])
      const result = await repo.listByProject('proj-1')
      expect(result).toHaveLength(1)
      expect(result[0]!.lockedByName).toBe('Alice')
    })

    it('should return empty array when none', async () => {
      prisma.entityLock.findMany.mockResolvedValue([])
      const result = await repo.listByProject('proj-1')
      expect(result).toEqual([])
    })
  })

  describe('save', () => {
    it('should upsert the lock', async () => {
      prisma.entityLock.upsert.mockResolvedValue(sampleRow)
      const { EntityLock } = await import('../domain/entity-lock')
      const lock = EntityLock.reconstitute({
        id: 'lock-1',
        projectId: 'proj-1',
        entityId: 'dept-1',
        nodeType: 'department' as any,
        lockedBy: 'user-1',
        lockedByName: 'Alice',
        lockedAt: new Date('2026-01-01T00:00:00Z'),
        expiresAt: new Date('2026-01-01T00:05:00Z'),
      })
      await repo.save(lock)
      expect(prisma.entityLock.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'lock-1' },
          create: expect.objectContaining({ id: 'lock-1', lockedBy: 'user-1' }),
          update: expect.objectContaining({ lockedBy: 'user-1' }),
        }),
      )
    })
  })

  describe('delete', () => {
    it('should delete by id', async () => {
      prisma.entityLock.delete.mockResolvedValue(sampleRow)
      await repo.delete('lock-1')
      expect(prisma.entityLock.delete).toHaveBeenCalledWith({ where: { id: 'lock-1' } })
    })
  })

  describe('domain mapping', () => {
    it('should map dates correctly', async () => {
      prisma.entityLock.findFirst.mockResolvedValue(sampleRow)
      const result = await repo.findByEntity('proj-1', 'dept-1')
      expect(result!.lockedAt).toEqual(new Date('2026-01-01T00:00:00Z'))
      expect(result!.expiresAt).toEqual(new Date('2026-01-01T00:05:00Z'))
    })
  })
})
