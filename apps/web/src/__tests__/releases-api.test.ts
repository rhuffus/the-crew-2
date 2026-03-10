import { describe, it, expect, vi, beforeEach } from 'vitest'
import { releasesApi } from '@/api/releases'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

beforeEach(() => {
  vi.clearAllMocks()
})

const projectId = 'p1'

describe('releasesApi', () => {
  it('should list releases', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) })
    const result = await releasesApi.list(projectId)
    expect(result).toEqual([])
    expect(mockFetch).toHaveBeenCalledWith('/api/projects/p1/releases')
  })

  it('should get a release by id', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ id: 'r1' }) })
    const result = await releasesApi.get(projectId, 'r1')
    expect(result).toEqual({ id: 'r1' })
    expect(mockFetch).toHaveBeenCalledWith('/api/projects/p1/releases/r1')
  })

  it('should create a release', async () => {
    const dto = { version: '1.0.0', notes: 'Initial release' }
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ id: 'r1', ...dto }) })
    await releasesApi.create(projectId, dto)
    expect(mockFetch).toHaveBeenCalledWith('/api/projects/p1/releases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    })
  })

  it('should update a release', async () => {
    const dto = { notes: 'Updated notes' }
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ id: 'r1' }) })
    await releasesApi.update(projectId, 'r1', dto)
    expect(mockFetch).toHaveBeenCalledWith('/api/projects/p1/releases/r1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    })
  })

  it('should publish a release', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ id: 'r1', status: 'published' }) })
    await releasesApi.publish(projectId, 'r1')
    expect(mockFetch).toHaveBeenCalledWith('/api/projects/p1/releases/r1/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
  })

  it('should remove a release', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 204, json: () => Promise.resolve(null) })
    await releasesApi.remove(projectId, 'r1')
    expect(mockFetch).toHaveBeenCalledWith('/api/projects/p1/releases/r1', {
      method: 'DELETE',
    })
  })

  it('should diff two releases', async () => {
    const diffResult = { changes: [], summary: { added: 0, removed: 0, modified: 0 } }
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(diffResult) })
    const result = await releasesApi.diff(projectId, 'r1', 'r2')
    expect(result).toEqual(diffResult)
    expect(mockFetch).toHaveBeenCalledWith('/api/projects/p1/releases/r1/diff/r2')
  })
})
