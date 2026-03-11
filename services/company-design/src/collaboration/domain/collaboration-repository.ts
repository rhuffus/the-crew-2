import type { ReviewMarker } from './review-marker'
import type { EntityLock } from './entity-lock'

export const REVIEW_REPOSITORY = Symbol('REVIEW_REPOSITORY')
export const LOCK_REPOSITORY = Symbol('LOCK_REPOSITORY')

export interface ReviewRepository {
  findById(id: string): Promise<ReviewMarker | null>
  findByEntity(projectId: string, entityId: string): Promise<ReviewMarker | null>
  listByProject(projectId: string): Promise<ReviewMarker[]>
  save(review: ReviewMarker): Promise<void>
  delete(id: string): Promise<void>
}

export interface LockRepository {
  findByEntity(projectId: string, entityId: string): Promise<EntityLock | null>
  listByProject(projectId: string): Promise<EntityLock[]>
  save(lock: EntityLock): Promise<void>
  delete(id: string): Promise<void>
}
