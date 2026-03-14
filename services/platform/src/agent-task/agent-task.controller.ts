import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common'
import type { SubmitAgentTaskDto, AgentTaskStatusDto } from '@the-crew/shared-types'
import { AgentTaskService } from './agent-task.service'

@Controller('projects/:projectId/agent-tasks')
export class AgentTaskController {
  constructor(private readonly service: AgentTaskService) {}

  @Post()
  @HttpCode(202)
  async submit(
    @Param('projectId') projectId: string,
    @Body() dto: SubmitAgentTaskDto,
  ): Promise<AgentTaskStatusDto> {
    return this.service.submit(projectId, dto)
  }

  @Get(':workflowId')
  async getStatus(
    @Param('workflowId') workflowId: string,
  ): Promise<AgentTaskStatusDto> {
    return this.service.getStatus(workflowId)
  }
}
