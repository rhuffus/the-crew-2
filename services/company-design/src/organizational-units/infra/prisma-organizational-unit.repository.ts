import { Injectable } from '@nestjs/common'
import { CompanyDesignPrismaService } from '../../prisma/company-design-prisma.service'
import type { OrganizationalUnitRepository } from '../domain/organizational-unit-repository'
import {
  OrganizationalUnit,
  type UoType,
  type UoStatus,
} from '../domain/organizational-unit'

@Injectable()
export class PrismaOrganizationalUnitRepository implements OrganizationalUnitRepository {
  constructor(private readonly prisma: CompanyDesignPrismaService) {}

  async findById(id: string): Promise<OrganizationalUnit | null> {
    const row = await this.prisma.organizationalUnit.findUnique({ where: { id } })
    return row ? this.toDomain(row) : null
  }

  async findByProjectId(projectId: string): Promise<OrganizationalUnit[]> {
    const rows = await this.prisma.organizationalUnit.findMany({ where: { projectId } })
    return rows.map((row) => this.toDomain(row))
  }

  async save(unit: OrganizationalUnit): Promise<void> {
    const data = {
      projectId: unit.projectId,
      name: unit.name,
      description: unit.description,
      uoType: unit.uoType,
      mandate: unit.mandate,
      purpose: unit.purpose,
      parentUoId: unit.parentUoId,
      coordinatorAgentId: unit.coordinatorAgentId,
      functions: unit.functions as string[],
      status: unit.status,
      createdAt: unit.createdAt,
      updatedAt: unit.updatedAt,
    }
    await this.prisma.organizationalUnit.upsert({
      where: { id: unit.id },
      create: { id: unit.id, ...data },
      update: data,
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.organizationalUnit.delete({ where: { id } })
  }

  private toDomain(row: {
    id: string
    projectId: string
    name: string
    description: string
    uoType: string
    mandate: string
    purpose: string
    parentUoId: string | null
    coordinatorAgentId: string | null
    functions: string[]
    status: string
    createdAt: Date
    updatedAt: Date
  }): OrganizationalUnit {
    return OrganizationalUnit.reconstitute(row.id, {
      projectId: row.projectId,
      name: row.name,
      description: row.description,
      uoType: row.uoType as UoType,
      mandate: row.mandate,
      purpose: row.purpose,
      parentUoId: row.parentUoId,
      coordinatorAgentId: row.coordinatorAgentId,
      functions: [...row.functions],
      status: row.status as UoStatus,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }
}
