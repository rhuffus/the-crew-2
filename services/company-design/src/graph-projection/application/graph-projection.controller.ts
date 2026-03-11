import { Controller, Get, Param, Query, BadRequestException } from '@nestjs/common'
import type { VisualGraphDto, VisualGraphDiffDto, ZoomLevel, LayerId, ScopeType } from '@the-crew/shared-types'
import { SCOPE_REGISTRY, scopeTypeFromZoomLevel } from '@the-crew/shared-types'
import { GraphProjectionService } from './graph-projection.service'

@Controller('projects/:projectId/visual-graph')
export class GraphProjectionController {
  constructor(private readonly graphProjectionService: GraphProjectionService) {}

  @Get()
  async getVisualGraph(
    @Param('projectId') projectId: string,
    @Query('scope') scope?: string,
    @Query('level') level?: string,
    @Query('entityId') entityId?: string,
    @Query('layers') layers?: string,
  ): Promise<VisualGraphDto> {
    // scope= takes precedence over level= (backward compat)
    const resolvedScopeType = this.resolveScope(scope, level)

    const def = SCOPE_REGISTRY[resolvedScopeType]
    if (def.requiresEntityId && !entityId) {
      throw new BadRequestException(
        `entityId is required for scope type ${resolvedScopeType}`,
      )
    }

    const activeLayers = layers
      ? (layers.split(',') as LayerId[])
      : null

    return this.graphProjectionService.projectGraph(
      projectId,
      resolvedScopeType,
      entityId ?? null,
      activeLayers,
    )
  }

  @Get('diff')
  async getVisualDiff(
    @Param('projectId') projectId: string,
    @Query('base') baseReleaseId?: string,
    @Query('compare') compareReleaseId?: string,
    @Query('scope') scope?: string,
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

    const resolvedScopeType = this.resolveScope(scope, level)

    const def = SCOPE_REGISTRY[resolvedScopeType]
    if (def.requiresEntityId && !entityId) {
      throw new BadRequestException(
        `entityId is required for scope type ${resolvedScopeType}`,
      )
    }

    const activeLayers = layers
      ? (layers.split(',') as LayerId[])
      : null

    return this.graphProjectionService.projectDiff(
      projectId,
      baseReleaseId,
      compareReleaseId,
      resolvedScopeType,
      entityId ?? null,
      activeLayers,
    )
  }

  private resolveScope(scope?: string, level?: string): ScopeType {
    if (scope) {
      if (!(scope in SCOPE_REGISTRY)) {
        throw new BadRequestException(`Unknown scope type: ${scope}`)
      }
      return scope as ScopeType
    }
    if (level) {
      return scopeTypeFromZoomLevel(level as ZoomLevel)
    }
    return 'company'
  }
}
