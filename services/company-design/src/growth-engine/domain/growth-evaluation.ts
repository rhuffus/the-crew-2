import type { ApproverLevel } from '../../constitution/domain/company-constitution'

export interface GrowthViolation {
  rule: string
  description: string
  blocking: boolean
}

export interface GrowthWarning {
  rule: string
  description: string
  advisory: boolean
}

export interface BudgetImpactAssessment {
  estimatedMonthlyCost: number | null
  currentBudgetUsage: number
  projectedBudgetUsage: number
  exceedsBudget: boolean
  exceedsAlertThreshold: boolean
  thresholdExceeded: number | null
}

export interface GrowthEvaluationResult {
  proposalId: string
  valid: boolean
  violations: GrowthViolation[]
  warnings: GrowthWarning[]
  budgetImpact: BudgetImpactAssessment
  requiredApprover: ApproverLevel
  autoApprovable: boolean
}

export function createEmptyBudgetImpact(): BudgetImpactAssessment {
  return {
    estimatedMonthlyCost: null,
    currentBudgetUsage: 0,
    projectedBudgetUsage: 0,
    exceedsBudget: false,
    exceedsAlertThreshold: false,
    thresholdExceeded: null,
  }
}
