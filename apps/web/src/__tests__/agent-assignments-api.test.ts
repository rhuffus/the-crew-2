import { describe, it, expect, vi, beforeEach } from 'vitest'
import { agentAssignmentsApi } from '@/api/agent-assignments'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

beforeEach(() => {
  vi.clearAllMocks()
})

const projectId = 'p1'

describe('agentAssignmentsApi', () => {
  it('should list assignments', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) })
    const result = await agentAssignmentsApi.list(projectId)
    expect(result).toEqual([])
    expect(mockFetch).toHaveBeenCalledWith('/api/projects/p1/agent-assignments')
  })

  it('should get an assignment by id', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ id: 'as1' }) })
    const result = await agentAssignmentsApi.get(projectId, 'as1')
    expect(result).toEqual({ id: 'as1' })
    expect(mockFetch).toHaveBeenCalledWith('/api/projects/p1/agent-assignments/as1')
  })

  it('should create an assignment', async () => {
    const dto = { archetypeId: 'a1', name: 'Deployer' }
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ id: 'as1', ...dto }) })
    await agentAssignmentsApi.create(projectId, dto)
    expect(mockFetch).toHaveBeenCalledWith('/api/projects/p1/agent-assignments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    })
  })

  it('should update an assignment', async () => {
    const dto = { name: 'Updated' }
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ id: 'as1' }) })
    await agentAssignmentsApi.update(projectId, 'as1', dto)
    expect(mockFetch).toHaveBeenCalledWith('/api/projects/p1/agent-assignments/as1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    })
  })

  it('should remove an assignment', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 204, json: () => Promise.resolve(null) })
    await agentAssignmentsApi.remove(projectId, 'as1')
    expect(mockFetch).toHaveBeenCalledWith('/api/projects/p1/agent-assignments/as1', {
      method: 'DELETE',
    })
  })
})
