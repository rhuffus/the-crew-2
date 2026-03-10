import { Controller, Get, Param } from '@nestjs/common'
import { ValidationService } from './application/validation.service'

@Controller('projects/:projectId/validations')
export class ValidationsController {
  constructor(private readonly validationService: ValidationService) {}

  @Get()
  validate(@Param('projectId') projectId: string) {
    return this.validationService.validate(projectId)
  }
}
