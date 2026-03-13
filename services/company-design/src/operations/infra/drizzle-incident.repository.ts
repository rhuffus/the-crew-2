import { Inject, Injectable } from '@nestjs/common'
import { and, eq } from 'drizzle-orm'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { DRIZZLE_DB } from '@the-crew/drizzle-db'
import type { IncidentRepository } from '../domain/operations-repository'
import { Incident } from '../domain/incident'
import type { NodeType, IncidentSeverity, IncidentStatus } from '@the-crew/shared-types'
import { incidents } from '../../drizzle/schema/incidents'

@Injectable()
export class DrizzleIncidentRepository implements IncidentRepository {
  constructor(@Inject(DRIZZLE_DB) private readonly db: PostgresJsDatabase) {}

  async findById(id: string): Promise<Incident | null> {
    const rows = await this.db
      .select()
      .from(incidents)
      .where(eq(incidents.id, id))
      .limit(1)
    return rows[0] ? this.toDomain(rows[0]) : null
  }

  async listByProject(projectId: string): Promise<Incident[]> {
    const rows = await this.db
      .select()
      .from(incidents)
      .where(eq(incidents.projectId, projectId))
    return rows.map((row) => this.toDomain(row))
  }

  async listByEntity(
    projectId: string,
    entityId: string,
  ): Promise<Incident[]> {
    const rows = await this.db
      .select()
      .from(incidents)
      .where(
        and(
          eq(incidents.projectId, projectId),
          eq(incidents.entityId, entityId),
        ),
      )
    return rows.map((row) => this.toDomain(row))
  }

  async save(incident: Incident): Promise<void> {
    const row = this.toRow(incident)
    await this.db
      .insert(incidents)
      .values(row)
      .onConflictDoUpdate({ target: incidents.id, set: row })
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(incidents).where(eq(incidents.id, id))
  }

  private toDomain(row: typeof incidents.$inferSelect): Incident {
    return Incident.reconstitute({
      id: row.id,
      projectId: row.projectId,
      entityType: row.entityType as NodeType,
      entityId: row.entityId,
      severity: row.severity as IncidentSeverity,
      status: row.status as IncidentStatus,
      title: row.title,
      description: row.description,
      reportedAt: row.reportedAt,
      resolvedAt: row.resolvedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }

  private toRow(incident: Incident): typeof incidents.$inferInsert {
    return {
      id: incident.id,
      projectId: incident.projectId,
      entityType: incident.entityType,
      entityId: incident.entityId,
      severity: incident.severity,
      status: incident.status,
      title: incident.title,
      description: incident.description,
      reportedAt: incident.reportedAt,
      resolvedAt: incident.resolvedAt,
      createdAt: incident.createdAt,
      updatedAt: incident.updatedAt,
    }
  }
}
