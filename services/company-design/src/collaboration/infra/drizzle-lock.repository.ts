import { Inject, Injectable } from '@nestjs/common'
import { and, eq } from 'drizzle-orm'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { DRIZZLE_DB } from '@the-crew/drizzle-db'
import type { LockRepository } from '../domain/collaboration-repository'
import { EntityLock } from '../domain/entity-lock'
import type { NodeType } from '@the-crew/shared-types'
import { entityLocks } from '../../drizzle/schema/entity-locks'

@Injectable()
export class DrizzleLockRepository implements LockRepository {
  constructor(@Inject(DRIZZLE_DB) private readonly db: PostgresJsDatabase) {}

  async findByEntity(
    projectId: string,
    entityId: string,
  ): Promise<EntityLock | null> {
    const rows = await this.db
      .select()
      .from(entityLocks)
      .where(
        and(
          eq(entityLocks.projectId, projectId),
          eq(entityLocks.entityId, entityId),
        ),
      )
      .limit(1)
    return rows[0] ? this.toDomain(rows[0]) : null
  }

  async listByProject(projectId: string): Promise<EntityLock[]> {
    const rows = await this.db
      .select()
      .from(entityLocks)
      .where(eq(entityLocks.projectId, projectId))
    return rows.map((row) => this.toDomain(row))
  }

  async save(lock: EntityLock): Promise<void> {
    const row = this.toRow(lock)
    await this.db
      .insert(entityLocks)
      .values(row)
      .onConflictDoUpdate({ target: entityLocks.id, set: row })
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(entityLocks).where(eq(entityLocks.id, id))
  }

  private toDomain(row: typeof entityLocks.$inferSelect): EntityLock {
    return EntityLock.reconstitute({
      id: row.id,
      projectId: row.projectId,
      entityId: row.entityId,
      nodeType: row.nodeType as NodeType,
      lockedBy: row.lockedBy,
      lockedByName: row.lockedByName,
      lockedAt: row.lockedAt,
      expiresAt: row.expiresAt,
    })
  }

  private toRow(lock: EntityLock): typeof entityLocks.$inferInsert {
    return {
      id: lock.id,
      projectId: lock.projectId,
      entityId: lock.entityId,
      nodeType: lock.nodeType,
      lockedBy: lock.lockedBy,
      lockedByName: lock.lockedByName,
      lockedAt: lock.lockedAt,
      expiresAt: lock.expiresAt,
    }
  }
}
