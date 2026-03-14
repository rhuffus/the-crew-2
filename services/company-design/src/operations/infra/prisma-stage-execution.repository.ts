import { Injectable } from '@nestjs/common'
import { CompanyDesignPrismaService } from '../../prisma/company-design-prisma.service'
import type { StageExecutionRepository } from '../domain/operations-repository'
import { StageExecution } from '../domain/stage-execution'
import type { StageExecutionStatus } from '@the-crew/shared-types'

@Injectable()
export class PrismaStageExecutionRepository implements StageExecutionRepository {
  constructor(private readonly prisma: CompanyDesignPrismaService) {}

  async findById(id: string): Promise<StageExecution | null> {
    const row = await this.prisma.stageExecution.findUnique({ where: { id } })
    return row ? this.toDomain(row) : null
  }

  async listByRun(runId: string): Promise<StageExecution[]> {
    const rows = await this.prisma.stageExecution.findMany({ where: { runId } })
    return rows.map((row) => this.toDomain(row))
  }

  async listByProject(projectId: string): Promise<StageExecution[]> {
    const runs = await this.prisma.workflowRun.findMany({
      where: { projectId },
      select: { id: true },
    })
    if (runs.length === 0) return []
    const rows = await this.prisma.stageExecution.findMany({
      where: { runId: { in: runs.map((r) => r.id) } },
    })
    return rows.map((row) => this.toDomain(row))
  }

  async save(execution: StageExecution): Promise<void> {
    const data = {
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
    await this.prisma.stageExecution.upsert({
      where: { id: execution.id },
      create: { id: execution.id, ...data },
      update: data,
    })
  }

  async saveAll(executions: StageExecution[]): Promise<void> {
    if (executions.length === 0) return
    await this.prisma.$transaction(async (tx) => {
      for (const exec of executions) {
        const data = {
          runId: exec.runId,
          workflowId: exec.workflowId,
          stageName: exec.stageName,
          stageIndex: exec.stageIndex,
          status: exec.status,
          assigneeId: exec.assigneeId,
          blockReason: exec.blockReason,
          startedAt: exec.startedAt,
          completedAt: exec.completedAt,
        }
        await tx.stageExecution.upsert({
          where: { id: exec.id },
          create: { id: exec.id, ...data },
          update: data,
        })
      }
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.stageExecution.delete({ where: { id } })
  }

  private toDomain(row: {
    id: string
    runId: string
    workflowId: string
    stageName: string
    stageIndex: number
    status: string
    assigneeId: string | null
    blockReason: string | null
    startedAt: Date | null
    completedAt: Date | null
  }): StageExecution {
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
}
