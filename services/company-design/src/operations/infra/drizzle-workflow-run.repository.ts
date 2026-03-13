import { Inject, Injectable } from '@nestjs/common'
import { and, eq } from 'drizzle-orm'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { DRIZZLE_DB } from '@the-crew/drizzle-db'
import type { WorkflowRunRepository } from '../domain/operations-repository'
import { WorkflowRun } from '../domain/workflow-run'
import type { WorkflowRunStatus } from '@the-crew/shared-types'
import { workflowRuns } from '../../drizzle/schema/workflow-runs'

@Injectable()
export class DrizzleWorkflowRunRepository implements WorkflowRunRepository {
  constructor(@Inject(DRIZZLE_DB) private readonly db: PostgresJsDatabase) {}

  async findById(id: string): Promise<WorkflowRun | null> {
    const rows = await this.db
      .select()
      .from(workflowRuns)
      .where(eq(workflowRuns.id, id))
      .limit(1)
    return rows[0] ? this.toDomain(rows[0]) : null
  }

  async listByProject(projectId: string): Promise<WorkflowRun[]> {
    const rows = await this.db
      .select()
      .from(workflowRuns)
      .where(eq(workflowRuns.projectId, projectId))
    return rows.map((row) => this.toDomain(row))
  }

  async listByWorkflow(
    projectId: string,
    workflowId: string,
  ): Promise<WorkflowRun[]> {
    const rows = await this.db
      .select()
      .from(workflowRuns)
      .where(
        and(
          eq(workflowRuns.projectId, projectId),
          eq(workflowRuns.workflowId, workflowId),
        ),
      )
    return rows.map((row) => this.toDomain(row))
  }

  async save(run: WorkflowRun): Promise<void> {
    const row = this.toRow(run)
    await this.db
      .insert(workflowRuns)
      .values(row)
      .onConflictDoUpdate({ target: workflowRuns.id, set: row })
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(workflowRuns).where(eq(workflowRuns.id, id))
  }

  private toDomain(row: typeof workflowRuns.$inferSelect): WorkflowRun {
    return WorkflowRun.reconstitute({
      id: row.id,
      projectId: row.projectId,
      workflowId: row.workflowId,
      status: row.status as WorkflowRunStatus,
      currentStageIndex: row.currentStageIndex,
      startedAt: row.startedAt,
      completedAt: row.completedAt,
      failureReason: row.failureReason,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }

  private toRow(run: WorkflowRun): typeof workflowRuns.$inferInsert {
    return {
      id: run.id,
      projectId: run.projectId,
      workflowId: run.workflowId,
      status: run.status,
      currentStageIndex: run.currentStageIndex,
      startedAt: run.startedAt,
      completedAt: run.completedAt,
      failureReason: run.failureReason,
      createdAt: run.createdAt,
      updatedAt: run.updatedAt,
    }
  }
}
