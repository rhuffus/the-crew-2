import { describe, it, expect, vi, beforeEach } from 'vitest'
import { workflowsApi } from '@/api/workflows'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

beforeEach(() => {
  vi.clearAllMocks()
})

const projectId = 'p1'

describe('workflowsApi', () => {
  it('should list workflows', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) })
    const result = await workflowsApi.list(projectId)
    expect(result).toEqual([])
    expect(mockFetch).toHaveBeenCalledWith('/api/projects/p1/workflows')
  })

  it('should get a workflow by id', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ id: 'w1' }) })
    const result = await workflowsApi.get(projectId, 'w1')
    expect(result).toEqual({ id: 'w1' })
    expect(mockFetch).toHaveBeenCalledWith('/api/projects/p1/workflows/w1')
  })

  it('should create a workflow', async () => {
    const dto = { name: 'Onboarding', description: 'New hire flow' }
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ id: 'w1', ...dto }) })
    await workflowsApi.create(projectId, dto)
    expect(mockFetch).toHaveBeenCalledWith('/api/projects/p1/workflows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    })
  })

  it('should update a workflow', async () => {
    const dto = { name: 'Updated Flow' }
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ id: 'w1' }) })
    await workflowsApi.update(projectId, 'w1', dto)
    expect(mockFetch).toHaveBeenCalledWith('/api/projects/p1/workflows/w1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    })
  })

  it('should remove a workflow', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 204, json: () => Promise.resolve(null) })
    await workflowsApi.remove(projectId, 'w1')
    expect(mockFetch).toHaveBeenCalledWith('/api/projects/p1/workflows/w1', {
      method: 'DELETE',
    })
  })
})
