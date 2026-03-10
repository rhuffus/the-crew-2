import { describe, it, expect, vi, beforeEach } from 'vitest'
import { agentArchetypesApi } from '@/api/agent-archetypes'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

beforeEach(() => {
  vi.clearAllMocks()
})

const projectId = 'p1'

describe('agentArchetypesApi', () => {
  it('should list archetypes', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) })
    const result = await agentArchetypesApi.list(projectId)
    expect(result).toEqual([])
    expect(mockFetch).toHaveBeenCalledWith('/api/projects/p1/agent-archetypes')
  })

  it('should get an archetype by id', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ id: 'a1' }) })
    const result = await agentArchetypesApi.get(projectId, 'a1')
    expect(result).toEqual({ id: 'a1' })
    expect(mockFetch).toHaveBeenCalledWith('/api/projects/p1/agent-archetypes/a1')
  })

  it('should create an archetype', async () => {
    const dto = { name: 'Bot', description: 'A bot', roleId: 'r1', departmentId: 'd1' }
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ id: 'a1', ...dto }) })
    await agentArchetypesApi.create(projectId, dto)
    expect(mockFetch).toHaveBeenCalledWith('/api/projects/p1/agent-archetypes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    })
  })

  it('should update an archetype', async () => {
    const dto = { name: 'Updated' }
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ id: 'a1' }) })
    await agentArchetypesApi.update(projectId, 'a1', dto)
    expect(mockFetch).toHaveBeenCalledWith('/api/projects/p1/agent-archetypes/a1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    })
  })

  it('should remove an archetype', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 204, json: () => Promise.resolve(null) })
    await agentArchetypesApi.remove(projectId, 'a1')
    expect(mockFetch).toHaveBeenCalledWith('/api/projects/p1/agent-archetypes/a1', {
      method: 'DELETE',
    })
  })
})
