import type { Comment } from './comment'

export const COMMENT_REPOSITORY = Symbol('COMMENT_REPOSITORY')

export interface CommentRepository {
  findById(id: string): Promise<Comment | null>
  listByProject(projectId: string): Promise<Comment[]>
  listByTarget(projectId: string, targetType: string, targetId: string | null): Promise<Comment[]>
  listByEntity(projectId: string, entityId: string): Promise<Comment[]>
  save(comment: Comment): Promise<void>
  delete(id: string): Promise<void>
}
