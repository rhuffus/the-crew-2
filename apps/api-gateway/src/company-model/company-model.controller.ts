import { Controller, Get, Put, Param, Body } from '@nestjs/common'
import type { UpdateCompanyModelDto } from '@the-crew/shared-types'
import { CompanyDesignClient } from './company-design.client'

@Controller('projects/:projectId/company-model')
export class CompanyModelController {
  constructor(private readonly companyDesign: CompanyDesignClient) {}

  @Get()
  get(@Param('projectId') projectId: string) {
    return this.companyDesign.getCompanyModel(projectId)
  }

  @Put()
  update(@Param('projectId') projectId: string, @Body() dto: UpdateCompanyModelDto) {
    return this.companyDesign.updateCompanyModel(projectId, dto)
  }
}
