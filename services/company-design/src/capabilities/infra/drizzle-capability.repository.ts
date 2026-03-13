import { Inject, Injectable } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { DRIZZLE_DB } from '@the-crew/drizzle-db'
import type { CapabilityRepository } from '../domain/capability-repository'
import { Capability } from '../domain/capability'
import { capabilities } from '../../drizzle/schema/capabilities'

@Injectable()
export class DrizzleCapabilityRepository implements CapabilityRepository {
  constructor(@Inject(DRIZZLE_DB) private readonly db: PostgresJsDatabase) {}

  async findById(id: string): Promise<Capability | null> {
    const rows = await this.db
      .select()
      .from(capabilities)
      .where(eq(capabilities.id, id))
      .limit(1)
    return rows[0] ? this.toDomain(rows[0]) : null
  }

  async findByProjectId(projectId: string): Promise<Capability[]> {
    const rows = await this.db
      .select()
      .from(capabilities)
      .where(eq(capabilities.projectId, projectId))
    return rows.map((row) => this.toDomain(row))
  }

  async save(capability: Capability): Promise<void> {
    const row = this.toRow(capability)
    await this.db
      .insert(capabilities)
      .values(row)
      .onConflictDoUpdate({ target: capabilities.id, set: row })
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(capabilities).where(eq(capabilities.id, id))
  }

  private toDomain(row: typeof capabilities.$inferSelect): Capability {
    return Capability.reconstitute(row.id, {
      projectId: row.projectId,
      name: row.name,
      description: row.description,
      ownerDepartmentId: row.ownerDepartmentId ?? null,
      inputs: [...(row.inputs as string[])],
      outputs: [...(row.outputs as string[])],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }

  private toRow(capability: Capability): typeof capabilities.$inferInsert {
    return {
      id: capability.id,
      projectId: capability.projectId,
      name: capability.name,
      description: capability.description,
      ownerDepartmentId: capability.ownerDepartmentId,
      inputs: capability.inputs as string[],
      outputs: capability.outputs as string[],
      createdAt: capability.createdAt,
      updatedAt: capability.updatedAt,
    }
  }
}
