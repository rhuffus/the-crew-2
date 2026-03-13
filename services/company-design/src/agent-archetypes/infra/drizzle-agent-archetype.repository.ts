import { Inject, Injectable } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { DRIZZLE_DB } from '@the-crew/drizzle-db'
import type { AgentArchetypeRepository } from '../domain/agent-archetype-repository'
import { AgentArchetype } from '../domain/agent-archetype'
import type { AgentArchetypeConstraints } from '../domain/agent-archetype'
import { agentArchetypes } from '../../drizzle/schema/agent-archetypes'

@Injectable()
export class DrizzleAgentArchetypeRepository implements AgentArchetypeRepository {
  constructor(@Inject(DRIZZLE_DB) private readonly db: PostgresJsDatabase) {}

  async findById(id: string): Promise<AgentArchetype | null> {
    const rows = await this.db
      .select()
      .from(agentArchetypes)
      .where(eq(agentArchetypes.id, id))
      .limit(1)
    return rows[0] ? this.toDomain(rows[0]) : null
  }

  async findByProjectId(projectId: string): Promise<AgentArchetype[]> {
    const rows = await this.db
      .select()
      .from(agentArchetypes)
      .where(eq(agentArchetypes.projectId, projectId))
    return rows.map((row) => this.toDomain(row))
  }

  async save(archetype: AgentArchetype): Promise<void> {
    const row = this.toRow(archetype)
    await this.db
      .insert(agentArchetypes)
      .values(row)
      .onConflictDoUpdate({ target: agentArchetypes.id, set: row })
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(agentArchetypes).where(eq(agentArchetypes.id, id))
  }

  private toDomain(row: typeof agentArchetypes.$inferSelect): AgentArchetype {
    return AgentArchetype.reconstitute(row.id, {
      projectId: row.projectId,
      name: row.name,
      description: row.description,
      roleId: row.roleId,
      departmentId: row.departmentId,
      skillIds: [...(row.skillIds as string[])],
      constraints: row.constraints as AgentArchetypeConstraints,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }

  private toRow(archetype: AgentArchetype): typeof agentArchetypes.$inferInsert {
    return {
      id: archetype.id,
      projectId: archetype.projectId,
      name: archetype.name,
      description: archetype.description,
      roleId: archetype.roleId,
      departmentId: archetype.departmentId,
      skillIds: archetype.skillIds as string[],
      constraints: archetype.constraints,
      createdAt: archetype.createdAt,
      updatedAt: archetype.updatedAt,
    }
  }
}
