import { describe, it, expect, vi, beforeEach } from 'vitest'
import { auditApi } from '@/api/audit'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('auditApi', () => {
  it('should list audit entries without filters', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) })
    const result = await auditApi.list('p1')
    expect(result).toEqual([])
    expect(mockFetch).toHaveBeenCalledWith('/api/projects/p1/audit')
  })

  it('should list audit entries filtered by entityType', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) })
    await auditApi.list('p1', 'department')
    expect(mockFetch).toHaveBeenCalledWith('/api/projects/p1/audit?entityType=department')
  })

  it('should list audit entries filtered by entityType and entityId', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) })
    await auditApi.list('p1', 'department', 'd1')
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/projects/p1/audit?entityType=department&entityId=d1',
    )
  })

  it('should return audit entries', async () => {
    const entries = [
      {
        id: 'a1',
        projectId: 'p1',
        entityType: 'department',
        entityId: 'd1',
        entityName: 'Engineering',
        action: 'created',
        changes: null,
        timestamp: '2026-01-01T00:00:00Z',
      },
    ]
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(entries) })
    const result = await auditApi.list('p1')
    expect(result).toEqual(entries)
  })
})
