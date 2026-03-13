import { Inject, Injectable } from '@nestjs/common'
import { count, desc, eq, or } from 'drizzle-orm'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { DRIZZLE_DB } from '@the-crew/drizzle-db'
import type { RuntimeEventRepository } from '../domain/runtime-repository'
import { RuntimeEvent } from '../domain/runtime-event'
import type { RuntimeEventType, EventSeverity } from '@the-crew/shared-types'
import { runtimeEvents } from '../../drizzle/schema/runtime-events'

@Injectable()
export class DrizzleRuntimeEventRepository implements RuntimeEventRepository {
  constructor(@Inject(DRIZZLE_DB) private readonly db: PostgresJsDatabase) {}

  async findById(id: string): Promise<RuntimeEvent | null> {
    const rows = await this.db
      .select()
      .from(runtimeEvents)
      .where(eq(runtimeEvents.id, id))
      .limit(1)
    return rows[0] ? this.toDomain(rows[0]) : null
  }

  async append(event: RuntimeEvent): Promise<void> {
    const row = this.toRow(event)
    await this.db.insert(runtimeEvents).values(row)
  }

  async listByProject(
    projectId: string,
    limit?: number,
    offset?: number,
  ): Promise<RuntimeEvent[]> {
    let query = this.db
      .select()
      .from(runtimeEvents)
      .where(eq(runtimeEvents.projectId, projectId))
      .orderBy(desc(runtimeEvents.occurredAt))
      .$dynamic()
    if (limit !== undefined) query = query.limit(limit)
    if (offset !== undefined) query = query.offset(offset)
    const rows = await query
    return rows.map((row) => this.toDomain(row))
  }

  async listByExecution(executionId: string): Promise<RuntimeEvent[]> {
    const rows = await this.db
      .select()
      .from(runtimeEvents)
      .where(eq(runtimeEvents.executionId, executionId))
      .orderBy(desc(runtimeEvents.occurredAt))
    return rows.map((row) => this.toDomain(row))
  }

  async listByEntity(entityId: string, limit?: number): Promise<RuntimeEvent[]> {
    let query = this.db
      .select()
      .from(runtimeEvents)
      .where(
        or(
          eq(runtimeEvents.sourceEntityId, entityId),
          eq(runtimeEvents.targetEntityId, entityId),
        ),
      )
      .orderBy(desc(runtimeEvents.occurredAt))
      .$dynamic()
    if (limit !== undefined) query = query.limit(limit)
    const rows = await query
    return rows.map((row) => this.toDomain(row))
  }

  async findLatestByEntity(entityId: string): Promise<RuntimeEvent | null> {
    const rows = await this.db
      .select()
      .from(runtimeEvents)
      .where(
        or(
          eq(runtimeEvents.sourceEntityId, entityId),
          eq(runtimeEvents.targetEntityId, entityId),
        ),
      )
      .orderBy(desc(runtimeEvents.occurredAt))
      .limit(1)
    return rows[0] ? this.toDomain(rows[0]) : null
  }

  async countByProject(projectId: string): Promise<number> {
    const result = await this.db
      .select({ value: count() })
      .from(runtimeEvents)
      .where(eq(runtimeEvents.projectId, projectId))
    return result[0]?.value ?? 0
  }

  private toDomain(row: typeof runtimeEvents.$inferSelect): RuntimeEvent {
    return RuntimeEvent.reconstitute({
      id: row.id,
      projectId: row.projectId,
      eventType: row.eventType as RuntimeEventType,
      severity: row.severity as EventSeverity,
      title: row.title,
      description: row.description,
      sourceEntityType: row.sourceEntityType,
      sourceEntityId: row.sourceEntityId,
      targetEntityType: row.targetEntityType,
      targetEntityId: row.targetEntityId,
      executionId: row.executionId,
      metadata: row.metadata as Record<string, unknown>,
      occurredAt: row.occurredAt,
    })
  }

  private toRow(event: RuntimeEvent): typeof runtimeEvents.$inferInsert {
    return {
      id: event.id,
      projectId: event.projectId,
      eventType: event.eventType,
      severity: event.severity,
      title: event.title,
      description: event.description,
      sourceEntityType: event.sourceEntityType,
      sourceEntityId: event.sourceEntityId,
      targetEntityType: event.targetEntityType,
      targetEntityId: event.targetEntityId,
      executionId: event.executionId,
      metadata: event.metadata,
      occurredAt: event.occurredAt,
    }
  }
}
