import { Injectable } from '@nestjs/common'
import { CompanyDesignPrismaService } from '../../prisma/company-design-prisma.service'
import type { WorkflowRunRepository } from '../domain/operations-repository'
import { WorkflowRun } from '../domain/workflow-run'
import type { WorkflowRunStatus } from '@the-crew/shared-types'

@Injectable()
export class PrismaWorkflowRunRepository implements WorkflowRunRepository {
  constructor(private readonly prisma: CompanyDesignPrismaService) {}

  async findById(id: string): Promise<WorkflowRun | null> {
    const row = await this.prisma.workflowRun.findUnique({ where: { id } })
    return row ? this.toDomain(row) : null
  }

  async listByProject(projectId: string): Promise<WorkflowRun[]> {
    const rows = await this.prisma.workflowRun.findMany({ where: { projectId } })
    return rows.map((row) => this.toDomain(row))
  }

  async listByWorkflow(projectId: string, workflowId: string): Promise<WorkflowRun[]> {
    const rows = await this.prisma.workflowRun.findMany({
      where: { projectId, workflowId },
    })
    return rows.map((row) => this.toDomain(row))
  }

  async save(run: WorkflowRun): Promise<void> {
    const data = {
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
    await this.prisma.workflowRun.upsert({
      where: { id: run.id },
      create: { id: run.id, ...data },
      update: data,
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.workflowRun.delete({ where: { id } })
  }

  private toDomain(row: {
    id: string
    projectId: string
    workflowId: string
    status: string
    currentStageIndex: number | null
    startedAt: Date
    completedAt: Date | null
    failureReason: string | null
    createdAt: Date
    updatedAt: Date
  }): WorkflowRun {
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
}
