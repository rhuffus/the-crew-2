import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common'
import type { SubmitAgentTaskDto, AgentTaskStatusDto } from '@the-crew/shared-types'
import { PlatformClient } from './platform.client'

@Controller('projects/:projectId/agent-tasks')
export class AgentTasksProxyController {
  constructor(private readonly platform: PlatformClient) {}

  @Post()
  @HttpCode(202)
  async submit(
    @Param('projectId') projectId: string,
    @Body() dto: SubmitAgentTaskDto,
  ): Promise<AgentTaskStatusDto> {
    return this.platform.submitAgentTask(projectId, dto)
  }

  @Get(':workflowId')
  async getStatus(
    @Param('projectId') projectId: string,
    @Param('workflowId') workflowId: string,
  ): Promise<AgentTaskStatusDto> {
    return this.platform.getAgentTaskStatus(projectId, workflowId)
  }
}
