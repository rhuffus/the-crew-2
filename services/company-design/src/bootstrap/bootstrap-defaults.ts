/**
 * Default constants for CEO-first bootstrap.
 * Source: docs/45-live-company-ceo-first-bootstrap-spec.md §2.2
 */

import type { FounderPreferencesProps, AiBudgetProps } from '../project-seed/domain/project-seed'
import type {
  AutonomyLimitsProps,
  BudgetConfigProps,
  ApprovalCriterionProps,
  ExpansionRuleProps,
} from '../constitution/domain/company-constitution'

export const DEFAULT_PREFERENCES: FounderPreferencesProps = {
  approvalLevel: 'structural-only',
  communicationStyle: 'detailed',
  growthPace: 'moderate',
}

export const DEFAULT_AI_BUDGET: AiBudgetProps = {
  maxMonthlyTokens: null,
  maxConcurrentAgents: 5,
  costAlertThreshold: null,
}

export const DEFAULT_AUTONOMY_LIMITS: AutonomyLimitsProps = {
  maxDepth: 4,
  maxFanOut: 10,
  maxAgentsPerTeam: 8,
  coordinatorToSpecialistRatio: 0.25,
}

export const DEFAULT_BUDGET_CONFIG: BudgetConfigProps = {
  globalBudget: null,
  perUoBudget: null,
  perAgentBudget: null,
  alertThresholds: [50, 80, 95],
}

export const DEFAULT_APPROVAL_CRITERIA: ApprovalCriterionProps[] = [
  { scope: 'create-department', requiredApprover: 'founder', requiresJustification: true },
  { scope: 'create-team', requiredApprover: 'founder', requiresJustification: true },
  { scope: 'create-specialist', requiredApprover: 'ceo', requiresJustification: true },
  { scope: 'retire-unit', requiredApprover: 'founder', requiresJustification: true },
  { scope: 'revise-contract', requiredApprover: 'ceo', requiresJustification: false },
  { scope: 'revise-workflow', requiredApprover: 'ceo', requiresJustification: false },
  { scope: 'update-constitution', requiredApprover: 'founder', requiresJustification: true },
]

export const DEFAULT_EXPANSION_RULES: ExpansionRuleProps[] = [
  {
    targetType: 'department',
    conditions: ['Sustained strategic function identified', 'Clear mandate and owner'],
    requiresBudget: false,
    requiresOwner: true,
  },
  {
    targetType: 'team',
    conditions: ['Department has differentiated recurring work', 'Team lead identified'],
    requiresBudget: false,
    requiresOwner: true,
  },
  {
    targetType: 'specialist',
    conditions: ['Repeatable specialized function', 'Active workflow requires it'],
    requiresBudget: false,
    requiresOwner: true,
  },
]
