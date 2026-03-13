import { Inject, Injectable } from '@nestjs/common'
import { eq, inArray } from 'drizzle-orm'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { DRIZZLE_DB } from '@the-crew/drizzle-db'
import type { StageExecutionRepository } from '../domain/operations-repository'
import { StageExecution } from '../domain/stage-execution'
import type { StageExecutionStatus } from '@the-crew/shared-types'
import { stageExecutions } from '../../drizzle/schema/stage-executions'
import { workflowRuns } from '../../drizzle/schema/workflow-runs'

@Injectable()
export class DrizzleStageExecutionRepository implements StageExecutionRepository {
  constructor(@Inject(DRIZZLE_DB) private readonly db: PostgresJsDatabase) {}

  async findById(id: string): Promise<StageExecution | null> {
    const rows = await this.db
      .select()
      .from(stageExecutions)
      .where(eq(stageExecutions.id, id))
      .limit(1)
    return rows[0] ? this.toDomain(rows[0]) : null
  }

  async listByRun(runId: string): Promise<StageExecution[]> {
    const rows = await this.db
      .select()
      .from(stageExecutions)
      .where(eq(stageExecutions.runId, runId))
    return rows.map((row) => this.toDomain(row))
  }

  async listByProject(projectId: string): Promise<StageExecution[]> {
    const runIds = await this.db
      .select({ id: workflowRuns.id })
      .from(workflowRuns)
      .where(eq(workflowRuns.projectId, projectId))
    if (runIds.length === 0) return []
    const rows = await this.db
      .select()
      .from(stageExecutions)
      .where(
        inArray(
          stageExecutions.runId,
          runIds.map((r) => r.id),
        ),
      )
    return rows.map((row) => this.toDomain(row))
  }

  async save(execution: StageExecution): Promise<void> {
    const row = this.toRow(execution)
    await this.db
      .insert(stageExecutions)
      .values(row)
      .onConflictDoUpdate({ target: stageExecutions.id, set: row })
  }

  async saveAll(executions: StageExecution[]): Promise<void> {
    if (executions.length === 0) return
    await this.db.transaction(async (tx) => {
      for (const exec of executions) {
        const row = this.toRow(exec)
        await tx
          .insert(stageExecutions)
          .values(row)
          .onConflictDoUpdate({ target: stageExecutions.id, set: row })
      }
    })
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(stageExecutions).where(eq(stageExecutions.id, id))
  }

  private toDomain(row: typeof stageExecutions.$inferSelect): StageExecution {
    return StageExecution.reconstitute({
      id: row.id,
      runId: row.runId,
      workflowId: row.workflowId,
      stageName: row.stageName,
      stageIndex: row.stageIndex,
      status: row.status as StageExecutionStatus,
      assigneeId: row.assigneeId,
      blockReason: row.blockReason,
      startedAt: row.startedAt,
      completedAt: row.completedAt,
    })
  }

  private toRow(execution: StageExecution): typeof stageExecutions.$inferInsert {
    return {
      id: execution.id,
      runId: execution.runId,
      workflowId: execution.workflowId,
      stageName: execution.stageName,
      stageIndex: execution.stageIndex,
      status: execution.status,
      assigneeId: execution.assigneeId,
      blockReason: execution.blockReason,
      startedAt: execution.startedAt,
      completedAt: execution.completedAt,
    }
  }
}
