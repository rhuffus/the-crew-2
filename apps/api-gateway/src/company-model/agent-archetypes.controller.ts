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
import { CompanyDesignClient } from './company-design.client'

@Controller('projects/:projectId/agent-archetypes')
export class AgentArchetypesController {
  constructor(private readonly companyDesign: CompanyDesignClient) {}

  @Get()
  list(@Param('projectId') projectId: string) {
    return this.companyDesign.listAgentArchetypes(projectId)
  }

  @Get(':id')
  get(@Param('id') id: string, @Param('projectId') projectId: string) {
    return this.companyDesign.getAgentArchetype(id, projectId)
  }

  @Post()
  @HttpCode(201)
  create(@Param('projectId') projectId: string, @Body() dto: CreateAgentArchetypeDto) {
    return this.companyDesign.createAgentArchetype(projectId, dto)
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Param('projectId') projectId: string,
    @Body() dto: UpdateAgentArchetypeDto,
  ) {
    return this.companyDesign.updateAgentArchetype(id, projectId, dto)
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string, @Param('projectId') projectId: string) {
    return this.companyDesign.deleteAgentArchetype(id, projectId)
  }
}
