import type { CompanyConstitutionDto } from '@the-crew/shared-types'
import type { CompanyConstitution } from '../domain/company-constitution'

export class CompanyConstitutionMapper {
  static toDto(constitution: CompanyConstitution): CompanyConstitutionDto {
    return {
      projectId: constitution.projectId,
      operationalPrinciples: [...constitution.operationalPrinciples],
      autonomyLimits: { ...constitution.autonomyLimits },
      budgetConfig: {
        ...constitution.budgetConfig,
        alertThresholds: [...constitution.budgetConfig.alertThresholds],
      },
      approvalCriteria: constitution.approvalCriteria.map((c) => ({ ...c })),
      namingConventions: [...constitution.namingConventions],
      expansionRules: constitution.expansionRules.map((r) => ({
        targetType: r.targetType,
        conditions: [...r.conditions],
        requiresBudget: r.requiresBudget,
        requiresOwner: r.requiresOwner,
      })),
      contextMinimizationPolicy: constitution.contextMinimizationPolicy,
      qualityRules: [...constitution.qualityRules],
      deliveryRules: [...constitution.deliveryRules],
      createdAt: constitution.createdAt.toISOString(),
      updatedAt: constitution.updatedAt.toISOString(),
    }
  }
}
