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
import type { CreateWorkflowDto, UpdateWorkflowDto } from '@the-crew/shared-types'
import { CompanyDesignClient } from './company-design.client'

@Controller('projects/:projectId/workflows')
export class WorkflowsController {
  constructor(private readonly companyDesign: CompanyDesignClient) {}

  @Get()
  list(@Param('projectId') projectId: string) {
    return this.companyDesign.listWorkflows(projectId)
  }

  @Get(':id')
  get(@Param('id') id: string, @Param('projectId') projectId: string) {
    return this.companyDesign.getWorkflow(id, projectId)
  }

  @Post()
  @HttpCode(201)
  create(@Param('projectId') projectId: string, @Body() dto: CreateWorkflowDto) {
    return this.companyDesign.createWorkflow(projectId, dto)
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Param('projectId') projectId: string,
    @Body() dto: UpdateWorkflowDto,
  ) {
    return this.companyDesign.updateWorkflow(id, projectId, dto)
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string, @Param('projectId') projectId: string) {
    return this.companyDesign.deleteWorkflow(id, projectId)
  }
}
