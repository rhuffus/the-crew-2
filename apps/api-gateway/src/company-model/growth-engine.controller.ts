import { Controller, Get, Param } from '@nestjs/common'
import { CompanyDesignClient } from './company-design.client'

@Controller('projects/:projectId/growth')
export class GrowthEngineProxyController {
  constructor(private readonly companyDesign: CompanyDesignClient) {}

  @Get('health')
  getHealth(@Param('projectId') projectId: string) {
    return this.companyDesign.getGrowthHealth(projectId)
  }

  @Get('phase-capabilities')
  getPhaseCapabilities(@Param('projectId') projectId: string) {
    return this.companyDesign.getPhaseCapabilities(projectId)
  }
}
