import { Inject, Injectable } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { DRIZZLE_DB } from '@the-crew/drizzle-db'
import type { WorkflowRepository } from '../domain/workflow-repository'
import {
  Workflow,
  WorkflowStage,
  WorkflowParticipant,
} from '../domain/workflow'
import type {
  WorkflowStatus,
  WorkflowStageProps,
  WorkflowParticipantProps,
} from '../domain/workflow'
import { workflows } from '../../drizzle/schema/workflows'

@Injectable()
export class DrizzleWorkflowRepository implements WorkflowRepository {
  constructor(@Inject(DRIZZLE_DB) private readonly db: PostgresJsDatabase) {}

  async findById(id: string): Promise<Workflow | null> {
    const rows = await this.db
      .select()
      .from(workflows)
      .where(eq(workflows.id, id))
      .limit(1)
    return rows[0] ? this.toDomain(rows[0]) : null
  }

  async findByProjectId(projectId: string): Promise<Workflow[]> {
    const rows = await this.db
      .select()
      .from(workflows)
      .where(eq(workflows.projectId, projectId))
    return rows.map((row) => this.toDomain(row))
  }

  async save(workflow: Workflow): Promise<void> {
    const row = this.toRow(workflow)
    await this.db
      .insert(workflows)
      .values(row)
      .onConflictDoUpdate({ target: workflows.id, set: row })
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(workflows).where(eq(workflows.id, id))
  }

  private toDomain(row: typeof workflows.$inferSelect): Workflow {
    const stageProps = row.stages as WorkflowStageProps[]
    const participantProps = row.participants as WorkflowParticipantProps[]

    return Workflow.reconstitute(row.id, {
      projectId: row.projectId,
      name: row.name,
      description: row.description,
      ownerDepartmentId: row.ownerDepartmentId ?? null,
      status: row.status as WorkflowStatus,
      triggerDescription: row.triggerDescription,
      stages: stageProps.map((s) => WorkflowStage.create(s)),
      participants: participantProps.map((p) => WorkflowParticipant.create(p)),
      contractIds: [...(row.contractIds as string[])],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }

  private toRow(workflow: Workflow): typeof workflows.$inferInsert {
    return {
      id: workflow.id,
      projectId: workflow.projectId,
      name: workflow.name,
      description: workflow.description,
      ownerDepartmentId: workflow.ownerDepartmentId,
      status: workflow.status,
      triggerDescription: workflow.triggerDescription,
      stages: workflow.stages.map((s) => ({
        name: s.name,
        order: s.order,
        description: s.description,
      })),
      participants: workflow.participants.map((p) => ({
        participantId: p.participantId,
        participantType: p.participantType,
        responsibility: p.responsibility,
      })),
      contractIds: workflow.contractIds as string[],
      createdAt: workflow.createdAt,
      updatedAt: workflow.updatedAt,
    }
  }
}
