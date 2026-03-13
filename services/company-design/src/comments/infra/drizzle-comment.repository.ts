import { Inject, Injectable } from '@nestjs/common'
import { and, eq, isNull } from 'drizzle-orm'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { DRIZZLE_DB } from '@the-crew/drizzle-db'
import type { CommentRepository } from '../domain/comment-repository'
import { Comment } from '../domain/comment'
import type { CommentTargetType, ScopeType } from '@the-crew/shared-types'
import { comments } from '../../drizzle/schema/comments'

@Injectable()
export class DrizzleCommentRepository implements CommentRepository {
  constructor(@Inject(DRIZZLE_DB) private readonly db: PostgresJsDatabase) {}

  async findById(id: string): Promise<Comment | null> {
    const rows = await this.db
      .select()
      .from(comments)
      .where(eq(comments.id, id))
      .limit(1)
    return rows[0] ? this.toDomain(rows[0]) : null
  }

  async listByProject(projectId: string): Promise<Comment[]> {
    const rows = await this.db
      .select()
      .from(comments)
      .where(eq(comments.projectId, projectId))
    return rows.map((row) => this.toDomain(row))
  }

  async listByTarget(
    projectId: string,
    targetType: string,
    targetId: string | null,
  ): Promise<Comment[]> {
    const conditions = [
      eq(comments.projectId, projectId),
      eq(comments.targetType, targetType),
    ]
    if (targetId !== null) {
      conditions.push(eq(comments.targetId, targetId))
    } else {
      conditions.push(isNull(comments.targetId))
    }
    const rows = await this.db
      .select()
      .from(comments)
      .where(and(...conditions))
    return rows.map((row) => this.toDomain(row))
  }

  async listByEntity(projectId: string, entityId: string): Promise<Comment[]> {
    const rows = await this.db
      .select()
      .from(comments)
      .where(
        and(
          eq(comments.projectId, projectId),
          eq(comments.targetId, entityId),
        ),
      )
    return rows.map((row) => this.toDomain(row))
  }

  async save(comment: Comment): Promise<void> {
    const row = this.toRow(comment)
    await this.db
      .insert(comments)
      .values(row)
      .onConflictDoUpdate({ target: comments.id, set: row })
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(comments).where(eq(comments.id, id))
  }

  private toDomain(row: typeof comments.$inferSelect): Comment {
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

  private toRow(comment: Comment): typeof comments.$inferInsert {
    return {
      id: comment.id,
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
  }
}
