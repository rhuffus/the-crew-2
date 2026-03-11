import 'reflect-metadata'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CommentsController } from './comments.controller'
import type { CompanyDesignClient } from './company-design.client'
import type { CreateCommentDto } from '@the-crew/shared-types'

const mockClient = {
  listComments: vi.fn(),
  getComment: vi.fn(),
  createComment: vi.fn(),
  updateComment: vi.fn(),
  resolveComment: vi.fn(),
  deleteComment: vi.fn(),
}

describe('CommentsController (gateway)', () => {
  let controller: CommentsController

  beforeEach(() => {
    vi.clearAllMocks()
    controller = new CommentsController(mockClient as unknown as CompanyDesignClient)
  })

  it('should list comments with optional filters', async () => {
    mockClient.listComments.mockResolvedValue([{ id: 'c1', content: 'Hello' }])
    const result = await controller.list('p1', 'department', 'd1')
    expect(result).toEqual([{ id: 'c1', content: 'Hello' }])
    expect(mockClient.listComments).toHaveBeenCalledWith('p1', 'department', 'd1')
  })

  it('should get a comment by id', async () => {
    mockClient.getComment.mockResolvedValue({ id: 'c1', content: 'Hello' })
    const result = await controller.get('c1', 'p1')
    expect(result).toEqual({ id: 'c1', content: 'Hello' })
    expect(mockClient.getComment).toHaveBeenCalledWith('c1', 'p1')
  })

  it('should create a comment', async () => {
    const dto = { content: 'New comment', targetType: 'department', targetId: 'd1' }
    mockClient.createComment.mockResolvedValue({ id: 'c1', ...dto })
    const result = await controller.create('p1', dto as CreateCommentDto)
    expect(result).toEqual({ id: 'c1', ...dto })
    expect(mockClient.createComment).toHaveBeenCalledWith('p1', dto)
  })

  it('should resolve a comment', async () => {
    mockClient.resolveComment.mockResolvedValue({ id: 'c1', resolved: true })
    const result = await controller.resolve('c1', 'p1')
    expect(result).toEqual({ id: 'c1', resolved: true })
    expect(mockClient.resolveComment).toHaveBeenCalledWith('c1', 'p1')
  })

  it('should delete a comment', async () => {
    mockClient.deleteComment.mockResolvedValue(undefined)
    await controller.remove('c1', 'p1')
    expect(mockClient.deleteComment).toHaveBeenCalledWith('c1', 'p1')
  })
})
