import type { CommentDto } from '@the-crew/shared-types'
import type { Comment } from '../domain/comment'

export class CommentMapper {
  static toDto(comment: Comment): CommentDto {
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
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
    }
  }
}
