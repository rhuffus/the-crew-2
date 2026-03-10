import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  useReleases,
  useCreateRelease,
  useUpdateRelease,
  usePublishRelease,
  useDeleteRelease,
  useReleaseDiff,
} from '@/hooks/use-releases'
import { releasesApi } from '@/api/releases'
import type { ReleaseDto } from '@the-crew/shared-types'

vi.mock('@/api/releases', () => ({
  releasesApi: {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    publish: vi.fn(),
    remove: vi.fn(),
    diff: vi.fn(),
  },
}))

const mockRelease: ReleaseDto = {
  id: 'r1',
  projectId: 'p1',
  version: '1.0.0',
  status: 'draft',
  notes: 'Initial release',
  snapshot: null,
  validationIssues: [],
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  publishedAt: null,
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useReleases', () => {
  it('should fetch releases list', async () => {
    vi.mocked(releasesApi.list).mockResolvedValue([mockRelease])
    const { result } = renderHook(() => useReleases('p1'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([mockRelease])
    expect(releasesApi.list).toHaveBeenCalledWith('p1')
  })
})

describe('useCreateRelease', () => {
  it('should create a release and invalidate cache', async () => {
    vi.mocked(releasesApi.create).mockResolvedValue(mockRelease)
    const { result } = renderHook(() => useCreateRelease('p1'), { wrapper: createWrapper() })
    result.current.mutate({ version: '1.0.0', notes: 'Initial release' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(releasesApi.create).toHaveBeenCalledWith('p1', expect.objectContaining({ version: '1.0.0' }))
  })
})

describe('useUpdateRelease', () => {
  it('should update a release and invalidate cache', async () => {
    vi.mocked(releasesApi.update).mockResolvedValue({ ...mockRelease, notes: 'Updated' })
    const { result } = renderHook(() => useUpdateRelease('p1'), { wrapper: createWrapper() })
    result.current.mutate({ id: 'r1', dto: { notes: 'Updated' } })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(releasesApi.update).toHaveBeenCalledWith('p1', 'r1', { notes: 'Updated' })
  })
})

describe('usePublishRelease', () => {
  it('should publish a release and invalidate cache', async () => {
    vi.mocked(releasesApi.publish).mockResolvedValue({ ...mockRelease, status: 'published' })
    const { result } = renderHook(() => usePublishRelease('p1'), { wrapper: createWrapper() })
    result.current.mutate('r1')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(releasesApi.publish).toHaveBeenCalledWith('p1', 'r1')
  })
})

describe('useDeleteRelease', () => {
  it('should delete a release and invalidate cache', async () => {
    vi.mocked(releasesApi.remove).mockResolvedValue(undefined)
    const { result } = renderHook(() => useDeleteRelease('p1'), { wrapper: createWrapper() })
    result.current.mutate('r1')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(releasesApi.remove).toHaveBeenCalledWith('p1', 'r1')
  })
})

describe('useReleaseDiff', () => {
  it('should fetch diff when both IDs provided', async () => {
    const diffResult = { baseReleaseId: 'r1', compareReleaseId: 'r2', baseVersion: 'v1', compareVersion: 'v2', changes: [], summary: { added: 0, removed: 0, modified: 0 } }
    vi.mocked(releasesApi.diff).mockResolvedValue(diffResult)
    const { result } = renderHook(() => useReleaseDiff('p1', 'r1', 'r2'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(diffResult)
    expect(releasesApi.diff).toHaveBeenCalledWith('p1', 'r1', 'r2')
  })

  it('should not fetch when baseId is null', () => {
    const { result } = renderHook(() => useReleaseDiff('p1', null, 'r2'), { wrapper: createWrapper() })
    expect(result.current.fetchStatus).toBe('idle')
  })

  it('should not fetch when compareId is null', () => {
    const { result } = renderHook(() => useReleaseDiff('p1', 'r1', null), { wrapper: createWrapper() })
    expect(result.current.fetchStatus).toBe('idle')
  })

  it('should not fetch when baseId equals compareId', () => {
    const { result } = renderHook(() => useReleaseDiff('p1', 'r1', 'r1'), { wrapper: createWrapper() })
    expect(result.current.fetchStatus).toBe('idle')
  })
})
