import { Inject, Injectable } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { DRIZZLE_DB } from '@the-crew/drizzle-db'
import type { SkillRepository } from '../domain/skill-repository'
import { Skill } from '../domain/skill'
import { skills } from '../../drizzle/schema/skills'

@Injectable()
export class DrizzleSkillRepository implements SkillRepository {
  constructor(@Inject(DRIZZLE_DB) private readonly db: PostgresJsDatabase) {}

  async findById(id: string): Promise<Skill | null> {
    const rows = await this.db
      .select()
      .from(skills)
      .where(eq(skills.id, id))
      .limit(1)
    return rows[0] ? this.toDomain(rows[0]) : null
  }

  async findByProjectId(projectId: string): Promise<Skill[]> {
    const rows = await this.db
      .select()
      .from(skills)
      .where(eq(skills.projectId, projectId))
    return rows.map((row) => this.toDomain(row))
  }

  async save(skill: Skill): Promise<void> {
    const row = this.toRow(skill)
    await this.db
      .insert(skills)
      .values(row)
      .onConflictDoUpdate({ target: skills.id, set: row })
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(skills).where(eq(skills.id, id))
  }

  private toDomain(row: typeof skills.$inferSelect): Skill {
    return Skill.reconstitute(row.id, {
      projectId: row.projectId,
      name: row.name,
      description: row.description,
      category: row.category,
      tags: [...(row.tags as string[])],
      compatibleRoleIds: [...(row.compatibleRoleIds as string[])],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }

  private toRow(skill: Skill): typeof skills.$inferInsert {
    return {
      id: skill.id,
      projectId: skill.projectId,
      name: skill.name,
      description: skill.description,
      category: skill.category,
      tags: skill.tags as string[],
      compatibleRoleIds: skill.compatibleRoleIds as string[],
      createdAt: skill.createdAt,
      updatedAt: skill.updatedAt,
    }
  }
}
