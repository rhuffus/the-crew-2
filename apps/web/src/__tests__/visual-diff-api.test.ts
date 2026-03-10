import { describe, it, expect, vi, beforeEach } from 'vitest'
import { visualGraphApi } from '@/api/visual-graph'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('visual diff api', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('should call GET with base and compare params', async () => {
    const mockDiff = { projectId: 'p1', nodes: [], edges: [], summary: {} }
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockDiff),
    })

    const result = await visualGraphApi.getVisualDiff({
      projectId: 'p1',
      baseReleaseId: 'rel-1',
      compareReleaseId: 'rel-2',
    })

    expect(result).toEqual(mockDiff)
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/projects/p1/visual-graph/diff?base=rel-1&compare=rel-2',
    )
  })

  it('should pass level and entityId as query params', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    })

    await visualGraphApi.getVisualDiff({
      projectId: 'p1',
      baseReleaseId: 'rel-1',
      compareReleaseId: 'rel-2',
      level: 'L2',
      entityId: 'dept-1',
    })

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/projects/p1/visual-graph/diff?base=rel-1&compare=rel-2&level=L2&entityId=dept-1',
    )
  })

  it('should pass layers as comma-separated query param', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    })

    await visualGraphApi.getVisualDiff({
      projectId: 'p1',
      baseReleaseId: 'rel-1',
      compareReleaseId: 'rel-2',
      layers: ['organization', 'capabilities'],
    })

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/projects/p1/visual-graph/diff?base=rel-1&compare=rel-2&layers=organization%2Ccapabilities',
    )
  })

  it('should throw on error response', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: () => Promise.resolve({ code: 'BAD_REQUEST', message: 'Missing base release' }),
    })

    await expect(
      visualGraphApi.getVisualDiff({
        projectId: 'p1',
        baseReleaseId: '',
        compareReleaseId: 'rel-2',
      }),
    ).rejects.toThrow('Missing base release')
  })
})
