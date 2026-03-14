import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { CompanyDesignPrismaService } from '../../prisma/company-design-prisma.service'
import type { RuntimeExecutionRepository } from '../domain/runtime-repository'
import { RuntimeExecution } from '../domain/runtime-execution'
import type {
  RuntimeExecutionType,
  RuntimeExecutionStatus,
  RuntimeErrorDto,
  ApprovalRecordDto,
} from '@the-crew/shared-types'

@Injectable()
export class PrismaRuntimeExecutionRepository implements RuntimeExecutionRepository {
  constructor(private readonly prisma: CompanyDesignPrismaService) {}

  async findById(id: string): Promise<RuntimeExecution | null> {
    const row = await this.prisma.runtimeExecution.findUnique({ where: { id } })
    return row ? this.toDomain(row) : null
  }

  async listByProject(projectId: string): Promise<RuntimeExecution[]> {
    const rows = await this.prisma.runtimeExecution.findMany({ where: { projectId } })
    return rows.map((row) => this.toDomain(row))
  }

  async listActiveByProject(projectId: string): Promise<RuntimeExecution[]> {
    const rows = await this.prisma.runtimeExecution.findMany({
      where: {
        projectId,
        status: { in: ['pending', 'running', 'waiting', 'blocked'] },
      },
    })
    return rows.map((row) => this.toDomain(row))
  }

  async listByEntity(entityId: string): Promise<RuntimeExecution[]> {
    const rows = await this.prisma.runtimeExecution.findMany({
      where: {
        OR: [{ agentId: entityId }, { workflowId: entityId }],
      },
    })
    return rows.map((row) => this.toDomain(row))
  }

  async save(execution: RuntimeExecution): Promise<void> {
    const data = {
      projectId: execution.projectId,
      executionType: execution.executionType,
      workflowId: execution.workflowId,
      agentId: execution.agentId,
      status: execution.status,
      startedAt: execution.startedAt,
      completedAt: execution.completedAt,
      input: execution.input as object,
      output: execution.output !== null ? (execution.output as object) : Prisma.JsonNull,
      errors: execution.errors as object[],
      waitingFor: execution.waitingFor,
      approvals: execution.approvals as object[],
      aiCost: execution.aiCost,
      logSummary: execution.logSummary,
      parentExecutionId: execution.parentExecutionId,
      operationsRunId: execution.operationsRunId,
      createdAt: execution.createdAt,
      updatedAt: execution.updatedAt,
    }
    await this.prisma.runtimeExecution.upsert({
      where: { id: execution.id },
      create: { id: execution.id, ...data },
      update: data,
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.runtimeExecution.delete({ where: { id } })
  }

  private toDomain(row: {
    id: string
    projectId: string
    executionType: string
    workflowId: string | null
    agentId: string | null
    status: string
    startedAt: Date | null
    completedAt: Date | null
    input: unknown
    output: unknown
    errors: unknown
    waitingFor: string | null
    approvals: unknown
    aiCost: number
    logSummary: string
    parentExecutionId: string | null
    operationsRunId: string | null
    createdAt: Date
    updatedAt: Date
  }): RuntimeExecution {
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
}
