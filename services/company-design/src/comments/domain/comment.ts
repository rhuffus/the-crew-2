import { Entity } from '@the-crew/domain-core'
import { randomUUID } from 'crypto'
import type { CommentTargetType, ScopeType } from '@the-crew/shared-types'

export interface CommentProps {
  id: string
  projectId: string
  targetType: CommentTargetType
  targetId: string | null
  scopeType: ScopeType
  authorId: string
  authorName: string
  content: string
  resolved: boolean
  parentId: string | null
  replyCount: number
  createdAt: Date
  updatedAt: Date
}

export class Comment extends Entity<string> {
  readonly projectId: string
  readonly targetType: CommentTargetType
  readonly targetId: string | null
  readonly scopeType: ScopeType
  readonly authorId: string
  readonly authorName: string
  private _content: string
  private _resolved: boolean
  readonly parentId: string | null
  private _replyCount: number
  readonly createdAt: Date
  private _updatedAt: Date

  private constructor(props: CommentProps) {
    super(props.id)
    this.projectId = props.projectId
    this.targetType = props.targetType
    this.targetId = props.targetId
    this.scopeType = props.scopeType
    this.authorId = props.authorId
    this.authorName = props.authorName
    this._content = props.content
    this._resolved = props.resolved
    this.parentId = props.parentId
    this._replyCount = props.replyCount
    this.createdAt = props.createdAt
    this._updatedAt = props.updatedAt
  }

  static create(
    projectId: string,
    targetType: CommentTargetType,
    targetId: string | null,
    scopeType: ScopeType,
    authorId: string,
    authorName: string,
    content: string,
    parentId: string | null = null,
  ): Comment {
    if (!content || content.trim().length === 0) {
      throw new Error('Comment content must not be empty')
    }
    const now = new Date()
    return new Comment({
      id: randomUUID(),
      projectId,
      targetType,
      targetId,
      scopeType,
      authorId,
      authorName,
      content: content.trim(),
      resolved: false,
      parentId,
      replyCount: 0,
      createdAt: now,
      updatedAt: now,
    })
  }

  static reconstitute(props: CommentProps): Comment {
    return new Comment(props)
  }

  get content(): string {
    return this._content
  }

  get resolved(): boolean {
    return this._resolved
  }

  get replyCount(): number {
    return this._replyCount
  }

  get updatedAt(): Date {
    return this._updatedAt
  }

  updateContent(content: string): void {
    if (!content || content.trim().length === 0) {
      throw new Error('Comment content must not be empty')
    }
    this._content = content.trim()
    this._updatedAt = new Date()
  }

  resolve(): void {
    this._resolved = true
    this._updatedAt = new Date()
  }

  unresolve(): void {
    this._resolved = false
    this._updatedAt = new Date()
  }

  incrementReplyCount(): void {
    this._replyCount += 1
  }
}
