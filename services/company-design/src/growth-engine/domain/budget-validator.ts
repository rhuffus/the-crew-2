import type { BudgetConfigProps } from '../../constitution/domain/company-constitution'
import type { BudgetImpactAssessment } from './growth-evaluation'
import { createEmptyBudgetImpact } from './growth-evaluation'

export interface BudgetContext {
  budgetConfig: BudgetConfigProps
  currentGlobalUsage: number // 0-100 percentage
  currentUoUsage: number // 0-100 percentage
  estimatedMonthlyCost: number | null
}

export function validateBudget(context: BudgetContext): BudgetImpactAssessment {
  const { budgetConfig, currentGlobalUsage, estimatedMonthlyCost } = context

  if (budgetConfig.globalBudget === null || estimatedMonthlyCost === null) {
    return createEmptyBudgetImpact()
  }

  const costPercentage = (estimatedMonthlyCost / budgetConfig.globalBudget) * 100
  const projectedUsage = currentGlobalUsage + costPercentage

  const exceedsBudget = projectedUsage > 100
  const alertThresholds = budgetConfig.alertThresholds ?? []
  const exceededThreshold = alertThresholds.find((t) => projectedUsage > t && currentGlobalUsage <= t)

  return {
    estimatedMonthlyCost,
    currentBudgetUsage: currentGlobalUsage,
    projectedBudgetUsage: Math.min(projectedUsage, 999),
    exceedsBudget,
    exceedsAlertThreshold: exceededThreshold !== undefined,
    thresholdExceeded: exceededThreshold ?? null,
  }
}
