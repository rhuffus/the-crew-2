import 'reflect-metadata'
import { describe, it, expect, beforeEach } from 'vitest'
import { CommentController } from './comment.controller'
import { CommentService } from './comment.service'
import { InMemoryCommentRepository } from '../infrastructure/in-memory-comment.repository'

describe('CommentController', () => {
  let controller: CommentController
  let service: CommentService

  beforeEach(() => {
    const repo = new InMemoryCommentRepository()
    service = new CommentService(repo)
    controller = new CommentController(service)
  })

  it('GET / returns project comments', async () => {
    await service.create('p1', {
      targetType: 'scope',
      scopeType: 'company',
      authorId: 'u1',
      authorName: 'Alice',
      content: 'Hello',
    })
    const result = await controller.list('p1')
    expect(result).toHaveLength(1)
    expect(result[0]!.content).toBe('Hello')
  })

  it('GET / with targetType filters by target', async () => {
    await service.create('p1', {
      targetType: 'node',
      targetId: 'n1',
      scopeType: 'company',
      authorId: 'u1',
      authorName: 'Alice',
      content: 'Node comment',
    })
    await service.create('p1', {
      targetType: 'scope',
      scopeType: 'company',
      authorId: 'u1',
      authorName: 'Alice',
      content: 'Scope comment',
    })
    const result = await controller.list('p1', 'node', 'n1')
    expect(result).toHaveLength(1)
    expect(result[0]!.content).toBe('Node comment')
  })

  it('GET /:id returns a specific comment', async () => {
    const created = await service.create('p1', {
      targetType: 'scope',
      scopeType: 'company',
      authorId: 'u1',
      authorName: 'Alice',
      content: 'Test',
    })
    const result = await controller.getById(created.id)
    expect(result.id).toBe(created.id)
    expect(result.content).toBe('Test')
  })

  it('POST / creates a comment with 201', async () => {
    const result = await controller.create('p1', {
      targetType: 'node',
      targetId: 'n1',
      scopeType: 'department',
      authorId: 'u1',
      authorName: 'Bob',
      content: 'New comment',
    })
    expect(result.content).toBe('New comment')
    expect(result.targetType).toBe('node')
    expect(result.targetId).toBe('n1')
    expect(result.projectId).toBe('p1')
  })

  it('PATCH /:id updates a comment', async () => {
    const created = await service.create('p1', {
      targetType: 'scope',
      scopeType: 'company',
      authorId: 'u1',
      authorName: 'Alice',
      content: 'Original',
    })
    const result = await controller.update(created.id, { content: 'Updated' })
    expect(result.content).toBe('Updated')
  })

  it('PATCH /:id/resolve resolves a comment', async () => {
    const created = await service.create('p1', {
      targetType: 'scope',
      scopeType: 'company',
      authorId: 'u1',
      authorName: 'Alice',
      content: 'Issue',
    })
    const result = await controller.resolve(created.id)
    expect(result.resolved).toBe(true)
  })

  it('DELETE /:id deletes a comment', async () => {
    const created = await service.create('p1', {
      targetType: 'scope',
      scopeType: 'company',
      authorId: 'u1',
      authorName: 'Alice',
      content: 'To delete',
    })
    await controller.delete(created.id)
    const remaining = await service.listByProject('p1')
    expect(remaining).toHaveLength(0)
  })

  it('GET /:id throws for non-existent comment', async () => {
    await expect(controller.getById('unknown')).rejects.toThrow('not found')
  })

  it('DELETE /:id throws for non-existent comment', async () => {
    await expect(controller.delete('unknown')).rejects.toThrow('not found')
  })
})
