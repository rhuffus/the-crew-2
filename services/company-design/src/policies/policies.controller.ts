import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
} from '@nestjs/common'
import type { CreatePolicyDto, UpdatePolicyDto } from '@the-crew/shared-types'
import { PolicyService } from './application/policy.service'

@Controller('projects/:projectId/policies')
export class PoliciesController {
  constructor(private readonly policyService: PolicyService) {}

  @Get()
  list(@Param('projectId') projectId: string) {
    return this.policyService.list(projectId)
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.policyService.get(id)
  }

  @Post()
  @HttpCode(201)
  create(@Param('projectId') projectId: string, @Body() dto: CreatePolicyDto) {
    return this.policyService.create(projectId, dto)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePolicyDto) {
    return this.policyService.update(id, dto)
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    await this.policyService.remove(id)
  }
}
