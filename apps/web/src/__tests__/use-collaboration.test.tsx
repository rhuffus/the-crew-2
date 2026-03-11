import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useReviews, useReviewByEntity, useCreateReview, useLocks, useLockByEntity, useReleaseLock } from '@/hooks/use-collaboration'

vi.mock('@/api/collaboration', () => ({
  reviewsApi: {
    list: vi.fn(),
    getByEntity: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  locksApi: {
    list: vi.fn(),
    getByEntity: vi.fn(),
    acquire: vi.fn(),
    release: vi.fn(),
  },
}))

import { reviewsApi, locksApi } from '@/api/collaboration'
const reviewsMock = reviewsApi as unknown as Record<string, ReturnType<typeof vi.fn>>
const locksMock = locksApi as unknown as Record<string, ReturnType<typeof vi.fn>>

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('useReviews', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetches reviews for project', async () => {
    reviewsMock.list!.mockResolvedValue([{ id: 'r1', status: 'pending' }])
    const { result } = renderHook(() => useReviews('p1'), {
      wrapper: createWrapper(),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(1)
  })
})

describe('useReviewByEntity', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetches review by entity id', async () => {
    reviewsMock.getByEntity!.mockResolvedValue({ id: 'r1', entityId: 'e1' })
    const { result } = renderHook(() => useReviewByEntity('p1', 'e1'), {
      wrapper: createWrapper(),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.id).toBe('r1')
    expect(reviewsMock.getByEntity).toHaveBeenCalledWith('p1', 'e1')
  })

  it('disabled when no entityId', () => {
    const { result } = renderHook(() => useReviewByEntity('p1', null), {
      wrapper: createWrapper(),
    })
    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useCreateReview', () => {
  beforeEach(() => vi.clearAllMocks())

  it('creates review via mutation', async () => {
    const dto = { entityId: 'e1', nodeType: 'department' as const, status: 'pending' as const, reviewerId: 'u1', reviewerName: 'Reviewer' }
    reviewsMock.create!.mockResolvedValue({ id: 'r1', ...dto })
    const { result } = renderHook(() => useCreateReview('p1'), {
      wrapper: createWrapper(),
    })
    result.current.mutate(dto)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(reviewsMock.create).toHaveBeenCalledWith('p1', dto)
  })
})

describe('useLocks', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetches locks for project', async () => {
    locksMock.list!.mockResolvedValue([{ id: 'l1', entityId: 'e1' }])
    const { result } = renderHook(() => useLocks('p1'), {
      wrapper: createWrapper(),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(1)
  })
})

describe('useLockByEntity', () => {
  beforeEach(() => vi.clearAllMocks())

  it('disabled when no entityId', () => {
    const { result } = renderHook(() => useLockByEntity('p1', null), {
      wrapper: createWrapper(),
    })
    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useReleaseLock', () => {
  beforeEach(() => vi.clearAllMocks())

  it('releases lock via mutation', async () => {
    locksMock.release!.mockResolvedValue(undefined)
    const { result } = renderHook(() => useReleaseLock('p1'), {
      wrapper: createWrapper(),
    })
    result.current.mutate({ entityId: 'e1' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(locksMock.release).toHaveBeenCalledWith('p1', 'e1')
  })
})
