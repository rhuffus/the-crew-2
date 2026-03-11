import 'reflect-metadata'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CollaborationController } from './collaboration.controller'
import type { CompanyDesignClient } from './company-design.client'

const mockClient = {
  listReviews: vi.fn(),
  getReviewByEntity: vi.fn(),
  createReview: vi.fn(),
  updateReview: vi.fn(),
  deleteReview: vi.fn(),
  listLocks: vi.fn(),
  getLock: vi.fn(),
  acquireLock: vi.fn(),
  releaseLock: vi.fn(),
}

describe('CollaborationController (gateway)', () => {
  let controller: CollaborationController

  beforeEach(() => {
    vi.clearAllMocks()
    controller = new CollaborationController(mockClient as unknown as CompanyDesignClient)
  })

  it('should list reviews', async () => {
    mockClient.listReviews.mockResolvedValue([{ id: 'r1', status: 'pending' }])
    const result = await controller.listReviews('p1')
    expect(result).toEqual([{ id: 'r1', status: 'pending' }])
    expect(mockClient.listReviews).toHaveBeenCalledWith('p1')
  })

  it('should get reviews by entity', async () => {
    mockClient.getReviewByEntity.mockResolvedValue([{ id: 'r1', entityId: 'e1' }])
    const result = await controller.getReviewByEntity('p1', 'e1')
    expect(result).toEqual([{ id: 'r1', entityId: 'e1' }])
    expect(mockClient.getReviewByEntity).toHaveBeenCalledWith('p1', 'e1')
  })

  it('should create a review', async () => {
    const dto = { entityId: 'e1', entityType: 'department', status: 'needs-review' }
    mockClient.createReview.mockResolvedValue({ id: 'r1', ...dto })
    const result = await controller.createReview('p1', dto as any)
    expect(result).toEqual({ id: 'r1', ...dto })
    expect(mockClient.createReview).toHaveBeenCalledWith('p1', dto)
  })

  it('should acquire a lock', async () => {
    const dto = { entityId: 'e1', entityType: 'department' }
    mockClient.acquireLock.mockResolvedValue({ id: 'l1', ...dto, lockedBy: 'user1' })
    const result = await controller.acquireLock('p1', dto as any)
    expect(result).toEqual({ id: 'l1', ...dto, lockedBy: 'user1' })
    expect(mockClient.acquireLock).toHaveBeenCalledWith('p1', dto)
  })

  it('should release a lock by entity', async () => {
    mockClient.releaseLock.mockResolvedValue(undefined)
    await controller.releaseLock('p1', 'e1')
    expect(mockClient.releaseLock).toHaveBeenCalledWith('p1', 'e1')
  })
})
