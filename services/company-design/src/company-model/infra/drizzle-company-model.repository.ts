import { Inject, Injectable } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { DRIZZLE_DB } from '@the-crew/drizzle-db'
import type { CompanyModelRepository } from '../domain/company-model-repository'
import { CompanyModel } from '../domain/company-model'
import { companyModels } from '../../drizzle/schema/company-models'

@Injectable()
export class DrizzleCompanyModelRepository implements CompanyModelRepository {
  constructor(@Inject(DRIZZLE_DB) private readonly db: PostgresJsDatabase) {}

  async findByProjectId(projectId: string): Promise<CompanyModel | null> {
    const rows = await this.db
      .select()
      .from(companyModels)
      .where(eq(companyModels.projectId, projectId))
      .limit(1)
    return rows[0] ? this.toDomain(rows[0]) : null
  }

  async save(model: CompanyModel): Promise<void> {
    const row = this.toRow(model)
    await this.db
      .insert(companyModels)
      .values(row)
      .onConflictDoUpdate({ target: companyModels.projectId, set: row })
  }

  private toDomain(row: typeof companyModels.$inferSelect): CompanyModel {
    return CompanyModel.reconstitute(row.projectId, {
      purpose: row.purpose,
      type: row.type,
      scope: row.scope,
      principles: [...(row.principles as string[])],
      updatedAt: row.updatedAt,
    })
  }

  private toRow(model: CompanyModel): typeof companyModels.$inferInsert {
    return {
      projectId: model.projectId,
      purpose: model.purpose,
      type: model.type,
      scope: model.scope,
      principles: model.principles as string[],
      updatedAt: model.updatedAt,
    }
  }
}
