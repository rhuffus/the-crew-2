import { Controller, Get, Param, Query } from '@nestjs/common'
import type { VisualGraphDto, VisualGraphDiffDto } from '@the-crew/shared-types'
import { CompanyDesignClient } from './company-design.client'

@Controller('projects/:projectId/visual-graph')
export class VisualGraphController {
  constructor(private readonly companyDesign: CompanyDesignClient) {}

  @Get()
  getVisualGraph(
    @Param('projectId') projectId: string,
    @Query('scope') scope?: string,
    @Query('level') level?: string,
    @Query('entityId') entityId?: string,
    @Query('layers') layers?: string,
  ): Promise<VisualGraphDto> {
    return this.companyDesign.getVisualGraph(projectId, scope, level, entityId, layers)
  }

  @Get('diff')
  getVisualDiff(
    @Param('projectId') projectId: string,
    @Query('base') baseReleaseId: string,
    @Query('compare') compareReleaseId: string,
    @Query('scope') scope?: string,
    @Query('level') level?: string,
    @Query('entityId') entityId?: string,
    @Query('layers') layers?: string,
  ): Promise<VisualGraphDiffDto> {
    return this.companyDesign.getVisualGraphDiff(
      projectId,
      baseReleaseId,
      compareReleaseId,
      scope,
      level,
      entityId,
      layers,
    )
  }
}
