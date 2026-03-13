import { Inject, Injectable } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { DRIZZLE_DB } from '@the-crew/drizzle-db'
import type { ContractRepository } from '../domain/contract-repository'
import { Contract } from '../domain/contract'
import type { ContractType, ContractStatus, PartyType } from '../domain/contract'
import { contracts } from '../../drizzle/schema/contracts'

@Injectable()
export class DrizzleContractRepository implements ContractRepository {
  constructor(@Inject(DRIZZLE_DB) private readonly db: PostgresJsDatabase) {}

  async findById(id: string): Promise<Contract | null> {
    const rows = await this.db
      .select()
      .from(contracts)
      .where(eq(contracts.id, id))
      .limit(1)
    return rows[0] ? this.toDomain(rows[0]) : null
  }

  async findByProjectId(projectId: string): Promise<Contract[]> {
    const rows = await this.db
      .select()
      .from(contracts)
      .where(eq(contracts.projectId, projectId))
    return rows.map((row) => this.toDomain(row))
  }

  async save(contract: Contract): Promise<void> {
    const row = this.toRow(contract)
    await this.db
      .insert(contracts)
      .values(row)
      .onConflictDoUpdate({ target: contracts.id, set: row })
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(contracts).where(eq(contracts.id, id))
  }

  private toDomain(row: typeof contracts.$inferSelect): Contract {
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
      acceptanceCriteria: [...(row.acceptanceCriteria as string[])],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }

  private toRow(contract: Contract): typeof contracts.$inferInsert {
    return {
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
    }
  }
}
