import { Inject, Injectable } from '@nestjs/common'
import { and, eq } from 'drizzle-orm'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { DRIZZLE_DB } from '@the-crew/drizzle-db'
import type { AuditRepository } from '../domain/audit-repository'
import { AuditEntry } from '../domain/audit-entry'
import type { AuditAction } from '@the-crew/shared-types'
import { auditEntries } from '../../drizzle/schema/audit-entries'

@Injectable()
export class DrizzleAuditRepository implements AuditRepository {
  constructor(@Inject(DRIZZLE_DB) private readonly db: PostgresJsDatabase) {}

  async save(entry: AuditEntry): Promise<void> {
    const row = this.toRow(entry)
    await this.db.insert(auditEntries).values(row)
  }

  async findByProjectId(projectId: string): Promise<AuditEntry[]> {
    const rows = await this.db
      .select()
      .from(auditEntries)
      .where(eq(auditEntries.projectId, projectId))
    return rows.map((row) => this.toDomain(row))
  }

  async findByEntity(
    projectId: string,
    entityType: string,
    entityId: string,
  ): Promise<AuditEntry[]> {
    const rows = await this.db
      .select()
      .from(auditEntries)
      .where(
        and(
          eq(auditEntries.projectId, projectId),
          eq(auditEntries.entityType, entityType),
          eq(auditEntries.entityId, entityId),
        ),
      )
    return rows.map((row) => this.toDomain(row))
  }

  private toDomain(row: typeof auditEntries.$inferSelect): AuditEntry {
    return AuditEntry.reconstitute(row.id, {
      projectId: row.projectId,
      entityType: row.entityType,
      entityId: row.entityId,
      entityName: row.entityName,
      action: row.action as AuditAction,
      changes: row.changes as Record<string, unknown> | null,
      timestamp: row.timestamp,
    })
  }

  private toRow(entry: AuditEntry): typeof auditEntries.$inferInsert {
    return {
      id: entry.id,
      projectId: entry.projectId,
      entityType: entry.entityType,
      entityId: entry.entityId,
      entityName: entry.entityName,
      action: entry.action,
      changes: entry.changes,
      timestamp: entry.timestamp,
    }
  }
}
