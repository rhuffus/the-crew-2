import { Inject, Injectable } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { DRIZZLE_DB } from '@the-crew/drizzle-db'
import type { CompanyConstitutionRepository } from '../domain/company-constitution-repository'
import {
  CompanyConstitution,
  type AutonomyLimitsProps,
  type BudgetConfigProps,
  type ApprovalCriterionProps,
  type ExpansionRuleProps,
} from '../domain/company-constitution'
import { companyConstitutions } from '../../drizzle/schema/company-constitutions'

@Injectable()
export class DrizzleCompanyConstitutionRepository implements CompanyConstitutionRepository {
  constructor(@Inject(DRIZZLE_DB) private readonly db: PostgresJsDatabase) {}

  async findByProjectId(projectId: string): Promise<CompanyConstitution | null> {
    const rows = await this.db
      .select()
      .from(companyConstitutions)
      .where(eq(companyConstitutions.projectId, projectId))
      .limit(1)
    return rows[0] ? this.toDomain(rows[0]) : null
  }

  async save(constitution: CompanyConstitution): Promise<void> {
    const row = this.toRow(constitution)
    await this.db
      .insert(companyConstitutions)
      .values(row)
      .onConflictDoUpdate({ target: companyConstitutions.projectId, set: row })
  }

  private toDomain(row: typeof companyConstitutions.$inferSelect): CompanyConstitution {
    return CompanyConstitution.reconstitute(row.projectId, {
      operationalPrinciples: row.operationalPrinciples as string[],
      autonomyLimits: row.autonomyLimits as AutonomyLimitsProps,
      budgetConfig: row.budgetConfig as BudgetConfigProps,
      approvalCriteria: row.approvalCriteria as ApprovalCriterionProps[],
      namingConventions: row.namingConventions as string[],
      expansionRules: row.expansionRules as ExpansionRuleProps[],
      contextMinimizationPolicy: row.contextMinimizationPolicy,
      qualityRules: row.qualityRules as string[],
      deliveryRules: row.deliveryRules as string[],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }

  private toRow(constitution: CompanyConstitution): typeof companyConstitutions.$inferInsert {
    return {
      projectId: constitution.projectId,
      operationalPrinciples: constitution.operationalPrinciples as string[],
      autonomyLimits: constitution.autonomyLimits,
      budgetConfig: constitution.budgetConfig,
      approvalCriteria: constitution.approvalCriteria as ApprovalCriterionProps[],
      namingConventions: constitution.namingConventions as string[],
      expansionRules: constitution.expansionRules as ExpansionRuleProps[],
      contextMinimizationPolicy: constitution.contextMinimizationPolicy,
      qualityRules: constitution.qualityRules as string[],
      deliveryRules: constitution.deliveryRules as string[],
      createdAt: constitution.createdAt,
      updatedAt: constitution.updatedAt,
    }
  }
}
