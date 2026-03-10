import { Controller, Get, Param, Query } from '@nestjs/common'
import { CompanyDesignClient } from './company-design.client'

@Controller('projects/:projectId/audit')
export class AuditController {
  constructor(private readonly companyDesign: CompanyDesignClient) {}

  @Get()
  list(
    @Param('projectId') projectId: string,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
  ) {
    return this.companyDesign.listAudits(projectId, entityType, entityId)
  }
}
