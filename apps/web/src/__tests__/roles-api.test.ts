import { describe, it, expect, vi, beforeEach } from 'vitest'
import { rolesApi } from '@/api/roles'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

beforeEach(() => {
  vi.clearAllMocks()
})

const projectId = 'p1'

describe('rolesApi', () => {
  it('should list roles', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) })
    const result = await rolesApi.list(projectId)
    expect(result).toEqual([])
    expect(mockFetch).toHaveBeenCalledWith('/api/projects/p1/roles')
  })

  it('should get a role by id', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ id: 'r1' }) })
    const result = await rolesApi.get(projectId, 'r1')
    expect(result).toEqual({ id: 'r1' })
    expect(mockFetch).toHaveBeenCalledWith('/api/projects/p1/roles/r1')
  })

  it('should create a role', async () => {
    const dto = { name: 'PM', description: 'Product Manager', departmentId: 'd1' }
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ id: 'r1', ...dto }) })
    await rolesApi.create(projectId, dto)
    expect(mockFetch).toHaveBeenCalledWith('/api/projects/p1/roles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    })
  })

  it('should update a role', async () => {
    const dto = { name: 'Updated' }
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ id: 'r1' }) })
    await rolesApi.update(projectId, 'r1', dto)
    expect(mockFetch).toHaveBeenCalledWith('/api/projects/p1/roles/r1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    })
  })

  it('should remove a role', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 204, json: () => Promise.resolve(null) })
    await rolesApi.remove(projectId, 'r1')
    expect(mockFetch).toHaveBeenCalledWith('/api/projects/p1/roles/r1', {
      method: 'DELETE',
    })
  })
})
