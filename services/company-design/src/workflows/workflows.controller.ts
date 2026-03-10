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
import { WorkflowService } from './application/workflow.service'

@Controller('projects/:projectId/workflows')
export class WorkflowsController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Get()
  list(@Param('projectId') projectId: string) {
    return this.workflowService.list(projectId)
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.workflowService.get(id)
  }

  @Post()
  @HttpCode(201)
  create(@Param('projectId') projectId: string, @Body() dto: CreateWorkflowDto) {
    return this.workflowService.create(projectId, dto)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateWorkflowDto) {
    return this.workflowService.update(id, dto)
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    await this.workflowService.remove(id)
  }
}
