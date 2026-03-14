import { Injectable } from '@nestjs/common'
import { CompanyDesignPrismaService } from '../../prisma/company-design-prisma.service'
import type { AgentAssignmentRepository } from '../domain/agent-assignment-repository'
import { AgentAssignment } from '../domain/agent-assignment'
import type { AgentAssignmentStatus } from '../domain/agent-assignment'

@Injectable()
export class PrismaAgentAssignmentRepository implements AgentAssignmentRepository {
  constructor(private readonly prisma: CompanyDesignPrismaService) {}

  async findById(id: string): Promise<AgentAssignment | null> {
    const row = await this.prisma.agentAssignment.findUnique({ where: { id } })
    return row ? this.toDomain(row) : null
  }

  async findByProjectId(projectId: string): Promise<AgentAssignment[]> {
    const rows = await this.prisma.agentAssignment.findMany({ where: { projectId } })
    return rows.map((row) => this.toDomain(row))
  }

  async save(assignment: AgentAssignment): Promise<void> {
    const data = {
      projectId: assignment.projectId,
      archetypeId: assignment.archetypeId,
      name: assignment.name,
      status: assignment.status,
      createdAt: assignment.createdAt,
      updatedAt: assignment.updatedAt,
    }
    await this.prisma.agentAssignment.upsert({
      where: { id: assignment.id },
      create: { id: assignment.id, ...data },
      update: data,
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.agentAssignment.delete({ where: { id } })
  }

  private toDomain(row: {
    id: string
    projectId: string
    archetypeId: string
    name: string
    status: string
    createdAt: Date
    updatedAt: Date
  }): AgentAssignment {
    return AgentAssignment.reconstitute(row.id, {
      projectId: row.projectId,
      archetypeId: row.archetypeId,
      name: row.name,
      status: row.status as AgentAssignmentStatus,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }
}
