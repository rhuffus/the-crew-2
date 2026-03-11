import { describe, it, expect, vi, beforeEach } from 'vitest'
import { savedViewsApi } from '@/api/saved-views'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function mockResponse(data: unknown, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    statusText: 'OK',
  })
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('savedViewsApi', () => {
  it('should list saved views', async () => {
    const views = [{ id: 'sv1', name: 'My View' }]
    mockFetch.mockReturnValue(mockResponse(views))
    const result = await savedViewsApi.list('p1')
    expect(result).toEqual(views)
    expect(mockFetch).toHaveBeenCalledWith('/api/projects/p1/saved-views')
  })

  it('should create a saved view', async () => {
    const view = { id: 'sv1', name: 'My View' }
    mockFetch.mockReturnValue(mockResponse(view))
    const dto = { name: 'My View', state: { activeLayers: ['organization' as const], nodeTypeFilter: null, statusFilter: null } }
    const result = await savedViewsApi.create('p1', dto)
    expect(result).toEqual(view)
    expect(mockFetch).toHaveBeenCalledWith('/api/projects/p1/saved-views', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify(dto),
    }))
  })

  it('should update a saved view', async () => {
    const view = { id: 'sv1', name: 'Updated' }
    mockFetch.mockReturnValue(mockResponse(view))
    const result = await savedViewsApi.update('p1', 'sv1', { name: 'Updated' })
    expect(result).toEqual(view)
    expect(mockFetch).toHaveBeenCalledWith('/api/projects/p1/saved-views/sv1', expect.objectContaining({
      method: 'PATCH',
    }))
  })

  it('should remove a saved view', async () => {
    mockFetch.mockReturnValue(Promise.resolve({ ok: true, status: 204 }))
    await savedViewsApi.remove('p1', 'sv1')
    expect(mockFetch).toHaveBeenCalledWith('/api/projects/p1/saved-views/sv1', expect.objectContaining({
      method: 'DELETE',
    }))
  })
})
