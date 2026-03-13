import { Inject, Injectable } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { DRIZZLE_DB } from '@the-crew/drizzle-db'
import type { ReleaseRepository } from '../domain/release-repository'
import { Release, type ReleaseStatus } from '../domain/release'
import type { ReleaseSnapshotDto, ValidationIssue } from '@the-crew/shared-types'
import { releases } from '../../drizzle/schema/releases'

@Injectable()
export class DrizzleReleaseRepository implements ReleaseRepository {
  constructor(@Inject(DRIZZLE_DB) private readonly db: PostgresJsDatabase) {}

  async findById(id: string): Promise<Release | null> {
    const rows = await this.db
      .select()
      .from(releases)
      .where(eq(releases.id, id))
      .limit(1)
    return rows[0] ? this.toDomain(rows[0]) : null
  }

  async findByProjectId(projectId: string): Promise<Release[]> {
    const rows = await this.db
      .select()
      .from(releases)
      .where(eq(releases.projectId, projectId))
    return rows.map((row) => this.toDomain(row))
  }

  async save(release: Release): Promise<void> {
    const row = this.toRow(release)
    await this.db
      .insert(releases)
      .values(row)
      .onConflictDoUpdate({ target: releases.id, set: row })
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(releases).where(eq(releases.id, id))
  }

  private toDomain(row: typeof releases.$inferSelect): Release {
    return Release.reconstitute(row.id, {
      projectId: row.projectId,
      version: row.version,
      status: row.status as ReleaseStatus,
      notes: row.notes,
      snapshot: row.snapshot as ReleaseSnapshotDto | null,
      validationIssues: row.validationIssues as ValidationIssue[],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      publishedAt: row.publishedAt,
    })
  }

  private toRow(release: Release): typeof releases.$inferInsert {
    return {
      id: release.id,
      projectId: release.projectId,
      version: release.version,
      status: release.status,
      notes: release.notes,
      snapshot: release.snapshot,
      validationIssues: release.validationIssues,
      createdAt: release.createdAt,
      updatedAt: release.updatedAt,
      publishedAt: release.publishedAt,
    }
  }
}
