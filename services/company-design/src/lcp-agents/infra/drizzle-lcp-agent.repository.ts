import { Inject, Injectable } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { DRIZZLE_DB } from '@the-crew/drizzle-db'
import type { LcpAgentRepository } from '../domain/lcp-agent-repository'
import {
  LcpAgent,
  type LcpAgentType,
  type LcpAgentStatus,
  type AgentSkillProps,
  type AgentBudgetProps,
} from '../domain/lcp-agent'
import { lcpAgents } from '../../drizzle/schema/lcp-agents'

@Injectable()
export class DrizzleLcpAgentRepository implements LcpAgentRepository {
  constructor(@Inject(DRIZZLE_DB) private readonly db: PostgresJsDatabase) {}

  async findById(id: string): Promise<LcpAgent | null> {
    const rows = await this.db
      .select()
      .from(lcpAgents)
      .where(eq(lcpAgents.id, id))
      .limit(1)
    return rows[0] ? this.toDomain(rows[0]) : null
  }

  async findByProjectId(projectId: string): Promise<LcpAgent[]> {
    const rows = await this.db
      .select()
      .from(lcpAgents)
      .where(eq(lcpAgents.projectId, projectId))
    return rows.map((row) => this.toDomain(row))
  }

  async save(agent: LcpAgent): Promise<void> {
    const row = this.toRow(agent)
    await this.db
      .insert(lcpAgents)
      .values(row)
      .onConflictDoUpdate({ target: lcpAgents.id, set: row })
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(lcpAgents).where(eq(lcpAgents.id, id))
  }

  private toDomain(row: typeof lcpAgents.$inferSelect): LcpAgent {
    return LcpAgent.reconstitute(row.id, {
      projectId: row.projectId,
      name: row.name,
      description: row.description,
      agentType: row.agentType as LcpAgentType,
      uoId: row.uoId,
      role: row.role,
      skills: row.skills as AgentSkillProps[],
      inputs: row.inputs as string[],
      outputs: row.outputs as string[],
      responsibilities: row.responsibilities as string[],
      budget: row.budget as AgentBudgetProps | null,
      contextWindow: row.contextWindow,
      status: row.status as LcpAgentStatus,
      systemPromptRef: row.systemPromptRef,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }

  private toRow(agent: LcpAgent): typeof lcpAgents.$inferInsert {
    return {
      id: agent.id,
      projectId: agent.projectId,
      name: agent.name,
      description: agent.description,
      agentType: agent.agentType,
      uoId: agent.uoId,
      role: agent.role,
      skills: agent.skills,
      inputs: agent.inputs,
      outputs: agent.outputs,
      responsibilities: agent.responsibilities,
      budget: agent.budget,
      contextWindow: agent.contextWindow,
      status: agent.status,
      systemPromptRef: agent.systemPromptRef,
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt,
    }
  }
}
