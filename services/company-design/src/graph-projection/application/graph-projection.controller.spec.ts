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
    scopeType: 'company',
    scope: { level: 'L1', entityId: null, entityType: null },
    zoomLevel: 'L1',
    nodes: [],
    edges: [],
    activeLayers: ['organization'],
    breadcrumb: [{ label: 'Co', nodeType: 'company', entityId: 'p1', zoomLevel: 'L1' }],
  }

  const mockDiff: VisualGraphDiffDto = {
    projectId: 'p1',
    scopeType: 'company',
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

  it('should call service with company scope when no params provided', async () => {
    const result = await controller.getVisualGraph('p1')

    expect(mockService.projectGraph).toHaveBeenCalledWith('p1', 'company', null, null)
    expect(result).toBe(mockGraph)
  })

  it('should use scope param directly', async () => {
    await controller.getVisualGraph('p1', 'workflow', undefined, 'wf1')

    expect(mockService.projectGraph).toHaveBeenCalledWith('p1', 'workflow', 'wf1', null)
  })

  it('should translate level to scope type for backward compat', async () => {
    await controller.getVisualGraph('p1', undefined, 'L3', 'wf1')

    expect(mockService.projectGraph).toHaveBeenCalledWith('p1', 'workflow', 'wf1', null)
  })

  it('should parse comma-separated layers', async () => {
    await controller.getVisualGraph('p1', 'company', undefined, undefined, 'organization,governance')

    expect(mockService.projectGraph).toHaveBeenCalledWith(
      'p1', 'company', null, ['organization', 'governance'],
    )
  })

  it('should throw BadRequestException when department scope without entityId', async () => {
    await expect(
      controller.getVisualGraph('p1', 'department'),
    ).rejects.toThrow(BadRequestException)
  })

  it('should throw BadRequestException when workflow scope without entityId', async () => {
    await expect(
      controller.getVisualGraph('p1', 'workflow'),
    ).rejects.toThrow(BadRequestException)
  })

  it('should throw BadRequestException when L2 without entityId (backward compat)', async () => {
    await expect(
      controller.getVisualGraph('p1', undefined, 'L2'),
    ).rejects.toThrow(BadRequestException)
  })

  it('should throw BadRequestException for unknown scope type', async () => {
    await expect(
      controller.getVisualGraph('p1', 'invalid-scope'),
    ).rejects.toThrow(BadRequestException)
  })

  it('scope param takes precedence over level param', async () => {
    await controller.getVisualGraph('p1', 'department', 'L3', 'd1')

    expect(mockService.projectGraph).toHaveBeenCalledWith('p1', 'department', 'd1', null)
  })

  // ---- getVisualDiff tests ----

  describe('getVisualDiff', () => {
    it('should call service.projectDiff with company scope by default', async () => {
      const result = await controller.getVisualDiff('p1', 'rel-1', 'rel-2')

      expect(mockService.projectDiff).toHaveBeenCalledWith('p1', 'rel-1', 'rel-2', 'company', null, null)
      expect(result).toBe(mockDiff)
    })

    it('should use scope param for diff', async () => {
      await controller.getVisualDiff('p1', 'rel-1', 'rel-2', 'department', undefined, 'd1', 'organization,capabilities')

      expect(mockService.projectDiff).toHaveBeenCalledWith(
        'p1', 'rel-1', 'rel-2', 'department', 'd1', ['organization', 'capabilities'],
      )
    })

    it('should translate level to scope type for diff (backward compat)', async () => {
      await controller.getVisualDiff('p1', 'rel-1', 'rel-2', undefined, 'L2', 'd1')

      expect(mockService.projectDiff).toHaveBeenCalledWith(
        'p1', 'rel-1', 'rel-2', 'department', 'd1', null,
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

    it('should throw BadRequestException when department scope without entityId', async () => {
      await expect(
        controller.getVisualDiff('p1', 'rel-1', 'rel-2', 'department'),
      ).rejects.toThrow(BadRequestException)
    })

    it('should throw BadRequestException when workflow scope without entityId', async () => {
      await expect(
        controller.getVisualDiff('p1', 'rel-1', 'rel-2', 'workflow'),
      ).rejects.toThrow(BadRequestException)
    })

    it('should pass null layers when not provided', async () => {
      await controller.getVisualDiff('p1', 'rel-1', 'rel-2')

      expect(mockService.projectDiff).toHaveBeenCalledWith('p1', 'rel-1', 'rel-2', 'company', null, null)
    })

    it('should pass entityId for workflow scope', async () => {
      await controller.getVisualDiff('p1', 'rel-1', 'rel-2', 'workflow', undefined, 'wf1')

      expect(mockService.projectDiff).toHaveBeenCalledWith('p1', 'rel-1', 'rel-2', 'workflow', 'wf1', null)
    })
  })
})
