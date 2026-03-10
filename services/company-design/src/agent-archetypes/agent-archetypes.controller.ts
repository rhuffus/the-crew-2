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
import type { CreateAgentArchetypeDto, UpdateAgentArchetypeDto } from '@the-crew/shared-types'
import { AgentArchetypeService } from './application/agent-archetype.service'

@Controller('projects/:projectId/agent-archetypes')
export class AgentArchetypesController {
  constructor(private readonly agentArchetypeService: AgentArchetypeService) {}

  @Get()
  list(@Param('projectId') projectId: string) {
    return this.agentArchetypeService.list(projectId)
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.agentArchetypeService.get(id)
  }

  @Post()
  @HttpCode(201)
  create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateAgentArchetypeDto,
  ) {
    return this.agentArchetypeService.create(projectId, dto)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAgentArchetypeDto) {
    return this.agentArchetypeService.update(id, dto)
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    await this.agentArchetypeService.remove(id)
  }
}
