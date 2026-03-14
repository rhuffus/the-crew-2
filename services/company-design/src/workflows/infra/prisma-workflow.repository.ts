import { Injectable } from '@nestjs/common'
import { CompanyDesignPrismaService } from '../../prisma/company-design-prisma.service'
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

@Injectable()
export class PrismaWorkflowRepository implements WorkflowRepository {
  constructor(private readonly prisma: CompanyDesignPrismaService) {}

  async findById(id: string): Promise<Workflow | null> {
    const row = await this.prisma.workflow.findUnique({ where: { id } })
    return row ? this.toDomain(row) : null
  }

  async findByProjectId(projectId: string): Promise<Workflow[]> {
    const rows = await this.prisma.workflow.findMany({ where: { projectId } })
    return rows.map((row) => this.toDomain(row))
  }

  async save(workflow: Workflow): Promise<void> {
    const stages = workflow.stages.map((s) => ({
      name: s.name,
      order: s.order,
      description: s.description,
    }))
    const participants = workflow.participants.map((p) => ({
      participantId: p.participantId,
      participantType: p.participantType,
      responsibility: p.responsibility,
    }))

    await this.prisma.workflow.upsert({
      where: { id: workflow.id },
      create: {
        id: workflow.id,
        projectId: workflow.projectId,
        name: workflow.name,
        description: workflow.description,
        ownerDepartmentId: workflow.ownerDepartmentId,
        status: workflow.status,
        triggerDescription: workflow.triggerDescription,
        stages,
        participants,
        contractIds: workflow.contractIds as string[],
        createdAt: workflow.createdAt,
        updatedAt: workflow.updatedAt,
      },
      update: {
        projectId: workflow.projectId,
        name: workflow.name,
        description: workflow.description,
        ownerDepartmentId: workflow.ownerDepartmentId,
        status: workflow.status,
        triggerDescription: workflow.triggerDescription,
        stages,
        participants,
        contractIds: workflow.contractIds as string[],
        updatedAt: workflow.updatedAt,
      },
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.workflow.delete({ where: { id } })
  }

  private toDomain(row: {
    id: string
    projectId: string
    name: string
    description: string
    ownerDepartmentId: string | null
    status: string
    triggerDescription: string
    stages: unknown
    participants: unknown
    contractIds: string[]
    createdAt: Date
    updatedAt: Date
  }): Workflow {
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
      contractIds: [...row.contractIds],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }
}
