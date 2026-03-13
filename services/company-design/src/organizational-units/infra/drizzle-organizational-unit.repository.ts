import { Inject, Injectable } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { DRIZZLE_DB } from '@the-crew/drizzle-db'
import type { OrganizationalUnitRepository } from '../domain/organizational-unit-repository'
import {
  OrganizationalUnit,
  type UoType,
  type UoStatus,
} from '../domain/organizational-unit'
import { organizationalUnits } from '../../drizzle/schema/organizational-units'

@Injectable()
export class DrizzleOrganizationalUnitRepository implements OrganizationalUnitRepository {
  constructor(@Inject(DRIZZLE_DB) private readonly db: PostgresJsDatabase) {}

  async findById(id: string): Promise<OrganizationalUnit | null> {
    const rows = await this.db
      .select()
      .from(organizationalUnits)
      .where(eq(organizationalUnits.id, id))
      .limit(1)
    return rows[0] ? this.toDomain(rows[0]) : null
  }

  async findByProjectId(projectId: string): Promise<OrganizationalUnit[]> {
    const rows = await this.db
      .select()
      .from(organizationalUnits)
      .where(eq(organizationalUnits.projectId, projectId))
    return rows.map((row) => this.toDomain(row))
  }

  async save(unit: OrganizationalUnit): Promise<void> {
    const row = this.toRow(unit)
    await this.db
      .insert(organizationalUnits)
      .values(row)
      .onConflictDoUpdate({ target: organizationalUnits.id, set: row })
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(organizationalUnits).where(eq(organizationalUnits.id, id))
  }

  private toDomain(row: typeof organizationalUnits.$inferSelect): OrganizationalUnit {
    return OrganizationalUnit.reconstitute(row.id, {
      projectId: row.projectId,
      name: row.name,
      description: row.description,
      uoType: row.uoType as UoType,
      mandate: row.mandate,
      purpose: row.purpose,
      parentUoId: row.parentUoId,
      coordinatorAgentId: row.coordinatorAgentId,
      functions: row.functions as string[],
      status: row.status as UoStatus,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }

  private toRow(unit: OrganizationalUnit): typeof organizationalUnits.$inferInsert {
    return {
      id: unit.id,
      projectId: unit.projectId,
      name: unit.name,
      description: unit.description,
      uoType: unit.uoType,
      mandate: unit.mandate,
      purpose: unit.purpose,
      parentUoId: unit.parentUoId,
      coordinatorAgentId: unit.coordinatorAgentId,
      functions: unit.functions,
      status: unit.status,
      createdAt: unit.createdAt,
      updatedAt: unit.updatedAt,
    }
  }
}
