import 'reflect-metadata'
import { describe, it, expect, beforeEach } from 'vitest'
import { CollaborationController } from './collaboration.controller'
import { CollaborationService } from './collaboration.service'
import { InMemoryReviewRepository } from '../infrastructure/in-memory-review.repository'
import { InMemoryLockRepository } from '../infrastructure/in-memory-lock.repository'

describe('CollaborationController', () => {
  let controller: CollaborationController
  let service: CollaborationService

  beforeEach(() => {
    const reviewRepo = new InMemoryReviewRepository()
    const lockRepo = new InMemoryLockRepository()
    service = new CollaborationService(reviewRepo, lockRepo)
    controller = new CollaborationController(service)
  })

  // ── Reviews ──────────────────────────────────────────────────────────

  describe('reviews', () => {
    it('POST /reviews creates a review marker', async () => {
      const result = await controller.createReview('p1', {
        entityId: 'e1',
        nodeType: 'department',
        status: 'pending',
        reviewerId: 'user-1',
        reviewerName: 'Alice',
      })
      expect(result.entityId).toBe('e1')
      expect(result.status).toBe('pending')
      expect(result.reviewerName).toBe('Alice')
      expect(result.id).toBeDefined()
    })

    it('GET /reviews returns project reviews', async () => {
      await service.createReview('p1', {
        entityId: 'e1',
        nodeType: 'department',
        status: 'pending',
        reviewerId: 'user-1',
        reviewerName: 'Alice',
      })
      const result = await controller.listReviews('p1')
      expect(result).toHaveLength(1)
      expect(result[0]!.entityId).toBe('e1')
    })

    it('GET /reviews/by-entity returns review for entity', async () => {
      await service.createReview('p1', {
        entityId: 'e1',
        nodeType: 'department',
        status: 'pending',
        reviewerId: 'user-1',
        reviewerName: 'Alice',
      })
      const result = await controller.getReviewByEntity('p1', 'e1')
      expect(result).not.toBeNull()
      expect(result!.entityId).toBe('e1')
    })

    it('GET /reviews/by-entity returns null when no review exists', async () => {
      const result = await controller.getReviewByEntity('p1', 'nonexistent')
      expect(result).toBeNull()
    })

    it('PATCH /reviews/:id updates a review', async () => {
      const created = await service.createReview('p1', {
        entityId: 'e1',
        nodeType: 'department',
        status: 'pending',
        reviewerId: 'user-1',
        reviewerName: 'Alice',
      })
      const result = await controller.updateReview(created.id, { status: 'approved' })
      expect(result.status).toBe('approved')
    })

    it('DELETE /reviews/:id removes a review', async () => {
      const created = await service.createReview('p1', {
        entityId: 'e1',
        nodeType: 'department',
        status: 'pending',
        reviewerId: 'user-1',
        reviewerName: 'Alice',
      })
      await controller.deleteReview(created.id)
      const reviews = await service.listReviews('p1')
      expect(reviews).toHaveLength(0)
    })
  })

  // ── Locks ────────────────────────────────────────────────────────────

  describe('locks', () => {
    it('POST /locks acquires a lock', async () => {
      const result = await controller.acquireLock('p1', {
        entityId: 'e1',
        nodeType: 'department',
        lockedBy: 'user-1',
        lockedByName: 'Alice',
      })
      expect(result.entityId).toBe('e1')
      expect(result.lockedBy).toBe('user-1')
      expect(result.id).toBeDefined()
    })

    it('GET /locks returns project locks', async () => {
      await service.acquireLock('p1', {
        entityId: 'e1',
        nodeType: 'department',
        lockedBy: 'user-1',
        lockedByName: 'Alice',
      })
      const result = await controller.listLocks('p1')
      expect(result).toHaveLength(1)
      expect(result[0]!.entityId).toBe('e1')
    })

    it('GET /locks/by-entity returns lock for entity', async () => {
      await service.acquireLock('p1', {
        entityId: 'e1',
        nodeType: 'department',
        lockedBy: 'user-1',
        lockedByName: 'Alice',
      })
      const result = await controller.getLock('p1', 'e1')
      expect(result).not.toBeNull()
      expect(result!.lockedBy).toBe('user-1')
    })

    it('GET /locks/by-entity returns null when no lock exists', async () => {
      const result = await controller.getLock('p1', 'nonexistent')
      expect(result).toBeNull()
    })

    it('DELETE /locks/by-entity releases a lock', async () => {
      await service.acquireLock('p1', {
        entityId: 'e1',
        nodeType: 'department',
        lockedBy: 'user-1',
        lockedByName: 'Alice',
      })
      await controller.releaseLock('p1', 'e1')
      const locks = await service.listLocks('p1')
      expect(locks).toHaveLength(0)
    })

    it('POST /locks throws conflict for active lock by different user', async () => {
      await service.acquireLock('p1', {
        entityId: 'e1',
        nodeType: 'department',
        lockedBy: 'user-1',
        lockedByName: 'Alice',
      })
      await expect(
        controller.acquireLock('p1', {
          entityId: 'e1',
          nodeType: 'department',
          lockedBy: 'user-2',
          lockedByName: 'Bob',
        }),
      ).rejects.toThrow('locked')
    })

    it('POST /locks extends lock for same user', async () => {
      const first = await service.acquireLock('p1', {
        entityId: 'e1',
        nodeType: 'department',
        lockedBy: 'user-1',
        lockedByName: 'Alice',
      })
      const second = await controller.acquireLock('p1', {
        entityId: 'e1',
        nodeType: 'department',
        lockedBy: 'user-1',
        lockedByName: 'Alice',
      })
      // Same lock, but extended
      expect(second.id).toBe(first.id)
    })
  })
})
