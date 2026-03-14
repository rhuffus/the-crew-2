import { Injectable } from '@nestjs/common'
import { CompanyDesignPrismaService } from '../../prisma/company-design-prisma.service'
import type { CompanyConstitutionRepository } from '../domain/company-constitution-repository'
import {
  CompanyConstitution,
  type AutonomyLimitsProps,
  type BudgetConfigProps,
  type ApprovalCriterionProps,
  type ExpansionRuleProps,
} from '../domain/company-constitution'

@Injectable()
export class PrismaCompanyConstitutionRepository implements CompanyConstitutionRepository {
  constructor(private readonly prisma: CompanyDesignPrismaService) {}

  async findByProjectId(projectId: string): Promise<CompanyConstitution | null> {
    const row = await this.prisma.companyConstitution.findUnique({ where: { projectId } })
    return row ? this.toDomain(row) : null
  }

  async save(constitution: CompanyConstitution): Promise<void> {
    await this.prisma.companyConstitution.upsert({
      where: { projectId: constitution.projectId },
      create: {
        projectId: constitution.projectId,
        operationalPrinciples: constitution.operationalPrinciples as string[],
        autonomyLimits: constitution.autonomyLimits as object,
        budgetConfig: constitution.budgetConfig as object,
        approvalCriteria: constitution.approvalCriteria as object[],
        namingConventions: constitution.namingConventions as string[],
        expansionRules: constitution.expansionRules as object[],
        contextMinimizationPolicy: constitution.contextMinimizationPolicy,
        qualityRules: constitution.qualityRules as string[],
        deliveryRules: constitution.deliveryRules as string[],
        createdAt: constitution.createdAt,
        updatedAt: constitution.updatedAt,
      },
      update: {
        operationalPrinciples: constitution.operationalPrinciples as string[],
        autonomyLimits: constitution.autonomyLimits as object,
        budgetConfig: constitution.budgetConfig as object,
        approvalCriteria: constitution.approvalCriteria as object[],
        namingConventions: constitution.namingConventions as string[],
        expansionRules: constitution.expansionRules as object[],
        contextMinimizationPolicy: constitution.contextMinimizationPolicy,
        qualityRules: constitution.qualityRules as string[],
        deliveryRules: constitution.deliveryRules as string[],
        updatedAt: constitution.updatedAt,
      },
    })
  }

  private toDomain(row: {
    projectId: string
    operationalPrinciples: string[]
    autonomyLimits: unknown
    budgetConfig: unknown
    approvalCriteria: unknown
    namingConventions: string[]
    expansionRules: unknown
    contextMinimizationPolicy: string
    qualityRules: string[]
    deliveryRules: string[]
    createdAt: Date
    updatedAt: Date
  }): CompanyConstitution {
    return CompanyConstitution.reconstitute(row.projectId, {
      operationalPrinciples: [...row.operationalPrinciples],
      autonomyLimits: row.autonomyLimits as AutonomyLimitsProps,
      budgetConfig: row.budgetConfig as BudgetConfigProps,
      approvalCriteria: row.approvalCriteria as ApprovalCriterionProps[],
      namingConventions: [...row.namingConventions],
      expansionRules: row.expansionRules as ExpansionRuleProps[],
      contextMinimizationPolicy: row.contextMinimizationPolicy,
      qualityRules: [...row.qualityRules],
      deliveryRules: [...row.deliveryRules],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }
}
