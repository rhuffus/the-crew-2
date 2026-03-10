import { Controller, Get, Param, Query } from '@nestjs/common'
import { AuditService } from './application/audit.service'

@Controller('projects/:projectId/audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  list(
    @Param('projectId') projectId: string,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
  ) {
    if (entityType && entityId) {
      return this.auditService.listByEntity(projectId, entityType, entityId)
    }
    return this.auditService.listByProject(projectId)
  }
}
