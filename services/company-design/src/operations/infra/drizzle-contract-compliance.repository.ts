import { Inject, Injectable } from '@nestjs/common'
import { and, eq } from 'drizzle-orm'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { DRIZZLE_DB } from '@the-crew/drizzle-db'
import type { ContractComplianceRepository } from '../domain/operations-repository'
import { ContractCompliance } from '../domain/contract-compliance'
import type { ComplianceStatus } from '@the-crew/shared-types'
import { contractCompliances } from '../../drizzle/schema/contract-compliances'

@Injectable()
export class DrizzleContractComplianceRepository implements ContractComplianceRepository {
  constructor(@Inject(DRIZZLE_DB) private readonly db: PostgresJsDatabase) {}

  async findById(id: string): Promise<ContractCompliance | null> {
    const rows = await this.db
      .select()
      .from(contractCompliances)
      .where(eq(contractCompliances.id, id))
      .limit(1)
    return rows[0] ? this.toDomain(rows[0]) : null
  }

  async findByContract(
    projectId: string,
    contractId: string,
  ): Promise<ContractCompliance | null> {
    const rows = await this.db
      .select()
      .from(contractCompliances)
      .where(
        and(
          eq(contractCompliances.projectId, projectId),
          eq(contractCompliances.contractId, contractId),
        ),
      )
      .limit(1)
    return rows[0] ? this.toDomain(rows[0]) : null
  }

  async listByProject(projectId: string): Promise<ContractCompliance[]> {
    const rows = await this.db
      .select()
      .from(contractCompliances)
      .where(eq(contractCompliances.projectId, projectId))
    return rows.map((row) => this.toDomain(row))
  }

  async save(compliance: ContractCompliance): Promise<void> {
    const row = this.toRow(compliance)
    await this.db
      .insert(contractCompliances)
      .values(row)
      .onConflictDoUpdate({ target: contractCompliances.id, set: row })
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(contractCompliances).where(eq(contractCompliances.id, id))
  }

  private toDomain(row: typeof contractCompliances.$inferSelect): ContractCompliance {
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

  private toRow(compliance: ContractCompliance): typeof contractCompliances.$inferInsert {
    return {
      id: compliance.id,
      projectId: compliance.projectId,
      contractId: compliance.contractId,
      status: compliance.status,
      reason: compliance.reason,
      lastCheckedAt: compliance.lastCheckedAt,
      createdAt: compliance.createdAt,
      updatedAt: compliance.updatedAt,
    }
  }
}
