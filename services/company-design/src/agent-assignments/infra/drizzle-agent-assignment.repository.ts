import { Inject, Injectable } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { DRIZZLE_DB } from '@the-crew/drizzle-db'
import type { AgentAssignmentRepository } from '../domain/agent-assignment-repository'
import { AgentAssignment } from '../domain/agent-assignment'
import type { AgentAssignmentStatus } from '../domain/agent-assignment'
import { agentAssignments } from '../../drizzle/schema/agent-assignments'

@Injectable()
export class DrizzleAgentAssignmentRepository implements AgentAssignmentRepository {
  constructor(@Inject(DRIZZLE_DB) private readonly db: PostgresJsDatabase) {}

  async findById(id: string): Promise<AgentAssignment | null> {
    const rows = await this.db
      .select()
      .from(agentAssignments)
      .where(eq(agentAssignments.id, id))
      .limit(1)
    return rows[0] ? this.toDomain(rows[0]) : null
  }

  async findByProjectId(projectId: string): Promise<AgentAssignment[]> {
    const rows = await this.db
      .select()
      .from(agentAssignments)
      .where(eq(agentAssignments.projectId, projectId))
    return rows.map((row) => this.toDomain(row))
  }

  async save(assignment: AgentAssignment): Promise<void> {
    const row = this.toRow(assignment)
    await this.db
      .insert(agentAssignments)
      .values(row)
      .onConflictDoUpdate({ target: agentAssignments.id, set: row })
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(agentAssignments).where(eq(agentAssignments.id, id))
  }

  private toDomain(row: typeof agentAssignments.$inferSelect): AgentAssignment {
    return AgentAssignment.reconstitute(row.id, {
      projectId: row.projectId,
      archetypeId: row.archetypeId,
      name: row.name,
      status: row.status as AgentAssignmentStatus,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }

  private toRow(assignment: AgentAssignment): typeof agentAssignments.$inferInsert {
    return {
      id: assignment.id,
      projectId: assignment.projectId,
      archetypeId: assignment.archetypeId,
      name: assignment.name,
      status: assignment.status,
      createdAt: assignment.createdAt,
      updatedAt: assignment.updatedAt,
    }
  }
}
