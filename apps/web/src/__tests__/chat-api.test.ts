import { describe, it, expect, vi, beforeEach } from 'vitest'
import { chatApi } from '@/api/chat'

vi.mock('@/lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}))

import { apiClient } from '@/lib/api-client'
const mock = apiClient as unknown as Record<string, ReturnType<typeof vi.fn>>

describe('chatApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getThread sends scope params', async () => {
    mock.get!.mockResolvedValue({ id: 't1' })
    await chatApi.getThread('p1', 'department', 'd1')
    expect(mock.get).toHaveBeenCalledWith(
      expect.stringContaining('/projects/p1/chat/threads/by-scope?scopeType=department&entityId=d1'),
    )
  })

  it('getThread without entityId', async () => {
    mock.get!.mockResolvedValue({ id: 't1' })
    await chatApi.getThread('p1', 'company')
    expect(mock.get).toHaveBeenCalledWith(
      expect.stringContaining('scopeType=company'),
    )
    expect(mock.get).toHaveBeenCalledWith(
      expect.not.stringContaining('entityId'),
    )
  })

  it('listThreads fetches all threads', async () => {
    mock.get!.mockResolvedValue([])
    await chatApi.listThreads('p1')
    expect(mock.get).toHaveBeenCalledWith('/projects/p1/chat/threads')
  })

  it('listMessages with limit and cursor', async () => {
    mock.get!.mockResolvedValue([])
    await chatApi.listMessages('p1', 't1', 20, 'cursor')
    expect(mock.get).toHaveBeenCalledWith(
      expect.stringContaining('/projects/p1/chat/threads/t1/messages?limit=20&before=cursor'),
    )
  })

  it('listMessages without params', async () => {
    mock.get!.mockResolvedValue([])
    await chatApi.listMessages('p1', 't1')
    expect(mock.get).toHaveBeenCalledWith('/projects/p1/chat/threads/t1/messages')
  })

  it('sendMessage posts content and refs', async () => {
    mock.post!.mockResolvedValue({ id: 'm1' })
    const refs = [{ entityId: 'e1', entityType: 'department' as const, label: 'Eng' }]
    await chatApi.sendMessage('p1', 't1', 'Hello', refs)
    expect(mock.post).toHaveBeenCalledWith(
      '/projects/p1/chat/threads/t1/messages',
      { content: 'Hello', entityRefs: refs },
    )
  })

  it('deleteThread calls delete endpoint', async () => {
    mock.delete!.mockResolvedValue(undefined)
    await chatApi.deleteThread('p1', 't1')
    expect(mock.delete).toHaveBeenCalledWith('/projects/p1/chat/threads/t1')
  })
})
