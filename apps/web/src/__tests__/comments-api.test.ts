import { describe, it, expect, vi, beforeEach } from 'vitest'
import { commentsApi } from '@/api/comments'

vi.mock('@/lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

import { apiClient } from '@/lib/api-client'
const mock = apiClient as unknown as Record<string, ReturnType<typeof vi.fn>>

describe('commentsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('list sends no params when none provided', async () => {
    mock.get!.mockResolvedValue([])
    await commentsApi.list('p1')
    expect(mock.get).toHaveBeenCalledWith('/projects/p1/comments')
  })

  it('list builds query string with targetType and targetId', async () => {
    mock.get!.mockResolvedValue([])
    await commentsApi.list('p1', 'node', 'n1')
    expect(mock.get).toHaveBeenCalledWith(
      '/projects/p1/comments?targetType=node&targetId=n1',
    )
  })

  it('get fetches single comment by id', async () => {
    mock.get!.mockResolvedValue({ id: 'c1' })
    await commentsApi.get('p1', 'c1')
    expect(mock.get).toHaveBeenCalledWith('/projects/p1/comments/c1')
  })

  it('create posts comment dto', async () => {
    const dto = { targetType: 'node' as const, scopeType: 'company' as const, authorId: 'u1', authorName: 'User', content: 'Hello' }
    mock.post!.mockResolvedValue({ id: 'c1', ...dto })
    await commentsApi.create('p1', dto)
    expect(mock.post).toHaveBeenCalledWith('/projects/p1/comments', dto)
  })

  it('resolve patches comment resolve endpoint', async () => {
    mock.patch!.mockResolvedValue({ id: 'c1', resolved: true })
    await commentsApi.resolve('p1', 'c1')
    expect(mock.patch).toHaveBeenCalledWith('/projects/p1/comments/c1/resolve', {})
  })

  it('delete calls delete endpoint', async () => {
    mock.delete!.mockResolvedValue(undefined)
    await commentsApi.delete('p1', 'c1')
    expect(mock.delete).toHaveBeenCalledWith('/projects/p1/comments/c1')
  })
})
