import { describe, it, expect, vi, beforeEach } from 'vitest'
import { visualGraphApi } from '@/api/visual-graph'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('visual graph api', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('should call GET /api/projects/:id/visual-graph with defaults', async () => {
    const mockGraph = { projectId: 'p1', nodes: [], edges: [] }
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockGraph),
    })

    const result = await visualGraphApi.getVisualGraph({ projectId: 'p1' })
    expect(result).toEqual(mockGraph)
    expect(mockFetch).toHaveBeenCalledWith('/api/projects/p1/visual-graph')
  })

  it('should pass level and entityId as query params', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    })

    await visualGraphApi.getVisualGraph({
      projectId: 'p1',
      level: 'L2',
      entityId: 'dept-1',
    })

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/projects/p1/visual-graph?level=L2&entityId=dept-1',
    )
  })

  it('should pass layers as comma-separated query param', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    })

    await visualGraphApi.getVisualGraph({
      projectId: 'p1',
      layers: ['organization', 'capabilities'],
    })

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/projects/p1/visual-graph?layers=organization%2Ccapabilities',
    )
  })

  it('should throw on error response', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: () => Promise.resolve({ code: 'NOT_FOUND', message: 'Not found' }),
    })

    await expect(
      visualGraphApi.getVisualGraph({ projectId: 'missing' }),
    ).rejects.toThrow('Not found')
  })
})
