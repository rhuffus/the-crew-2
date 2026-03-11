import { describe, it, expect, vi, beforeEach } from 'vitest'
import { reviewsApi, locksApi } from '@/api/collaboration'

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

describe('reviewsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('list fetches all reviews for project', async () => {
    mock.get!.mockResolvedValue([])
    await reviewsApi.list('p1')
    expect(mock.get).toHaveBeenCalledWith('/projects/p1/collaboration/reviews')
  })

  it('getByEntity fetches review by entity id', async () => {
    mock.get!.mockResolvedValue({ id: 'r1', entityId: 'e1' })
    await reviewsApi.getByEntity('p1', 'e1')
    expect(mock.get).toHaveBeenCalledWith(
      '/projects/p1/collaboration/reviews/by-entity?entityId=e1',
    )
  })

  it('create posts review marker dto', async () => {
    const dto = { entityId: 'e1', nodeType: 'department' as const, status: 'pending' as const, reviewerId: 'u1', reviewerName: 'Reviewer' }
    mock.post!.mockResolvedValue({ id: 'r1', ...dto })
    await reviewsApi.create('p1', dto)
    expect(mock.post).toHaveBeenCalledWith('/projects/p1/collaboration/reviews', dto)
  })

  it('update patches review marker', async () => {
    const dto = { status: 'approved' as const, feedback: 'Looks good' }
    mock.patch!.mockResolvedValue({ id: 'r1', ...dto })
    await reviewsApi.update('p1', 'r1', dto)
    expect(mock.patch).toHaveBeenCalledWith('/projects/p1/collaboration/reviews/r1', dto)
  })

  it('delete removes review marker', async () => {
    mock.delete!.mockResolvedValue(undefined)
    await reviewsApi.delete('p1', 'r1')
    expect(mock.delete).toHaveBeenCalledWith('/projects/p1/collaboration/reviews/r1')
  })
})

describe('locksApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('list fetches all locks for project', async () => {
    mock.get!.mockResolvedValue([])
    await locksApi.list('p1')
    expect(mock.get).toHaveBeenCalledWith('/projects/p1/collaboration/locks')
  })

  it('getByEntity fetches lock by entity id', async () => {
    mock.get!.mockResolvedValue({ id: 'l1', entityId: 'e1' })
    await locksApi.getByEntity('p1', 'e1')
    expect(mock.get).toHaveBeenCalledWith(
      '/projects/p1/collaboration/locks/by-entity?entityId=e1',
    )
  })

  it('release deletes lock by entity id', async () => {
    mock.delete!.mockResolvedValue(undefined)
    await locksApi.release('p1', 'e1')
    expect(mock.delete).toHaveBeenCalledWith(
      '/projects/p1/collaboration/locks/by-entity?entityId=e1',
    )
  })
})
