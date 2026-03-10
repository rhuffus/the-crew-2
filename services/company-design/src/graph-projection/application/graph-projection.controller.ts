import { Controller, Get, Param, Query, BadRequestException } from '@nestjs/common'
import type { VisualGraphDto, VisualGraphDiffDto, ZoomLevel, LayerId } from '@the-crew/shared-types'
import { GraphProjectionService } from './graph-projection.service'

@Controller('projects/:projectId/visual-graph')
export class GraphProjectionController {
  constructor(private readonly graphProjectionService: GraphProjectionService) {}

  @Get()
  async getVisualGraph(
    @Param('projectId') projectId: string,
    @Query('level') level?: string,
    @Query('entityId') entityId?: string,
    @Query('layers') layers?: string,
  ): Promise<VisualGraphDto> {
    const zoomLevel = (level as ZoomLevel) || 'L1'

    if ((zoomLevel === 'L2' || zoomLevel === 'L3') && !entityId) {
      throw new BadRequestException(
        `entityId is required for zoom level ${zoomLevel}`,
      )
    }

    const activeLayers = layers
      ? (layers.split(',') as LayerId[])
      : null

    return this.graphProjectionService.projectGraph(
      projectId,
      zoomLevel,
      entityId ?? null,
      activeLayers,
    )
  }

  @Get('diff')
  async getVisualDiff(
    @Param('projectId') projectId: string,
    @Query('base') baseReleaseId?: string,
    @Query('compare') compareReleaseId?: string,
    @Query('level') level?: string,
    @Query('entityId') entityId?: string,
    @Query('layers') layers?: string,
  ): Promise<VisualGraphDiffDto> {
    if (!baseReleaseId) {
      throw new BadRequestException('base query parameter is required')
    }
    if (!compareReleaseId) {
      throw new BadRequestException('compare query parameter is required')
    }

    const zoomLevel = (level as ZoomLevel) || 'L1'

    if ((zoomLevel === 'L2' || zoomLevel === 'L3') && !entityId) {
      throw new BadRequestException(
        `entityId is required for zoom level ${zoomLevel}`,
      )
    }

    const activeLayers = layers
      ? (layers.split(',') as LayerId[])
      : null

    return this.graphProjectionService.projectDiff(
      projectId,
      baseReleaseId,
      compareReleaseId,
      zoomLevel,
      entityId ?? null,
      activeLayers,
    )
  }
}
