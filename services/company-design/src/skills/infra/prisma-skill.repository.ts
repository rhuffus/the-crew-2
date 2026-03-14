import { Injectable } from '@nestjs/common'
import { CompanyDesignPrismaService } from '../../prisma/company-design-prisma.service'
import type { SkillRepository } from '../domain/skill-repository'
import { Skill } from '../domain/skill'

@Injectable()
export class PrismaSkillRepository implements SkillRepository {
  constructor(private readonly prisma: CompanyDesignPrismaService) {}

  async findById(id: string): Promise<Skill | null> {
    const row = await this.prisma.skill.findUnique({ where: { id } })
    return row ? this.toDomain(row) : null
  }

  async findByProjectId(projectId: string): Promise<Skill[]> {
    const rows = await this.prisma.skill.findMany({ where: { projectId } })
    return rows.map((row) => this.toDomain(row))
  }

  async save(skill: Skill): Promise<void> {
    await this.prisma.skill.upsert({
      where: { id: skill.id },
      create: {
        id: skill.id,
        projectId: skill.projectId,
        name: skill.name,
        description: skill.description,
        category: skill.category,
        tags: skill.tags as string[],
        compatibleRoleIds: skill.compatibleRoleIds as string[],
        createdAt: skill.createdAt,
        updatedAt: skill.updatedAt,
      },
      update: {
        projectId: skill.projectId,
        name: skill.name,
        description: skill.description,
        category: skill.category,
        tags: skill.tags as string[],
        compatibleRoleIds: skill.compatibleRoleIds as string[],
        updatedAt: skill.updatedAt,
      },
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.skill.delete({ where: { id } })
  }

  private toDomain(row: {
    id: string
    projectId: string
    name: string
    description: string
    category: string
    tags: string[]
    compatibleRoleIds: string[]
    createdAt: Date
    updatedAt: Date
  }): Skill {
    return Skill.reconstitute(row.id, {
      projectId: row.projectId,
      name: row.name,
      description: row.description,
      category: row.category,
      tags: [...row.tags],
      compatibleRoleIds: [...row.compatibleRoleIds],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }
}
