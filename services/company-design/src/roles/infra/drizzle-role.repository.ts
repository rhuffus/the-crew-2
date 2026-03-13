import { Inject, Injectable } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { DRIZZLE_DB } from '@the-crew/drizzle-db'
import type { RoleRepository } from '../domain/role-repository'
import { Role } from '../domain/role'
import { roles } from '../../drizzle/schema/roles'

@Injectable()
export class DrizzleRoleRepository implements RoleRepository {
  constructor(@Inject(DRIZZLE_DB) private readonly db: PostgresJsDatabase) {}

  async findById(id: string): Promise<Role | null> {
    const rows = await this.db
      .select()
      .from(roles)
      .where(eq(roles.id, id))
      .limit(1)
    return rows[0] ? this.toDomain(rows[0]) : null
  }

  async findByProjectId(projectId: string): Promise<Role[]> {
    const rows = await this.db
      .select()
      .from(roles)
      .where(eq(roles.projectId, projectId))
    return rows.map((row) => this.toDomain(row))
  }

  async save(role: Role): Promise<void> {
    const row = this.toRow(role)
    await this.db
      .insert(roles)
      .values(row)
      .onConflictDoUpdate({ target: roles.id, set: row })
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(roles).where(eq(roles.id, id))
  }

  private toDomain(row: typeof roles.$inferSelect): Role {
    return Role.reconstitute(row.id, {
      projectId: row.projectId,
      name: row.name,
      description: row.description,
      departmentId: row.departmentId,
      capabilityIds: [...(row.capabilityIds as string[])],
      accountability: row.accountability,
      authority: row.authority,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }

  private toRow(role: Role): typeof roles.$inferInsert {
    return {
      id: role.id,
      projectId: role.projectId,
      name: role.name,
      description: role.description,
      departmentId: role.departmentId,
      capabilityIds: role.capabilityIds as string[],
      accountability: role.accountability,
      authority: role.authority,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    }
  }
}
