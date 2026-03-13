import { Controller, Get, Post, Patch, Delete, Param, Body, HttpCode } from '@nestjs/common'
import type { CreateLcpAgentDto, UpdateLcpAgentDto } from '@the-crew/shared-types'
import { CompanyDesignClient } from './company-design.client'

@Controller('projects/:projectId/lcp-agents')
export class LcpAgentsProxyController {
  constructor(private readonly companyDesign: CompanyDesignClient) {}

  @Get()
  list(@Param('projectId') projectId: string) {
    return this.companyDesign.listLcpAgents(projectId)
  }

  @Get(':id')
  get(@Param('projectId') projectId: string, @Param('id') id: string) {
    return this.companyDesign.getLcpAgent(projectId, id)
  }

  @Post()
  @HttpCode(201)
  create(@Param('projectId') projectId: string, @Body() dto: CreateLcpAgentDto) {
    return this.companyDesign.createLcpAgent(projectId, dto)
  }

  @Patch(':id')
  update(@Param('projectId') projectId: string, @Param('id') id: string, @Body() dto: UpdateLcpAgentDto) {
    return this.companyDesign.updateLcpAgent(projectId, id, dto)
  }

  @Delete(':id')
  @HttpCode(204)
  delete(@Param('projectId') projectId: string, @Param('id') id: string) {
    return this.companyDesign.deleteLcpAgent(projectId, id)
  }
}
