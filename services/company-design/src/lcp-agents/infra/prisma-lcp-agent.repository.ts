import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { CompanyDesignPrismaService } from '../../prisma/company-design-prisma.service'
import type { LcpAgentRepository } from '../domain/lcp-agent-repository'
import {
  LcpAgent,
  type LcpAgentType,
  type LcpAgentStatus,
  type AgentSkillProps,
  type AgentBudgetProps,
} from '../domain/lcp-agent'

@Injectable()
export class PrismaLcpAgentRepository implements LcpAgentRepository {
  constructor(private readonly prisma: CompanyDesignPrismaService) {}

  async findById(id: string): Promise<LcpAgent | null> {
    const row = await this.prisma.lcpAgent.findUnique({ where: { id } })
    return row ? this.toDomain(row) : null
  }

  async findByProjectId(projectId: string): Promise<LcpAgent[]> {
    const rows = await this.prisma.lcpAgent.findMany({ where: { projectId } })
    return rows.map((row) => this.toDomain(row))
  }

  async save(agent: LcpAgent): Promise<void> {
    const data = {
      projectId: agent.projectId,
      name: agent.name,
      description: agent.description,
      agentType: agent.agentType,
      uoId: agent.uoId,
      role: agent.role,
      skills: agent.skills as object[],
      inputs: agent.inputs as string[],
      outputs: agent.outputs as string[],
      responsibilities: agent.responsibilities as string[],
      budget: agent.budget !== null ? (agent.budget as object) : Prisma.JsonNull,
      contextWindow: agent.contextWindow,
      status: agent.status,
      systemPromptRef: agent.systemPromptRef,
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt,
    }
    await this.prisma.lcpAgent.upsert({
      where: { id: agent.id },
      create: { id: agent.id, ...data },
      update: data,
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.lcpAgent.delete({ where: { id } })
  }

  private toDomain(row: {
    id: string
    projectId: string
    name: string
    description: string
    agentType: string
    uoId: string
    role: string
    skills: unknown
    inputs: string[]
    outputs: string[]
    responsibilities: string[]
    budget: unknown
    contextWindow: number | null
    status: string
    systemPromptRef: string | null
    createdAt: Date
    updatedAt: Date
  }): LcpAgent {
    return LcpAgent.reconstitute(row.id, {
      projectId: row.projectId,
      name: row.name,
      description: row.description,
      agentType: row.agentType as LcpAgentType,
      uoId: row.uoId,
      role: row.role,
      skills: row.skills as AgentSkillProps[],
      inputs: [...row.inputs],
      outputs: [...row.outputs],
      responsibilities: [...row.responsibilities],
      budget: row.budget as AgentBudgetProps | null,
      contextWindow: row.contextWindow,
      status: row.status as LcpAgentStatus,
      systemPromptRef: row.systemPromptRef,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }
}
