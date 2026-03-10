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
import type { CreateAgentAssignmentDto, UpdateAgentAssignmentDto } from '@the-crew/shared-types'
import { AgentAssignmentService } from './application/agent-assignment.service'

@Controller('projects/:projectId/agent-assignments')
export class AgentAssignmentsController {
  constructor(private readonly agentAssignmentService: AgentAssignmentService) {}

  @Get()
  list(@Param('projectId') projectId: string) {
    return this.agentAssignmentService.list(projectId)
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.agentAssignmentService.get(id)
  }

  @Post()
  @HttpCode(201)
  create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateAgentAssignmentDto,
  ) {
    return this.agentAssignmentService.create(projectId, dto)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAgentAssignmentDto) {
    return this.agentAssignmentService.update(id, dto)
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    await this.agentAssignmentService.remove(id)
  }
}
