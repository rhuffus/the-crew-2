import { Controller, Get, Put, Param, Body } from '@nestjs/common'
import type { UpdateCompanyModelDto } from '@the-crew/shared-types'
import { CompanyModelService } from './application/company-model.service'

@Controller('projects/:projectId/company-model')
export class CompanyModelController {
  constructor(private readonly companyModelService: CompanyModelService) {}

  @Get()
  get(@Param('projectId') projectId: string) {
    return this.companyModelService.get(projectId)
  }

  @Put()
  update(@Param('projectId') projectId: string, @Body() dto: UpdateCompanyModelDto) {
    return this.companyModelService.update(projectId, dto)
  }
}
