import { Controller, Get, Post, Patch, Delete, Param, Body, HttpCode, Inject, NotFoundException } from '@nestjs/common'
import type { CreateLcpAgentDto, UpdateLcpAgentDto } from '@the-crew/shared-types'
import { LCP_AGENT_REPOSITORY, type LcpAgentRepository } from '../domain/lcp-agent-repository'
import { LcpAgent } from '../domain/lcp-agent'
import { LcpAgentMapper } from './lcp-agent.mapper'
import { randomUUID } from 'crypto'

@Controller('projects/:projectId/lcp-agents')
export class LcpAgentsController {
  constructor(
    @Inject(LCP_AGENT_REPOSITORY)
    private readonly repo: LcpAgentRepository,
  ) {}

  @Get()
  async list(@Param('projectId') projectId: string) {
    const agents = await this.repo.findByProjectId(projectId)
    return agents.map(LcpAgentMapper.toDto)
  }

  @Get(':id')
  async get(@Param('projectId') projectId: string, @Param('id') id: string) {
    const agent = await this.repo.findById(id)
    if (!agent || agent.projectId !== projectId) throw new NotFoundException(`Agent ${id} not found`)
    return LcpAgentMapper.toDto(agent)
  }

  @Post()
  @HttpCode(201)
  async create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateLcpAgentDto,
  ) {
    const agent = LcpAgent.create({
      id: randomUUID(),
      projectId,
      name: dto.name,
      description: dto.description,
      agentType: dto.agentType,
      uoId: dto.uoId,
      role: dto.role,
      skills: dto.skills ?? [],
      inputs: dto.inputs ?? [],
      outputs: dto.outputs ?? [],
      responsibilities: dto.responsibilities ?? [],
      budget: dto.budget ? {
        maxMonthlyTokens: dto.budget.maxMonthlyTokens ?? null,
        maxConcurrentTasks: dto.budget.maxConcurrentTasks ?? null,
        costLimit: dto.budget.costLimit ?? null,
      } : null,
      contextWindow: dto.contextWindow ?? null,
      systemPromptRef: dto.systemPromptRef ?? null,
    })
    await this.repo.save(agent)
    return LcpAgentMapper.toDto(agent)
  }

  @Patch(':id')
  async update(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body() dto: UpdateLcpAgentDto,
  ) {
    const agent = await this.repo.findById(id)
    if (!agent || agent.projectId !== projectId) throw new NotFoundException(`Agent ${id} not found`)
    agent.update({
      ...dto,
      budget: dto.budget ? {
        maxMonthlyTokens: dto.budget.maxMonthlyTokens ?? null,
        maxConcurrentTasks: dto.budget.maxConcurrentTasks ?? null,
        costLimit: dto.budget.costLimit ?? null,
      } : dto.budget === null ? null : undefined,
    })
    await this.repo.save(agent)
    return LcpAgentMapper.toDto(agent)
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('projectId') projectId: string, @Param('id') id: string) {
    const agent = await this.repo.findById(id)
    if (!agent || agent.projectId !== projectId) throw new NotFoundException(`Agent ${id} not found`)
    await this.repo.delete(id)
  }
}
