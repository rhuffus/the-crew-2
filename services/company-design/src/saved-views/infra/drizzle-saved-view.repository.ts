import { Inject, Injectable } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { DRIZZLE_DB } from '@the-crew/drizzle-db'
import type { SavedViewRepository } from '../domain/saved-view-repository'
import { SavedView, type SavedViewState } from '../domain/saved-view'
import { savedViews } from '../../drizzle/schema/saved-views'

@Injectable()
export class DrizzleSavedViewRepository implements SavedViewRepository {
  constructor(@Inject(DRIZZLE_DB) private readonly db: PostgresJsDatabase) {}

  async findById(id: string): Promise<SavedView | null> {
    const rows = await this.db
      .select()
      .from(savedViews)
      .where(eq(savedViews.id, id))
      .limit(1)
    return rows[0] ? this.toDomain(rows[0]) : null
  }

  async findByProjectId(projectId: string): Promise<SavedView[]> {
    const rows = await this.db
      .select()
      .from(savedViews)
      .where(eq(savedViews.projectId, projectId))
    return rows.map((row) => this.toDomain(row))
  }

  async save(view: SavedView): Promise<void> {
    const row = this.toRow(view)
    await this.db
      .insert(savedViews)
      .values(row)
      .onConflictDoUpdate({ target: savedViews.id, set: row })
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(savedViews).where(eq(savedViews.id, id))
  }

  private toDomain(row: typeof savedViews.$inferSelect): SavedView {
    return SavedView.reconstitute(row.id, {
      projectId: row.projectId,
      name: row.name,
      state: row.state as SavedViewState,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }

  private toRow(view: SavedView): typeof savedViews.$inferInsert {
    return {
      id: view.id,
      projectId: view.projectId,
      name: view.name,
      state: view.state,
      createdAt: view.createdAt,
      updatedAt: view.updatedAt,
    }
  }
}
