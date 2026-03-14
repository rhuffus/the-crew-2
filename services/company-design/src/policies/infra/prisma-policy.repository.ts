import { Injectable } from '@nestjs/common'
import { CompanyDesignPrismaService } from '../../prisma/company-design-prisma.service'
import type { PolicyRepository } from '../domain/policy-repository'
import { Policy } from '../domain/policy'
import type {
  PolicyScope,
  PolicyType,
  PolicyEnforcement,
  PolicyStatus,
} from '../domain/policy'

@Injectable()
export class PrismaPolicyRepository implements PolicyRepository {
  constructor(private readonly prisma: CompanyDesignPrismaService) {}

  async findById(id: string): Promise<Policy | null> {
    const row = await this.prisma.policy.findUnique({ where: { id } })
    return row ? this.toDomain(row) : null
  }

  async findByProjectId(projectId: string): Promise<Policy[]> {
    const rows = await this.prisma.policy.findMany({ where: { projectId } })
    return rows.map((row) => this.toDomain(row))
  }

  async save(policy: Policy): Promise<void> {
    await this.prisma.policy.upsert({
      where: { id: policy.id },
      create: {
        id: policy.id,
        projectId: policy.projectId,
        name: policy.name,
        description: policy.description,
        scope: policy.scope,
        departmentId: policy.departmentId,
        type: policy.type,
        condition: policy.condition,
        enforcement: policy.enforcement,
        status: policy.status,
        createdAt: policy.createdAt,
        updatedAt: policy.updatedAt,
      },
      update: {
        projectId: policy.projectId,
        name: policy.name,
        description: policy.description,
        scope: policy.scope,
        departmentId: policy.departmentId,
        type: policy.type,
        condition: policy.condition,
        enforcement: policy.enforcement,
        status: policy.status,
        updatedAt: policy.updatedAt,
      },
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.policy.delete({ where: { id } })
  }

  private toDomain(row: {
    id: string
    projectId: string
    name: string
    description: string
    scope: string
    departmentId: string | null
    type: string
    condition: string
    enforcement: string
    status: string
    createdAt: Date
    updatedAt: Date
  }): Policy {
    return Policy.reconstitute(row.id, {
      projectId: row.projectId,
      name: row.name,
      description: row.description,
      scope: row.scope as PolicyScope,
      departmentId: row.departmentId ?? null,
      type: row.type as PolicyType,
      condition: row.condition,
      enforcement: row.enforcement as PolicyEnforcement,
      status: row.status as PolicyStatus,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }
}
