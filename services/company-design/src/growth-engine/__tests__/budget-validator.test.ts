import { describe, it, expect } from 'vitest'
import { validateBudget, type BudgetContext } from '../domain/budget-validator'

describe('validateBudget', () => {
  it('returns empty impact when no global budget', () => {
    const ctx: BudgetContext = {
      budgetConfig: {
        globalBudget: null,
        perUoBudget: null,
        perAgentBudget: null,
        alertThresholds: [50, 80],
      },
      currentGlobalUsage: 40,
      currentUoUsage: 0,
      estimatedMonthlyCost: 100,
    }
    const result = validateBudget(ctx)
    expect(result.exceedsBudget).toBe(false)
    expect(result.exceedsAlertThreshold).toBe(false)
  })

  it('returns empty impact when estimated cost is null', () => {
    const ctx: BudgetContext = {
      budgetConfig: {
        globalBudget: 1000,
        perUoBudget: null,
        perAgentBudget: null,
        alertThresholds: [50, 80],
      },
      currentGlobalUsage: 40,
      currentUoUsage: 0,
      estimatedMonthlyCost: null,
    }
    const result = validateBudget(ctx)
    expect(result.exceedsBudget).toBe(false)
  })

  it('detects budget exceeded', () => {
    const ctx: BudgetContext = {
      budgetConfig: {
        globalBudget: 1000,
        perUoBudget: null,
        perAgentBudget: null,
        alertThresholds: [50, 80, 95],
      },
      currentGlobalUsage: 90,
      currentUoUsage: 0,
      estimatedMonthlyCost: 200, // 20% more -> 110%
    }
    const result = validateBudget(ctx)
    expect(result.exceedsBudget).toBe(true)
    expect(result.projectedBudgetUsage).toBe(110)
  })

  it('detects alert threshold crossed', () => {
    const ctx: BudgetContext = {
      budgetConfig: {
        globalBudget: 1000,
        perUoBudget: null,
        perAgentBudget: null,
        alertThresholds: [50, 80],
      },
      currentGlobalUsage: 70,
      currentUoUsage: 0,
      estimatedMonthlyCost: 150, // 15% more -> 85%
    }
    const result = validateBudget(ctx)
    expect(result.exceedsBudget).toBe(false)
    expect(result.exceedsAlertThreshold).toBe(true)
    expect(result.thresholdExceeded).toBe(80)
  })

  it('does not flag threshold when already above', () => {
    const ctx: BudgetContext = {
      budgetConfig: {
        globalBudget: 1000,
        perUoBudget: null,
        perAgentBudget: null,
        alertThresholds: [50, 80],
      },
      currentGlobalUsage: 85,
      currentUoUsage: 0,
      estimatedMonthlyCost: 10, // already above 80
    }
    const result = validateBudget(ctx)
    // Already above 80% before and after, so no NEW threshold crossing
    expect(result.exceedsAlertThreshold).toBe(false)
  })
})
