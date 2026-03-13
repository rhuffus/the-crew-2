import { Inject, Injectable } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { DRIZZLE_DB } from '@the-crew/drizzle-db'
import type { PolicyRepository } from '../domain/policy-repository'
import { Policy } from '../domain/policy'
import type {
  PolicyScope,
  PolicyType,
  PolicyEnforcement,
  PolicyStatus,
} from '../domain/policy'
import { policies } from '../../drizzle/schema/policies'

@Injectable()
export class DrizzlePolicyRepository implements PolicyRepository {
  constructor(@Inject(DRIZZLE_DB) private readonly db: PostgresJsDatabase) {}

  async findById(id: string): Promise<Policy | null> {
    const rows = await this.db
      .select()
      .from(policies)
      .where(eq(policies.id, id))
      .limit(1)
    return rows[0] ? this.toDomain(rows[0]) : null
  }

  async findByProjectId(projectId: string): Promise<Policy[]> {
    const rows = await this.db
      .select()
      .from(policies)
      .where(eq(policies.projectId, projectId))
    return rows.map((row) => this.toDomain(row))
  }

  async save(policy: Policy): Promise<void> {
    const row = this.toRow(policy)
    await this.db
      .insert(policies)
      .values(row)
      .onConflictDoUpdate({ target: policies.id, set: row })
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(policies).where(eq(policies.id, id))
  }

  private toDomain(row: typeof policies.$inferSelect): Policy {
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

  private toRow(policy: Policy): typeof policies.$inferInsert {
    return {
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
    }
  }
}
