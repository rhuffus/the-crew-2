import { Injectable } from '@nestjs/common'
import { CompanyDesignPrismaService } from '../../prisma/company-design-prisma.service'
import type { CommentRepository } from '../domain/comment-repository'
import { Comment } from '../domain/comment'
import type { CommentTargetType, ScopeType } from '@the-crew/shared-types'

@Injectable()
export class PrismaCommentRepository implements CommentRepository {
  constructor(private readonly prisma: CompanyDesignPrismaService) {}

  async findById(id: string): Promise<Comment | null> {
    const row = await this.prisma.comment.findUnique({ where: { id } })
    return row ? this.toDomain(row) : null
  }

  async listByProject(projectId: string): Promise<Comment[]> {
    const rows = await this.prisma.comment.findMany({ where: { projectId } })
    return rows.map((row) => this.toDomain(row))
  }

  async listByTarget(
    projectId: string,
    targetType: string,
    targetId: string | null,
  ): Promise<Comment[]> {
    const rows = await this.prisma.comment.findMany({
      where: {
        projectId,
        targetType,
        targetId: targetId ?? null,
      },
    })
    return rows.map((row) => this.toDomain(row))
  }

  async listByEntity(projectId: string, entityId: string): Promise<Comment[]> {
    const rows = await this.prisma.comment.findMany({
      where: { projectId, targetId: entityId },
    })
    return rows.map((row) => this.toDomain(row))
  }

  async save(comment: Comment): Promise<void> {
    const data = {
      projectId: comment.projectId,
      targetType: comment.targetType,
      targetId: comment.targetId,
      scopeType: comment.scopeType,
      authorId: comment.authorId,
      authorName: comment.authorName,
      content: comment.content,
      resolved: comment.resolved,
      parentId: comment.parentId,
      replyCount: comment.replyCount,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    }
    await this.prisma.comment.upsert({
      where: { id: comment.id },
      create: { id: comment.id, ...data },
      update: data,
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.comment.delete({ where: { id } })
  }

  private toDomain(row: {
    id: string
    projectId: string
    targetType: string
    targetId: string | null
    scopeType: string
    authorId: string
    authorName: string
    content: string
    resolved: boolean
    parentId: string | null
    replyCount: number
    createdAt: Date
    updatedAt: Date
  }): Comment {
    return Comment.reconstitute({
      id: row.id,
      projectId: row.projectId,
      targetType: row.targetType as CommentTargetType,
      targetId: row.targetId,
      scopeType: row.scopeType as ScopeType,
      authorId: row.authorId,
      authorName: row.authorName,
      content: row.content,
      resolved: row.resolved,
      parentId: row.parentId,
      replyCount: row.replyCount,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }
}
