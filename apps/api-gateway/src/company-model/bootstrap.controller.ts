import { Controller, Get, Post, Param, Body, HttpCode } from '@nestjs/common'
import type { ApprovalLevel, GrowthPace } from '@the-crew/shared-types'
import { CompanyDesignClient } from './company-design.client'

@Controller('projects/:projectId/bootstrap')
export class BootstrapProxyController {
  constructor(private readonly companyDesign: CompanyDesignClient) {}

  @Post()
  @HttpCode(201)
  bootstrap(
    @Param('projectId') projectId: string,
    @Body() body: {
      name: string
      mission: string
      companyType: string
      vision?: string
      growthPace?: GrowthPace
      approvalLevel?: ApprovalLevel
    },
  ) {
    return this.companyDesign.bootstrapProject(projectId, body)
  }

  @Get('status')
  getStatus(@Param('projectId') projectId: string) {
    return this.companyDesign.getBootstrapStatus(projectId)
  }
}
