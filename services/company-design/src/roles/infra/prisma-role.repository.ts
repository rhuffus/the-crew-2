import { Injectable } from '@nestjs/common'
import { CompanyDesignPrismaService } from '../../prisma/company-design-prisma.service'
import type { RoleRepository } from '../domain/role-repository'
import { Role } from '../domain/role'

@Injectable()
export class PrismaRoleRepository implements RoleRepository {
  constructor(private readonly prisma: CompanyDesignPrismaService) {}

  async findById(id: string): Promise<Role | null> {
    const row = await this.prisma.role.findUnique({ where: { id } })
    return row ? this.toDomain(row) : null
  }

  async findByProjectId(projectId: string): Promise<Role[]> {
    const rows = await this.prisma.role.findMany({ where: { projectId } })
    return rows.map((row) => this.toDomain(row))
  }

  async save(role: Role): Promise<void> {
    await this.prisma.role.upsert({
      where: { id: role.id },
      create: {
        id: role.id,
        projectId: role.projectId,
        name: role.name,
        description: role.description,
        departmentId: role.departmentId,
        capabilityIds: role.capabilityIds as string[],
        accountability: role.accountability,
        authority: role.authority,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
      },
      update: {
        projectId: role.projectId,
        name: role.name,
        description: role.description,
        departmentId: role.departmentId,
        capabilityIds: role.capabilityIds as string[],
        accountability: role.accountability,
        authority: role.authority,
        updatedAt: role.updatedAt,
      },
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.role.delete({ where: { id } })
  }

  private toDomain(row: {
    id: string
    projectId: string
    name: string
    description: string
    departmentId: string
    capabilityIds: string[]
    accountability: string
    authority: string
    createdAt: Date
    updatedAt: Date
  }): Role {
    return Role.reconstitute(row.id, {
      projectId: row.projectId,
      name: row.name,
      description: row.description,
      departmentId: row.departmentId,
      capabilityIds: [...row.capabilityIds],
      accountability: row.accountability,
      authority: row.authority,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }
}
