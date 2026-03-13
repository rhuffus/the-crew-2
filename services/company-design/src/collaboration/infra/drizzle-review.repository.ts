import { Inject, Injectable } from '@nestjs/common'
import { and, eq } from 'drizzle-orm'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { DRIZZLE_DB } from '@the-crew/drizzle-db'
import type { ReviewRepository } from '../domain/collaboration-repository'
import { ReviewMarker } from '../domain/review-marker'
import type { NodeType, ReviewStatus } from '@the-crew/shared-types'
import { reviewMarkers } from '../../drizzle/schema/review-markers'

@Injectable()
export class DrizzleReviewRepository implements ReviewRepository {
  constructor(@Inject(DRIZZLE_DB) private readonly db: PostgresJsDatabase) {}

  async findById(id: string): Promise<ReviewMarker | null> {
    const rows = await this.db
      .select()
      .from(reviewMarkers)
      .where(eq(reviewMarkers.id, id))
      .limit(1)
    return rows[0] ? this.toDomain(rows[0]) : null
  }

  async findByEntity(
    projectId: string,
    entityId: string,
  ): Promise<ReviewMarker | null> {
    const rows = await this.db
      .select()
      .from(reviewMarkers)
      .where(
        and(
          eq(reviewMarkers.projectId, projectId),
          eq(reviewMarkers.entityId, entityId),
        ),
      )
      .limit(1)
    return rows[0] ? this.toDomain(rows[0]) : null
  }

  async listByProject(projectId: string): Promise<ReviewMarker[]> {
    const rows = await this.db
      .select()
      .from(reviewMarkers)
      .where(eq(reviewMarkers.projectId, projectId))
    return rows.map((row) => this.toDomain(row))
  }

  async save(review: ReviewMarker): Promise<void> {
    const row = this.toRow(review)
    await this.db
      .insert(reviewMarkers)
      .values(row)
      .onConflictDoUpdate({ target: reviewMarkers.id, set: row })
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(reviewMarkers).where(eq(reviewMarkers.id, id))
  }

  private toDomain(row: typeof reviewMarkers.$inferSelect): ReviewMarker {
    return ReviewMarker.reconstitute({
      id: row.id,
      projectId: row.projectId,
      entityId: row.entityId,
      nodeType: row.nodeType as NodeType,
      status: row.status as ReviewStatus,
      reviewerId: row.reviewerId,
      reviewerName: row.reviewerName,
      feedback: row.feedback,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }

  private toRow(review: ReviewMarker): typeof reviewMarkers.$inferInsert {
    return {
      id: review.id,
      projectId: review.projectId,
      entityId: review.entityId,
      nodeType: review.nodeType,
      status: review.status,
      reviewerId: review.reviewerId,
      reviewerName: review.reviewerName,
      feedback: review.feedback,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    }
  }
}
