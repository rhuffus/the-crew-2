import { describe, it, expect, vi, beforeEach } from 'vitest'
import { policiesApi } from '@/api/policies'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

beforeEach(() => {
  vi.clearAllMocks()
})

const projectId = 'p1'

describe('policiesApi', () => {
  it('should list policies', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) })
    const result = await policiesApi.list(projectId)
    expect(result).toEqual([])
    expect(mockFetch).toHaveBeenCalledWith('/api/projects/p1/policies')
  })

  it('should get a policy by id', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ id: 'pol1' }) })
    const result = await policiesApi.get(projectId, 'pol1')
    expect(result).toEqual({ id: 'pol1' })
    expect(mockFetch).toHaveBeenCalledWith('/api/projects/p1/policies/pol1')
  })

  it('should create a policy', async () => {
    const dto = {
      name: 'No orphans',
      description: 'Every role must belong to a department',
      scope: 'global' as const,
      type: 'constraint' as const,
      condition: 'All roles assigned',
      enforcement: 'mandatory' as const,
    }
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ id: 'pol1', ...dto }) })
    await policiesApi.create(projectId, dto)
    expect(mockFetch).toHaveBeenCalledWith('/api/projects/p1/policies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    })
  })

  it('should update a policy', async () => {
    const dto = { name: 'Updated' }
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ id: 'pol1' }) })
    await policiesApi.update(projectId, 'pol1', dto)
    expect(mockFetch).toHaveBeenCalledWith('/api/projects/p1/policies/pol1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    })
  })

  it('should remove a policy', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 204, json: () => Promise.resolve(null) })
    await policiesApi.remove(projectId, 'pol1')
    expect(mockFetch).toHaveBeenCalledWith('/api/projects/p1/policies/pol1', {
      method: 'DELETE',
    })
  })
})
