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
import { CompanyDesignClient } from './company-design.client'

@Controller('projects/:projectId/policies')
export class PoliciesController {
  constructor(private readonly companyDesign: CompanyDesignClient) {}

  @Get()
  list(@Param('projectId') projectId: string) {
    return this.companyDesign.listPolicies(projectId)
  }

  @Get(':id')
  get(@Param('id') id: string, @Param('projectId') projectId: string) {
    return this.companyDesign.getPolicy(id, projectId)
  }

  @Post()
  @HttpCode(201)
  create(@Param('projectId') projectId: string, @Body() dto: CreatePolicyDto) {
    return this.companyDesign.createPolicy(projectId, dto)
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Param('projectId') projectId: string,
    @Body() dto: UpdatePolicyDto,
  ) {
    return this.companyDesign.updatePolicy(id, projectId, dto)
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string, @Param('projectId') projectId: string) {
    return this.companyDesign.deletePolicy(id, projectId)
  }
}
