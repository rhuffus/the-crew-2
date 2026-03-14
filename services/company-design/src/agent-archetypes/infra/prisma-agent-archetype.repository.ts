import { Injectable } from '@nestjs/common'
import { CompanyDesignPrismaService } from '../../prisma/company-design-prisma.service'
import type { AgentArchetypeRepository } from '../domain/agent-archetype-repository'
import { AgentArchetype } from '../domain/agent-archetype'
import type { AgentArchetypeConstraints } from '../domain/agent-archetype'

@Injectable()
export class PrismaAgentArchetypeRepository implements AgentArchetypeRepository {
  constructor(private readonly prisma: CompanyDesignPrismaService) {}

  async findById(id: string): Promise<AgentArchetype | null> {
    const row = await this.prisma.agentArchetype.findUnique({ where: { id } })
    return row ? this.toDomain(row) : null
  }

  async findByProjectId(projectId: string): Promise<AgentArchetype[]> {
    const rows = await this.prisma.agentArchetype.findMany({ where: { projectId } })
    return rows.map((row) => this.toDomain(row))
  }

  async save(archetype: AgentArchetype): Promise<void> {
    const data = {
      projectId: archetype.projectId,
      name: archetype.name,
      description: archetype.description,
      roleId: archetype.roleId,
      departmentId: archetype.departmentId,
      skillIds: archetype.skillIds as string[],
      constraints: archetype.constraints as object,
      createdAt: archetype.createdAt,
      updatedAt: archetype.updatedAt,
    }
    await this.prisma.agentArchetype.upsert({
      where: { id: archetype.id },
      create: { id: archetype.id, ...data },
      update: data,
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.agentArchetype.delete({ where: { id } })
  }

  private toDomain(row: {
    id: string
    projectId: string
    name: string
    description: string
    roleId: string
    departmentId: string
    skillIds: string[]
    constraints: unknown
    createdAt: Date
    updatedAt: Date
  }): AgentArchetype {
    return AgentArchetype.reconstitute(row.id, {
      projectId: row.projectId,
      name: row.name,
      description: row.description,
      roleId: row.roleId,
      departmentId: row.departmentId,
      skillIds: [...row.skillIds],
      constraints: row.constraints as AgentArchetypeConstraints,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }
}
