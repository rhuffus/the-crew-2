import { Inject, Injectable } from '@nestjs/common'
import { and, eq, inArray, or } from 'drizzle-orm'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { DRIZZLE_DB } from '@the-crew/drizzle-db'
import type { RuntimeExecutionRepository } from '../domain/runtime-repository'
import { RuntimeExecution } from '../domain/runtime-execution'
import type {
  RuntimeExecutionType,
  RuntimeExecutionStatus,
  RuntimeErrorDto,
  ApprovalRecordDto,
} from '@the-crew/shared-types'
import { runtimeExecutions } from '../../drizzle/schema/runtime-executions'

@Injectable()
export class DrizzleRuntimeExecutionRepository implements RuntimeExecutionRepository {
  constructor(@Inject(DRIZZLE_DB) private readonly db: PostgresJsDatabase) {}

  async findById(id: string): Promise<RuntimeExecution | null> {
    const rows = await this.db
      .select()
      .from(runtimeExecutions)
      .where(eq(runtimeExecutions.id, id))
      .limit(1)
    return rows[0] ? this.toDomain(rows[0]) : null
  }

  async listByProject(projectId: string): Promise<RuntimeExecution[]> {
    const rows = await this.db
      .select()
      .from(runtimeExecutions)
      .where(eq(runtimeExecutions.projectId, projectId))
    return rows.map((row) => this.toDomain(row))
  }

  async listActiveByProject(projectId: string): Promise<RuntimeExecution[]> {
    const rows = await this.db
      .select()
      .from(runtimeExecutions)
      .where(
        and(
          eq(runtimeExecutions.projectId, projectId),
          inArray(runtimeExecutions.status, ['pending', 'running', 'waiting', 'blocked']),
        ),
      )
    return rows.map((row) => this.toDomain(row))
  }

  async listByEntity(entityId: string): Promise<RuntimeExecution[]> {
    const rows = await this.db
      .select()
      .from(runtimeExecutions)
      .where(
        or(
          eq(runtimeExecutions.agentId, entityId),
          eq(runtimeExecutions.workflowId, entityId),
        ),
      )
    return rows.map((row) => this.toDomain(row))
  }

  async save(execution: RuntimeExecution): Promise<void> {
    const row = this.toRow(execution)
    await this.db
      .insert(runtimeExecutions)
      .values(row)
      .onConflictDoUpdate({ target: runtimeExecutions.id, set: row })
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(runtimeExecutions).where(eq(runtimeExecutions.id, id))
  }

  private toDomain(row: typeof runtimeExecutions.$inferSelect): RuntimeExecution {
    return RuntimeExecution.reconstitute({
      id: row.id,
      projectId: row.projectId,
      executionType: row.executionType as RuntimeExecutionType,
      workflowId: row.workflowId,
      agentId: row.agentId,
      status: row.status as RuntimeExecutionStatus,
      startedAt: row.startedAt,
      completedAt: row.completedAt,
      input: row.input as Record<string, unknown>,
      output: row.output as Record<string, unknown> | null,
      errors: row.errors as RuntimeErrorDto[],
      waitingFor: row.waitingFor,
      approvals: row.approvals as ApprovalRecordDto[],
      aiCost: row.aiCost,
      logSummary: row.logSummary,
      parentExecutionId: row.parentExecutionId,
      operationsRunId: row.operationsRunId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }

  private toRow(execution: RuntimeExecution): typeof runtimeExecutions.$inferInsert {
    return {
      id: execution.id,
      projectId: execution.projectId,
      executionType: execution.executionType,
      workflowId: execution.workflowId,
      agentId: execution.agentId,
      status: execution.status,
      startedAt: execution.startedAt,
      completedAt: execution.completedAt,
      input: execution.input,
      output: execution.output,
      errors: execution.errors,
      waitingFor: execution.waitingFor,
      approvals: execution.approvals,
      aiCost: execution.aiCost,
      logSummary: execution.logSummary,
      parentExecutionId: execution.parentExecutionId,
      operationsRunId: execution.operationsRunId,
      createdAt: execution.createdAt,
      updatedAt: execution.updatedAt,
    }
  }
}
