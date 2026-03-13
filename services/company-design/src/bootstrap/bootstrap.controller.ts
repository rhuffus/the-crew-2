import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common'
import { CeoFirstBootstrapService, type BootstrapInput } from './ceo-first-bootstrap.service'

@Controller('projects/:projectId/bootstrap')
export class BootstrapController {
  constructor(private readonly bootstrapService: CeoFirstBootstrapService) {}

  @Post()
  @HttpCode(201)
  bootstrap(
    @Param('projectId') projectId: string,
    @Body() body: {
      name: string
      mission: string
      companyType: string
      vision?: string
      growthPace?: 'conservative' | 'moderate' | 'aggressive'
      approvalLevel?: 'all-changes' | 'structural-only' | 'budget-only' | 'none'
    },
  ) {
    const input: BootstrapInput = { projectId, ...body }
    return this.bootstrapService.bootstrap(input)
  }

  @Get('status')
  getStatus(@Param('projectId') projectId: string) {
    return this.bootstrapService.getStatus(projectId)
  }
}
