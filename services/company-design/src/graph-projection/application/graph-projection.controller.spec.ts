import 'reflect-metadata'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GraphProjectionController } from './graph-projection.controller'
import { BadRequestException } from '@nestjs/common'
import type { VisualGraphDto, VisualGraphDiffDto } from '@the-crew/shared-types'

describe('GraphProjectionController', () => {
  let controller: GraphProjectionController
  let mockService: {
    projectGraph: ReturnType<typeof vi.fn>
    projectDiff: ReturnType<typeof vi.fn>
  }

  const mockGraph: VisualGraphDto = {
    projectId: 'p1',
    scope: { level: 'L1', entityId: null, entityType: null },
    zoomLevel: 'L1',
    nodes: [],
    edges: [],
    activeLayers: ['organization'],
    breadcrumb: [{ label: 'Co', nodeType: 'company', entityId: 'p1', zoomLevel: 'L1' }],
  }

  const mockDiff: VisualGraphDiffDto = {
    projectId: 'p1',
    scope: { level: 'L1', entityId: null, entityType: null },
    zoomLevel: 'L1',
    baseReleaseId: 'rel-1',
    compareReleaseId: 'rel-2',
    nodes: [],
    edges: [],
    activeLayers: ['organization'],
    breadcrumb: [{ label: 'Co', nodeType: 'company', entityId: 'p1', zoomLevel: 'L1' }],
    summary: {
      nodesAdded: 0, nodesRemoved: 0, nodesModified: 0, nodesUnchanged: 0,
      edgesAdded: 0, edgesRemoved: 0, edgesModified: 0, edgesUnchanged: 0,
    },
  }

  beforeEach(() => {
    mockService = {
      projectGraph: vi.fn().mockResolvedValue(mockGraph),
      projectDiff: vi.fn().mockResolvedValue(mockDiff),
    }
    controller = new GraphProjectionController(mockService as any)
  })

  // ---- getVisualGraph tests ----

  it('should call service with default L1 when no level provided', async () => {
    const result = await controller.getVisualGraph('p1')

    expect(mockService.projectGraph).toHaveBeenCalledWith('p1', 'L1', null, null)
    expect(result).toBe(mockGraph)
  })

  it('should parse level and entityId', async () => {
    await controller.getVisualGraph('p1', 'L3', 'wf1')

    expect(mockService.projectGraph).toHaveBeenCalledWith('p1', 'L3', 'wf1', null)
  })

  it('should parse comma-separated layers', async () => {
    await controller.getVisualGraph('p1', 'L1', undefined, 'organization,governance')

    expect(mockService.projectGraph).toHaveBeenCalledWith(
      'p1', 'L1', null, ['organization', 'governance'],
    )
  })

  it('should throw BadRequestException when L2 without entityId', async () => {
    await expect(
      controller.getVisualGraph('p1', 'L2'),
    ).rejects.toThrow(BadRequestException)
  })

  it('should throw BadRequestException when L3 without entityId', async () => {
    await expect(
      controller.getVisualGraph('p1', 'L3'),
    ).rejects.toThrow(BadRequestException)
  })

  // ---- getVisualDiff tests ----

  describe('getVisualDiff', () => {
    it('should call service.projectDiff with default L1', async () => {
      const result = await controller.getVisualDiff('p1', 'rel-1', 'rel-2')

      expect(mockService.projectDiff).toHaveBeenCalledWith('p1', 'rel-1', 'rel-2', 'L1', null, null)
      expect(result).toBe(mockDiff)
    })

    it('should parse level, entityId, and layers', async () => {
      await controller.getVisualDiff('p1', 'rel-1', 'rel-2', 'L2', 'd1', 'organization,capabilities')

      expect(mockService.projectDiff).toHaveBeenCalledWith(
        'p1', 'rel-1', 'rel-2', 'L2', 'd1', ['organization', 'capabilities'],
      )
    })

    it('should throw BadRequestException when base is missing', async () => {
      await expect(
        controller.getVisualDiff('p1', undefined, 'rel-2'),
      ).rejects.toThrow(BadRequestException)
    })

    it('should throw BadRequestException when compare is missing', async () => {
      await expect(
        controller.getVisualDiff('p1', 'rel-1', undefined),
      ).rejects.toThrow(BadRequestException)
    })

    it('should throw BadRequestException when L2 without entityId', async () => {
      await expect(
        controller.getVisualDiff('p1', 'rel-1', 'rel-2', 'L2'),
      ).rejects.toThrow(BadRequestException)
    })

    it('should throw BadRequestException when L3 without entityId', async () => {
      await expect(
        controller.getVisualDiff('p1', 'rel-1', 'rel-2', 'L3'),
      ).rejects.toThrow(BadRequestException)
    })

    it('should pass null layers when not provided', async () => {
      await controller.getVisualDiff('p1', 'rel-1', 'rel-2', 'L1', undefined, undefined)

      expect(mockService.projectDiff).toHaveBeenCalledWith('p1', 'rel-1', 'rel-2', 'L1', null, null)
    })

    it('should pass entityId for L3 scope', async () => {
      await controller.getVisualDiff('p1', 'rel-1', 'rel-2', 'L3', 'wf1')

      expect(mockService.projectDiff).toHaveBeenCalledWith('p1', 'rel-1', 'rel-2', 'L3', 'wf1', null)
    })
  })
})
