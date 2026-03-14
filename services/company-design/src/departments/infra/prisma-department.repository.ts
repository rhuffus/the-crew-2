import { Injectable } from '@nestjs/common'
import { CompanyDesignPrismaService } from '../../prisma/company-design-prisma.service'
import type { DepartmentRepository } from '../domain/department-repository'
import { Department } from '../domain/department'

@Injectable()
export class PrismaDepartmentRepository implements DepartmentRepository {
  constructor(private readonly prisma: CompanyDesignPrismaService) {}

  async findById(id: string): Promise<Department | null> {
    const row = await this.prisma.department.findUnique({ where: { id } })
    return row ? this.toDomain(row) : null
  }

  async findByProjectId(projectId: string): Promise<Department[]> {
    const rows = await this.prisma.department.findMany({ where: { projectId } })
    return rows.map((row) => this.toDomain(row))
  }

  async save(dept: Department): Promise<void> {
    await this.prisma.department.upsert({
      where: { id: dept.id },
      create: {
        id: dept.id,
        projectId: dept.projectId,
        name: dept.name,
        description: dept.description,
        mandate: dept.mandate,
        parentId: dept.parentId,
        createdAt: dept.createdAt,
        updatedAt: dept.updatedAt,
      },
      update: {
        projectId: dept.projectId,
        name: dept.name,
        description: dept.description,
        mandate: dept.mandate,
        parentId: dept.parentId,
        updatedAt: dept.updatedAt,
      },
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.department.delete({ where: { id } })
  }

  private toDomain(row: {
    id: string
    projectId: string
    name: string
    description: string
    mandate: string
    parentId: string | null
    createdAt: Date
    updatedAt: Date
  }): Department {
    return Department.reconstitute(row.id, {
      projectId: row.projectId,
      name: row.name,
      description: row.description,
      mandate: row.mandate,
      parentId: row.parentId ?? null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }
}
