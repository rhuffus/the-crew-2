import { Inject, Injectable } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { DRIZZLE_DB } from '@the-crew/drizzle-db'
import type { DepartmentRepository } from '../domain/department-repository'
import { Department } from '../domain/department'
import { departments } from '../../drizzle/schema/departments'

@Injectable()
export class DrizzleDepartmentRepository implements DepartmentRepository {
  constructor(@Inject(DRIZZLE_DB) private readonly db: PostgresJsDatabase) {}

  async findById(id: string): Promise<Department | null> {
    const rows = await this.db
      .select()
      .from(departments)
      .where(eq(departments.id, id))
      .limit(1)
    return rows[0] ? this.toDomain(rows[0]) : null
  }

  async findByProjectId(projectId: string): Promise<Department[]> {
    const rows = await this.db
      .select()
      .from(departments)
      .where(eq(departments.projectId, projectId))
    return rows.map((row) => this.toDomain(row))
  }

  async save(dept: Department): Promise<void> {
    const row = this.toRow(dept)
    await this.db
      .insert(departments)
      .values(row)
      .onConflictDoUpdate({ target: departments.id, set: row })
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(departments).where(eq(departments.id, id))
  }

  private toDomain(row: typeof departments.$inferSelect): Department {
    return Department.reconstitute(row.id, {
      projectId: row.projectId,
      name: row.name,
      description: row.description,
      mandate: row.mandate,
      parentId: row.parentId ?? null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }

  private toRow(dept: Department): typeof departments.$inferInsert {
    return {
      id: dept.id,
      projectId: dept.projectId,
      name: dept.name,
      description: dept.description,
      mandate: dept.mandate,
      parentId: dept.parentId,
      createdAt: dept.createdAt,
      updatedAt: dept.updatedAt,
    }
  }
}
