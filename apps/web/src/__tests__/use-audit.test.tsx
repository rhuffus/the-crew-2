import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAudit } from '@/hooks/use-audit'
import { auditApi } from '@/api/audit'
import type { AuditEntryDto } from '@the-crew/shared-types'

vi.mock('@/api/audit', () => ({
  auditApi: {
    list: vi.fn(),
  },
}))

const mockEntry: AuditEntryDto = {
  id: 'a1',
  projectId: 'p1',
  entityType: 'department',
  entityId: 'd1',
  entityName: 'Engineering',
  action: 'created',
  changes: null,
  timestamp: '2026-01-01T00:00:00Z',
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

describe('useAudit', () => {
  it('should fetch audit entries', async () => {
    vi.mocked(auditApi.list).mockResolvedValue([mockEntry])
    const { result } = renderHook(() => useAudit('p1'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([mockEntry])
    expect(auditApi.list).toHaveBeenCalledWith('p1', undefined, undefined)
  })

  it('should fetch with entityType filter', async () => {
    vi.mocked(auditApi.list).mockResolvedValue([mockEntry])
    const { result } = renderHook(() => useAudit('p1', 'department'), {
      wrapper: createWrapper(),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(auditApi.list).toHaveBeenCalledWith('p1', 'department', undefined)
  })

  it('should fetch with entityType and entityId filters', async () => {
    vi.mocked(auditApi.list).mockResolvedValue([mockEntry])
    const { result } = renderHook(() => useAudit('p1', 'department', 'd1'), {
      wrapper: createWrapper(),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(auditApi.list).toHaveBeenCalledWith('p1', 'department', 'd1')
  })

  it('should handle error', async () => {
    vi.mocked(auditApi.list).mockRejectedValue(new Error('fail'))
    const { result } = renderHook(() => useAudit('p1'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('should return empty array for project with no activity', async () => {
    vi.mocked(auditApi.list).mockResolvedValue([])
    const { result } = renderHook(() => useAudit('p1'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([])
  })
})
