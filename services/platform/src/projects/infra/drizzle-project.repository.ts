import { Inject, Injectable } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { DRIZZLE_DB } from '@the-crew/drizzle-db'
import type { ProjectRepository } from '../domain/project-repository'
import { Project } from '../domain/project'
import { projects } from '../../drizzle/schema/projects'

@Injectable()
export class DrizzleProjectRepository implements ProjectRepository {
  constructor(@Inject(DRIZZLE_DB) private readonly db: PostgresJsDatabase) {}

  async findById(id: string): Promise<Project | null> {
    const rows = await this.db.select().from(projects).where(eq(projects.id, id)).limit(1)
    return rows[0] ? this.toDomain(rows[0]) : null
  }

  async findAll(): Promise<Project[]> {
    const rows = await this.db.select().from(projects)
    return rows.map((row) => this.toDomain(row))
  }

  async save(project: Project): Promise<void> {
    const row = this.toRow(project)
    await this.db
      .insert(projects)
      .values(row)
      .onConflictDoUpdate({ target: projects.id, set: row })
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(projects).where(eq(projects.id, id))
  }

  private toDomain(row: typeof projects.$inferSelect): Project {
    return Project.reconstitute(row.id, {
      name: row.name,
      description: row.description,
      status: row.status as 'active' | 'archived',
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }

  private toRow(project: Project): typeof projects.$inferInsert {
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    }
  }
}
