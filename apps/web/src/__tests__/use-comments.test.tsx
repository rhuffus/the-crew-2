import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useComments, useCreateComment, useResolveComment } from '@/hooks/use-comments'

vi.mock('@/api/comments', () => ({
  commentsApi: {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    resolve: vi.fn(),
    delete: vi.fn(),
  },
}))

import { commentsApi } from '@/api/comments'
const mock = commentsApi as unknown as Record<string, ReturnType<typeof vi.fn>>

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('useComments', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetches comments for project', async () => {
    mock.list!.mockResolvedValue([{ id: 'c1', content: 'Hello' }])
    const { result } = renderHook(() => useComments('p1'), {
      wrapper: createWrapper(),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(1)
    expect(mock.list).toHaveBeenCalledWith('p1', undefined, undefined)
  })

  it('passes targetType and targetId', async () => {
    mock.list!.mockResolvedValue([])
    const { result } = renderHook(() => useComments('p1', 'node', 'n1'), {
      wrapper: createWrapper(),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mock.list).toHaveBeenCalledWith('p1', 'node', 'n1')
  })

  it('disabled when no projectId', () => {
    const { result } = renderHook(() => useComments(''), {
      wrapper: createWrapper(),
    })
    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useCreateComment', () => {
  beforeEach(() => vi.clearAllMocks())

  it('creates comment via mutation', async () => {
    const dto = { targetType: 'node' as const, scopeType: 'company' as const, authorId: 'u1', authorName: 'User', content: 'Test' }
    mock.create!.mockResolvedValue({ id: 'c1', ...dto })
    const { result } = renderHook(() => useCreateComment('p1'), {
      wrapper: createWrapper(),
    })
    result.current.mutate(dto)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mock.create).toHaveBeenCalledWith('p1', dto)
  })
})

describe('useResolveComment', () => {
  beforeEach(() => vi.clearAllMocks())

  it('resolves comment via mutation', async () => {
    mock.resolve!.mockResolvedValue({ id: 'c1', resolved: true })
    const { result } = renderHook(() => useResolveComment('p1'), {
      wrapper: createWrapper(),
    })
    result.current.mutate({ id: 'c1' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mock.resolve).toHaveBeenCalledWith('p1', 'c1')
  })
})
