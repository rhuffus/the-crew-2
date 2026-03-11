import { Injectable } from '@nestjs/common'
import type { CommentRepository } from '../domain/comment-repository'
import type { Comment } from '../domain/comment'

@Injectable()
export class InMemoryCommentRepository implements CommentRepository {
  private readonly store = new Map<string, Comment>()

  async findById(id: string): Promise<Comment | null> {
    return this.store.get(id) ?? null
  }

  async listByProject(projectId: string): Promise<Comment[]> {
    return [...this.store.values()].filter((c) => c.projectId === projectId)
  }

  async listByTarget(projectId: string, targetType: string, targetId: string | null): Promise<Comment[]> {
    return [...this.store.values()].filter(
      (c) => c.projectId === projectId && c.targetType === targetType && c.targetId === targetId,
    )
  }

  async listByEntity(projectId: string, entityId: string): Promise<Comment[]> {
    return [...this.store.values()].filter(
      (c) => c.projectId === projectId && c.targetId === entityId,
    )
  }

  async save(comment: Comment): Promise<void> {
    this.store.set(comment.id, comment)
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id)
  }
}
