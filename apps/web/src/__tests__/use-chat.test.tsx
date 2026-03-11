import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useChatThread, useChatMessages, useSendMessage, useChatThreads } from '@/hooks/use-chat'

vi.mock('@/api/chat', () => ({
  chatApi: {
    getThread: vi.fn(),
    listThreads: vi.fn(),
    listMessages: vi.fn(),
    sendMessage: vi.fn(),
    deleteThread: vi.fn(),
  },
}))

import { chatApi } from '@/api/chat'
const mock = chatApi as unknown as Record<string, ReturnType<typeof vi.fn>>

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('useChatThread', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetches thread for scope', async () => {
    mock.getThread!.mockResolvedValue({ id: 't1', scopeType: 'company' })
    const { result } = renderHook(() => useChatThread('p1', 'company'), {
      wrapper: createWrapper(),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.id).toBe('t1')
    expect(mock.getThread).toHaveBeenCalledWith('p1', 'company', undefined)
  })

  it('passes entityId for department scope', async () => {
    mock.getThread!.mockResolvedValue({ id: 't2', scopeType: 'department' })
    const { result } = renderHook(() => useChatThread('p1', 'department', 'd1'), {
      wrapper: createWrapper(),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mock.getThread).toHaveBeenCalledWith('p1', 'department', 'd1')
  })

  it('disabled when no projectId', () => {
    const { result } = renderHook(() => useChatThread('', 'company'), {
      wrapper: createWrapper(),
    })
    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useChatMessages', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetches messages when threadId provided', async () => {
    mock.listMessages!.mockResolvedValue([{ id: 'm1', content: 'Hello' }])
    const { result } = renderHook(() => useChatMessages('p1', 't1'), {
      wrapper: createWrapper(),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(1)
  })

  it('disabled when no threadId', () => {
    const { result } = renderHook(() => useChatMessages('p1', undefined), {
      wrapper: createWrapper(),
    })
    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useSendMessage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('sends message via mutation', async () => {
    mock.sendMessage!.mockResolvedValue({ id: 'm1', content: 'Test' })
    const { result } = renderHook(() => useSendMessage('p1', 't1'), {
      wrapper: createWrapper(),
    })
    result.current.mutate({ content: 'Test' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mock.sendMessage).toHaveBeenCalledWith('p1', 't1', 'Test', undefined)
  })
})

describe('useChatThreads', () => {
  beforeEach(() => vi.clearAllMocks())

  it('lists all project threads', async () => {
    mock.listThreads!.mockResolvedValue([{ id: 't1' }, { id: 't2' }])
    const { result } = renderHook(() => useChatThreads('p1'), {
      wrapper: createWrapper(),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(2)
  })
})
