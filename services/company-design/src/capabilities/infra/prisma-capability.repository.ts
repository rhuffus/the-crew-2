import { Injectable } from '@nestjs/common'
import { CompanyDesignPrismaService } from '../../prisma/company-design-prisma.service'
import type { CapabilityRepository } from '../domain/capability-repository'
import { Capability } from '../domain/capability'

@Injectable()
export class PrismaCapabilityRepository implements CapabilityRepository {
  constructor(private readonly prisma: CompanyDesignPrismaService) {}

  async findById(id: string): Promise<Capability | null> {
    const row = await this.prisma.capability.findUnique({ where: { id } })
    return row ? this.toDomain(row) : null
  }

  async findByProjectId(projectId: string): Promise<Capability[]> {
    const rows = await this.prisma.capability.findMany({
      where: { projectId },
    })
    return rows.map((row) => this.toDomain(row))
  }

  async save(capability: Capability): Promise<void> {
    await this.prisma.capability.upsert({
      where: { id: capability.id },
      create: {
        id: capability.id,
        projectId: capability.projectId,
        name: capability.name,
        description: capability.description,
        ownerDepartmentId: capability.ownerDepartmentId,
        inputs: capability.inputs as string[],
        outputs: capability.outputs as string[],
        createdAt: capability.createdAt,
        updatedAt: capability.updatedAt,
      },
      update: {
        projectId: capability.projectId,
        name: capability.name,
        description: capability.description,
        ownerDepartmentId: capability.ownerDepartmentId,
        inputs: capability.inputs as string[],
        outputs: capability.outputs as string[],
        updatedAt: capability.updatedAt,
      },
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.capability.delete({ where: { id } })
  }

  private toDomain(row: {
    id: string
    projectId: string
    name: string
    description: string
    ownerDepartmentId: string | null
    inputs: string[]
    outputs: string[]
    createdAt: Date
    updatedAt: Date
  }): Capability {
    return Capability.reconstitute(row.id, {
      projectId: row.projectId,
      name: row.name,
      description: row.description,
      ownerDepartmentId: row.ownerDepartmentId ?? null,
      inputs: [...row.inputs],
      outputs: [...row.outputs],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }
}
