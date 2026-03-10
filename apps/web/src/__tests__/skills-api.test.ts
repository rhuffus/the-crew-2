import { describe, it, expect, vi, beforeEach } from 'vitest'
import { skillsApi } from '@/api/skills'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

beforeEach(() => {
  vi.clearAllMocks()
})

const projectId = 'p1'

describe('skillsApi', () => {
  it('should list skills', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) })
    const result = await skillsApi.list(projectId)
    expect(result).toEqual([])
    expect(mockFetch).toHaveBeenCalledWith('/api/projects/p1/skills')
  })

  it('should get a skill by id', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ id: 's1' }) })
    const result = await skillsApi.get(projectId, 's1')
    expect(result).toEqual({ id: 's1' })
    expect(mockFetch).toHaveBeenCalledWith('/api/projects/p1/skills/s1')
  })

  it('should create a skill', async () => {
    const dto = { name: 'Deploy', description: 'Deploys', category: 'DevOps' }
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ id: 's1', ...dto }) })
    await skillsApi.create(projectId, dto)
    expect(mockFetch).toHaveBeenCalledWith('/api/projects/p1/skills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    })
  })

  it('should update a skill', async () => {
    const dto = { name: 'Updated' }
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ id: 's1' }) })
    await skillsApi.update(projectId, 's1', dto)
    expect(mockFetch).toHaveBeenCalledWith('/api/projects/p1/skills/s1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    })
  })

  it('should remove a skill', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 204, json: () => Promise.resolve(null) })
    await skillsApi.remove(projectId, 's1')
    expect(mockFetch).toHaveBeenCalledWith('/api/projects/p1/skills/s1', {
      method: 'DELETE',
    })
  })
})
