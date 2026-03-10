import { describe, it, expect, vi, beforeEach } from 'vitest'
import { contractsApi } from '@/api/contracts'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

beforeEach(() => {
  vi.clearAllMocks()
})

const projectId = 'p1'

describe('contractsApi', () => {
  it('should list contracts', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) })
    const result = await contractsApi.list(projectId)
    expect(result).toEqual([])
    expect(mockFetch).toHaveBeenCalledWith('/api/projects/p1/contracts')
  })

  it('should get a contract by id', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ id: 'c1' }) })
    const result = await contractsApi.get(projectId, 'c1')
    expect(result).toEqual({ id: 'c1' })
    expect(mockFetch).toHaveBeenCalledWith('/api/projects/p1/contracts/c1')
  })

  it('should create a contract', async () => {
    const dto = {
      name: 'SLA',
      description: 'desc',
      type: 'SLA' as const,
      providerId: 'd1',
      providerType: 'department' as const,
      consumerId: 'd2',
      consumerType: 'department' as const,
    }
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ id: 'c1', ...dto }) })
    await contractsApi.create(projectId, dto)
    expect(mockFetch).toHaveBeenCalledWith('/api/projects/p1/contracts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    })
  })

  it('should update a contract', async () => {
    const dto = { name: 'Updated SLA' }
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ id: 'c1' }) })
    await contractsApi.update(projectId, 'c1', dto)
    expect(mockFetch).toHaveBeenCalledWith('/api/projects/p1/contracts/c1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    })
  })

  it('should remove a contract', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 204, json: () => Promise.resolve(null) })
    await contractsApi.remove(projectId, 'c1')
    expect(mockFetch).toHaveBeenCalledWith('/api/projects/p1/contracts/c1', {
      method: 'DELETE',
    })
  })
})
