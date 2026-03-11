import { Injectable } from '@nestjs/common'
import type { ReviewRepository } from '../domain/collaboration-repository'
import type { ReviewMarker } from '../domain/review-marker'

@Injectable()
export class InMemoryReviewRepository implements ReviewRepository {
  private readonly store = new Map<string, ReviewMarker>()

  async findById(id: string): Promise<ReviewMarker | null> {
    return this.store.get(id) ?? null
  }

  async findByEntity(projectId: string, entityId: string): Promise<ReviewMarker | null> {
    for (const review of this.store.values()) {
      if (review.projectId === projectId && review.entityId === entityId) {
        return review
      }
    }
    return null
  }

  async listByProject(projectId: string): Promise<ReviewMarker[]> {
    return [...this.store.values()].filter((r) => r.projectId === projectId)
  }

  async save(review: ReviewMarker): Promise<void> {
    this.store.set(review.id, review)
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id)
  }
}
