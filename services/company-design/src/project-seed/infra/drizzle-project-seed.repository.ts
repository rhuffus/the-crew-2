import { Inject, Injectable } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { DRIZZLE_DB } from '@the-crew/drizzle-db'
import type { ProjectSeedRepository } from '../domain/project-seed-repository'
import {
  ProjectSeed,
  type AiBudgetProps,
  type FounderPreferencesProps,
  type MaturityPhase,
} from '../domain/project-seed'
import { projectSeeds } from '../../drizzle/schema/project-seeds'

@Injectable()
export class DrizzleProjectSeedRepository implements ProjectSeedRepository {
  constructor(@Inject(DRIZZLE_DB) private readonly db: PostgresJsDatabase) {}

  async findByProjectId(projectId: string): Promise<ProjectSeed | null> {
    const rows = await this.db
      .select()
      .from(projectSeeds)
      .where(eq(projectSeeds.projectId, projectId))
      .limit(1)
    return rows[0] ? this.toDomain(rows[0]) : null
  }

  async save(seed: ProjectSeed): Promise<void> {
    const row = this.toRow(seed)
    await this.db
      .insert(projectSeeds)
      .values(row)
      .onConflictDoUpdate({ target: projectSeeds.projectId, set: row })
  }

  private toDomain(row: typeof projectSeeds.$inferSelect): ProjectSeed {
    return ProjectSeed.reconstitute(row.projectId, {
      name: row.name,
      description: row.description,
      mission: row.mission,
      vision: row.vision,
      companyType: row.companyType,
      restrictions: row.restrictions as string[],
      principles: row.principles as string[],
      aiBudget: row.aiBudget as AiBudgetProps,
      initialObjectives: row.initialObjectives as string[],
      founderPreferences: row.founderPreferences as FounderPreferencesProps,
      maturityPhase: row.maturityPhase as MaturityPhase,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }

  private toRow(seed: ProjectSeed): typeof projectSeeds.$inferInsert {
    return {
      projectId: seed.projectId,
      name: seed.name,
      description: seed.description,
      mission: seed.mission,
      vision: seed.vision,
      companyType: seed.companyType,
      restrictions: seed.restrictions as string[],
      principles: seed.principles as string[],
      aiBudget: seed.aiBudget,
      initialObjectives: seed.initialObjectives as string[],
      founderPreferences: seed.founderPreferences,
      maturityPhase: seed.maturityPhase,
      createdAt: seed.createdAt,
      updatedAt: seed.updatedAt,
    }
  }
}
