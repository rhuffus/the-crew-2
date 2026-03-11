import { describe, it, expect } from 'vitest'
import { Comment } from './comment'

describe('Comment', () => {
  it('creates a scope comment', () => {
    const comment = Comment.create('p1', 'scope', null, 'company', 'u1', 'Alice', 'Hello')
    expect(comment.projectId).toBe('p1')
    expect(comment.targetType).toBe('scope')
    expect(comment.targetId).toBeNull()
    expect(comment.scopeType).toBe('company')
    expect(comment.authorId).toBe('u1')
    expect(comment.authorName).toBe('Alice')
    expect(comment.content).toBe('Hello')
    expect(comment.resolved).toBe(false)
    expect(comment.parentId).toBeNull()
    expect(comment.replyCount).toBe(0)
    expect(comment.createdAt).toBeInstanceOf(Date)
    expect(comment.updatedAt).toBeInstanceOf(Date)
    expect(comment.id).toBeDefined()
  })

  it('creates a node comment with targetId', () => {
    const comment = Comment.create('p1', 'node', 'n1', 'department', 'u1', 'Bob', 'Node note')
    expect(comment.targetType).toBe('node')
    expect(comment.targetId).toBe('n1')
    expect(comment.scopeType).toBe('department')
  })

  it('creates a reply comment with parentId', () => {
    const comment = Comment.create('p1', 'scope', null, 'company', 'u1', 'Alice', 'Reply', 'parent-123')
    expect(comment.parentId).toBe('parent-123')
  })

  it('trims content on create', () => {
    const comment = Comment.create('p1', 'scope', null, 'company', 'u1', 'Alice', '  Hello  ')
    expect(comment.content).toBe('Hello')
  })

  it('rejects empty content on create', () => {
    expect(() => Comment.create('p1', 'scope', null, 'company', 'u1', 'Alice', '')).toThrow(
      'Comment content must not be empty',
    )
  })

  it('rejects whitespace-only content on create', () => {
    expect(() => Comment.create('p1', 'scope', null, 'company', 'u1', 'Alice', '   ')).toThrow(
      'Comment content must not be empty',
    )
  })

  it('reconstitutes a comment', () => {
    const original = Comment.create('p1', 'edge', 'e1', 'workflow', 'u1', 'Carol', 'Edge note')
    const reconstituted = Comment.reconstitute({
      id: original.id,
      projectId: original.projectId,
      targetType: original.targetType,
      targetId: original.targetId,
      scopeType: original.scopeType,
      authorId: original.authorId,
      authorName: original.authorName,
      content: original.content,
      resolved: original.resolved,
      parentId: original.parentId,
      replyCount: original.replyCount,
      createdAt: original.createdAt,
      updatedAt: original.updatedAt,
    })
    expect(reconstituted.id).toBe(original.id)
    expect(reconstituted.content).toBe('Edge note')
    expect(reconstituted.targetType).toBe('edge')
    expect(reconstituted.targetId).toBe('e1')
    expect(reconstituted.resolved).toBe(false)
  })

  it('updateContent changes content and updatedAt', () => {
    const comment = Comment.create('p1', 'scope', null, 'company', 'u1', 'Alice', 'Original')
    const originalUpdatedAt = comment.updatedAt
    // Small delay to ensure timestamp difference
    comment.updateContent('Updated content')
    expect(comment.content).toBe('Updated content')
    expect(comment.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime())
  })

  it('updateContent trims content', () => {
    const comment = Comment.create('p1', 'scope', null, 'company', 'u1', 'Alice', 'Original')
    comment.updateContent('  Trimmed  ')
    expect(comment.content).toBe('Trimmed')
  })

  it('updateContent rejects empty content', () => {
    const comment = Comment.create('p1', 'scope', null, 'company', 'u1', 'Alice', 'Original')
    expect(() => comment.updateContent('')).toThrow('Comment content must not be empty')
  })

  it('resolve sets resolved to true and updates updatedAt', () => {
    const comment = Comment.create('p1', 'scope', null, 'company', 'u1', 'Alice', 'Issue')
    expect(comment.resolved).toBe(false)
    comment.resolve()
    expect(comment.resolved).toBe(true)
  })

  it('unresolve sets resolved to false and updates updatedAt', () => {
    const comment = Comment.create('p1', 'scope', null, 'company', 'u1', 'Alice', 'Issue')
    comment.resolve()
    expect(comment.resolved).toBe(true)
    comment.unresolve()
    expect(comment.resolved).toBe(false)
  })

  it('incrementReplyCount increases replyCount', () => {
    const comment = Comment.create('p1', 'scope', null, 'company', 'u1', 'Alice', 'Parent')
    expect(comment.replyCount).toBe(0)
    comment.incrementReplyCount()
    expect(comment.replyCount).toBe(1)
    comment.incrementReplyCount()
    expect(comment.replyCount).toBe(2)
  })
})
