import type { ReviewMarkerDto, EntityLockDto } from '@the-crew/shared-types'
import type { ReviewMarker } from '../domain/review-marker'
import type { EntityLock } from '../domain/entity-lock'

export class CollaborationMapper {
  static reviewToDto(review: ReviewMarker): ReviewMarkerDto {
    return {
      id: review.id,
      projectId: review.projectId,
      entityId: review.entityId,
      nodeType: review.nodeType,
      status: review.status,
      reviewerId: review.reviewerId,
      reviewerName: review.reviewerName,
      feedback: review.feedback,
      createdAt: review.createdAt.toISOString(),
      updatedAt: review.updatedAt.toISOString(),
    }
  }

  static lockToDto(lock: EntityLock): EntityLockDto {
    return {
      id: lock.id,
      projectId: lock.projectId,
      entityId: lock.entityId,
      nodeType: lock.nodeType,
      lockedBy: lock.lockedBy,
      lockedByName: lock.lockedByName,
      lockedAt: lock.lockedAt.toISOString(),
      expiresAt: lock.expiresAt.toISOString(),
    }
  }
}
