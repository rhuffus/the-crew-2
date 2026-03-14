import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'

vi.mock('@prisma/client', () => {
  class MockPrismaClient {
    $connect = vi.fn().mockResolvedValue(undefined)
    $disconnect = vi.fn().mockResolvedValue(undefined)
  }
  return { PrismaClient: MockPrismaClient }
})

import { PrismaReviewRepository } from './prisma-review.repository'
import { CompanyDesignPrismaService } from '../../prisma/company-design-prisma.service'

interface MockDelegate {
  findUnique: Mock
  findFirst: Mock
  findMany: Mock
  upsert: Mock
  delete: Mock
}

function createMockPrisma() {
  const service = new CompanyDesignPrismaService()
  Object.defineProperty(service, 'reviewMarker', {
    value: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
    },
    writable: true,
  })
  return service as CompanyDesignPrismaService & { reviewMarker: MockDelegate }
}

const sampleRow = {
  id: 'review-1',
  projectId: 'proj-1',
  entityId: 'dept-1',
  nodeType: 'department',
  status: 'pending',
  reviewerId: 'user-1',
  reviewerName: 'Jane',
  feedback: null,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
}

describe('PrismaReviewRepository', () => {
  let repo: PrismaReviewRepository
  let prisma: CompanyDesignPrismaService & { reviewMarker: MockDelegate }

  beforeEach(() => {
    prisma = createMockPrisma()
    repo = new PrismaReviewRepository(prisma)
  })

  describe('findById', () => {
    it('should return a ReviewMarker when found', async () => {
      prisma.reviewMarker.findUnique.mockResolvedValue(sampleRow)
      const result = await repo.findById('review-1')
      expect(result).not.toBeNull()
      expect(result!.id).toBe('review-1')
      expect(result!.status).toBe('pending')
    })

    it('should return null when not found', async () => {
      prisma.reviewMarker.findUnique.mockResolvedValue(null)
      const result = await repo.findById('missing')
      expect(result).toBeNull()
    })
  })

  describe('findByEntity', () => {
    it('should return a review marker for entity', async () => {
      prisma.reviewMarker.findFirst.mockResolvedValue(sampleRow)
      const result = await repo.findByEntity('proj-1', 'dept-1')
      expect(result).not.toBeNull()
      expect(prisma.reviewMarker.findFirst).toHaveBeenCalledWith({
        where: { projectId: 'proj-1', entityId: 'dept-1' },
      })
    })

    it('should return null when not found', async () => {
      prisma.reviewMarker.findFirst.mockResolvedValue(null)
      const result = await repo.findByEntity('proj-1', 'missing')
      expect(result).toBeNull()
    })
  })

  describe('listByProject', () => {
    it('should return all reviews for project', async () => {
      prisma.reviewMarker.findMany.mockResolvedValue([sampleRow])
      const result = await repo.listByProject('proj-1')
      expect(result).toHaveLength(1)
    })
  })

  describe('save', () => {
    it('should upsert the review', async () => {
      prisma.reviewMarker.upsert.mockResolvedValue(sampleRow)
      const { ReviewMarker } = await import('../domain/review-marker')
      const review = ReviewMarker.reconstitute({
        id: 'review-1',
        projectId: 'proj-1',
        entityId: 'dept-1',
        nodeType: 'department' as any,
        status: 'pending' as any,
        reviewerId: 'user-1',
        reviewerName: 'Jane',
        feedback: null,
        createdAt: new Date('2026-01-01T00:00:00Z'),
        updatedAt: new Date('2026-01-01T00:00:00Z'),
      })
      await repo.save(review)
      expect(prisma.reviewMarker.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'review-1' },
          create: expect.objectContaining({ id: 'review-1', status: 'pending' }),
          update: expect.objectContaining({ status: 'pending' }),
        }),
      )
    })
  })

  describe('delete', () => {
    it('should delete by id', async () => {
      prisma.reviewMarker.delete.mockResolvedValue(sampleRow)
      await repo.delete('review-1')
      expect(prisma.reviewMarker.delete).toHaveBeenCalledWith({ where: { id: 'review-1' } })
    })
  })

  describe('domain mapping', () => {
    it('should handle feedback', async () => {
      prisma.reviewMarker.findUnique.mockResolvedValue({
        ...sampleRow,
        status: 'approved',
        feedback: 'LGTM',
      })
      const result = await repo.findById('review-1')
      expect(result!.status).toBe('approved')
      expect(result!.feedback).toBe('LGTM')
    })
  })
})
