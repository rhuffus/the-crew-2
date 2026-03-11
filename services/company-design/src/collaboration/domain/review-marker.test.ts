import { describe, it, expect } from 'vitest'
import { ReviewMarker } from './review-marker'
import type { CreateReviewMarkerDto } from '@the-crew/shared-types'

describe('ReviewMarker', () => {
  const baseDto: CreateReviewMarkerDto = {
    entityId: 'e1',
    nodeType: 'department',
    status: 'pending',
    reviewerId: 'user-1',
    reviewerName: 'Alice',
  }

  it('creates a review marker with defaults', () => {
    const review = ReviewMarker.create('p1', baseDto)
    expect(review.id).toBeDefined()
    expect(review.projectId).toBe('p1')
    expect(review.entityId).toBe('e1')
    expect(review.nodeType).toBe('department')
    expect(review.status).toBe('pending')
    expect(review.reviewerId).toBe('user-1')
    expect(review.reviewerName).toBe('Alice')
    expect(review.feedback).toBeNull()
    expect(review.createdAt).toBeInstanceOf(Date)
    expect(review.updatedAt).toBeInstanceOf(Date)
  })

  it('creates a review marker with feedback', () => {
    const dto: CreateReviewMarkerDto = { ...baseDto, feedback: 'Looks good' }
    const review = ReviewMarker.create('p1', dto)
    expect(review.feedback).toBe('Looks good')
  })

  it('creates a review marker with approved status', () => {
    const dto: CreateReviewMarkerDto = { ...baseDto, status: 'approved' }
    const review = ReviewMarker.create('p1', dto)
    expect(review.status).toBe('approved')
  })

  it('reconstitute restores a review marker', () => {
    const original = ReviewMarker.create('p1', baseDto)
    const restored = ReviewMarker.reconstitute({
      id: original.id,
      projectId: original.projectId,
      entityId: original.entityId,
      nodeType: original.nodeType,
      status: original.status,
      reviewerId: original.reviewerId,
      reviewerName: original.reviewerName,
      feedback: original.feedback,
      createdAt: original.createdAt,
      updatedAt: original.updatedAt,
    })
    expect(restored.id).toBe(original.id)
    expect(restored.projectId).toBe('p1')
    expect(restored.status).toBe('pending')
  })

  it('update changes status', () => {
    const review = ReviewMarker.create('p1', baseDto)
    const beforeUpdate = review.updatedAt
    review.update({ status: 'approved' })
    expect(review.status).toBe('approved')
    expect(review.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime())
  })

  it('update changes feedback', () => {
    const review = ReviewMarker.create('p1', baseDto)
    review.update({ feedback: 'Needs more detail' })
    expect(review.feedback).toBe('Needs more detail')
  })

  it('update changes both status and feedback', () => {
    const review = ReviewMarker.create('p1', baseDto)
    review.update({ status: 'needs-changes', feedback: 'Fix the naming' })
    expect(review.status).toBe('needs-changes')
    expect(review.feedback).toBe('Fix the naming')
  })

  it('update can set feedback to null', () => {
    const dto: CreateReviewMarkerDto = { ...baseDto, feedback: 'Some feedback' }
    const review = ReviewMarker.create('p1', dto)
    review.update({ feedback: null })
    expect(review.feedback).toBeNull()
  })

  it('update with empty object only bumps updatedAt', () => {
    const review = ReviewMarker.create('p1', baseDto)
    const statusBefore = review.status
    const feedbackBefore = review.feedback
    review.update({})
    expect(review.status).toBe(statusBefore)
    expect(review.feedback).toBe(feedbackBefore)
  })

  it('entity equality by id', () => {
    const review = ReviewMarker.create('p1', baseDto)
    const same = ReviewMarker.reconstitute({
      id: review.id,
      projectId: 'p1',
      entityId: 'e1',
      nodeType: 'department',
      status: 'approved',
      reviewerId: 'user-1',
      reviewerName: 'Alice',
      feedback: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    expect(review.equals(same)).toBe(true)
  })
})
