import { Injectable } from '@nestjs/common'
import { CompanyDesignPrismaService } from '../../prisma/company-design-prisma.service'
import type { ReviewRepository } from '../domain/collaboration-repository'
import { ReviewMarker } from '../domain/review-marker'
import type { NodeType, ReviewStatus } from '@the-crew/shared-types'

@Injectable()
export class PrismaReviewRepository implements ReviewRepository {
  constructor(private readonly prisma: CompanyDesignPrismaService) {}

  async findById(id: string): Promise<ReviewMarker | null> {
    const row = await this.prisma.reviewMarker.findUnique({ where: { id } })
    return row ? this.toDomain(row) : null
  }

  async findByEntity(
    projectId: string,
    entityId: string,
  ): Promise<ReviewMarker | null> {
    const row = await this.prisma.reviewMarker.findFirst({
      where: { projectId, entityId },
    })
    return row ? this.toDomain(row) : null
  }

  async listByProject(projectId: string): Promise<ReviewMarker[]> {
    const rows = await this.prisma.reviewMarker.findMany({ where: { projectId } })
    return rows.map((row) => this.toDomain(row))
  }

  async save(review: ReviewMarker): Promise<void> {
    const data = {
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
    await this.prisma.reviewMarker.upsert({
      where: { id: review.id },
      create: { id: review.id, ...data },
      update: data,
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.reviewMarker.delete({ where: { id } })
  }

  private toDomain(row: {
    id: string
    projectId: string
    entityId: string
    nodeType: string
    status: string
    reviewerId: string
    reviewerName: string
    feedback: string | null
    createdAt: Date
    updatedAt: Date
  }): ReviewMarker {
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
}
