import { Injectable } from '@nestjs/common'
import { CompanyDesignPrismaService } from '../../prisma/company-design-prisma.service'
import type { ContractRepository } from '../domain/contract-repository'
import { Contract } from '../domain/contract'
import type { ContractType, ContractStatus, PartyType } from '../domain/contract'

@Injectable()
export class PrismaContractRepository implements ContractRepository {
  constructor(private readonly prisma: CompanyDesignPrismaService) {}

  async findById(id: string): Promise<Contract | null> {
    const row = await this.prisma.contract.findUnique({ where: { id } })
    return row ? this.toDomain(row) : null
  }

  async findByProjectId(projectId: string): Promise<Contract[]> {
    const rows = await this.prisma.contract.findMany({ where: { projectId } })
    return rows.map((row) => this.toDomain(row))
  }

  async save(contract: Contract): Promise<void> {
    await this.prisma.contract.upsert({
      where: { id: contract.id },
      create: {
        id: contract.id,
        projectId: contract.projectId,
        name: contract.name,
        description: contract.description,
        type: contract.type,
        status: contract.status,
        providerId: contract.providerId,
        providerType: contract.providerType,
        consumerId: contract.consumerId,
        consumerType: contract.consumerType,
        acceptanceCriteria: contract.acceptanceCriteria as string[],
        createdAt: contract.createdAt,
        updatedAt: contract.updatedAt,
      },
      update: {
        projectId: contract.projectId,
        name: contract.name,
        description: contract.description,
        type: contract.type,
        status: contract.status,
        providerId: contract.providerId,
        providerType: contract.providerType,
        consumerId: contract.consumerId,
        consumerType: contract.consumerType,
        acceptanceCriteria: contract.acceptanceCriteria as string[],
        updatedAt: contract.updatedAt,
      },
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.contract.delete({ where: { id } })
  }

  private toDomain(row: {
    id: string
    projectId: string
    name: string
    description: string
    type: string
    status: string
    providerId: string
    providerType: string
    consumerId: string
    consumerType: string
    acceptanceCriteria: string[]
    createdAt: Date
    updatedAt: Date
  }): Contract {
    return Contract.reconstitute(row.id, {
      projectId: row.projectId,
      name: row.name,
      description: row.description,
      type: row.type as ContractType,
      status: row.status as ContractStatus,
      providerId: row.providerId,
      providerType: row.providerType as PartyType,
      consumerId: row.consumerId,
      consumerType: row.consumerType as PartyType,
      acceptanceCriteria: [...row.acceptanceCriteria],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }
}
