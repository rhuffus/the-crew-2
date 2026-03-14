import { Injectable } from '@nestjs/common'
import { CompanyDesignPrismaService } from '../../prisma/company-design-prisma.service'
import type { ContractComplianceRepository } from '../domain/operations-repository'
import { ContractCompliance } from '../domain/contract-compliance'
import type { ComplianceStatus } from '@the-crew/shared-types'

@Injectable()
export class PrismaContractComplianceRepository implements ContractComplianceRepository {
  constructor(private readonly prisma: CompanyDesignPrismaService) {}

  async findById(id: string): Promise<ContractCompliance | null> {
    const row = await this.prisma.contractCompliance.findUnique({ where: { id } })
    return row ? this.toDomain(row) : null
  }

  async findByContract(projectId: string, contractId: string): Promise<ContractCompliance | null> {
    const row = await this.prisma.contractCompliance.findFirst({
      where: { projectId, contractId },
    })
    return row ? this.toDomain(row) : null
  }

  async listByProject(projectId: string): Promise<ContractCompliance[]> {
    const rows = await this.prisma.contractCompliance.findMany({ where: { projectId } })
    return rows.map((row) => this.toDomain(row))
  }

  async save(compliance: ContractCompliance): Promise<void> {
    const data = {
      projectId: compliance.projectId,
      contractId: compliance.contractId,
      status: compliance.status,
      reason: compliance.reason,
      lastCheckedAt: compliance.lastCheckedAt,
      createdAt: compliance.createdAt,
      updatedAt: compliance.updatedAt,
    }
    await this.prisma.contractCompliance.upsert({
      where: { id: compliance.id },
      create: { id: compliance.id, ...data },
      update: data,
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.contractCompliance.delete({ where: { id } })
  }

  private toDomain(row: {
    id: string
    projectId: string
    contractId: string
    status: string
    reason: string | null
    lastCheckedAt: Date
    createdAt: Date
    updatedAt: Date
  }): ContractCompliance {
    return ContractCompliance.reconstitute({
      id: row.id,
      projectId: row.projectId,
      contractId: row.contractId,
      status: row.status as ComplianceStatus,
      reason: row.reason,
      lastCheckedAt: row.lastCheckedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }
}
