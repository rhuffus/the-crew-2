import { Controller, Get, Param } from '@nestjs/common'
import { CompanyDesignClient } from './company-design.client'

@Controller('projects/:projectId/validations')
export class ValidationsController {
  constructor(private readonly companyDesign: CompanyDesignClient) {}

  @Get()
  validate(@Param('projectId') projectId: string) {
    return this.companyDesign.getValidations(projectId)
  }
}
