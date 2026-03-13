import type { Proposal } from '../../proposals/domain/proposal'
import type {
  CompanyConstitution,
  ApproverLevel,
} from '../../constitution/domain/company-constitution'
import type { OrganizationalUnit } from '../../organizational-units/domain/organizational-unit'
import type { GrowthEvaluationResult, GrowthViolation, GrowthWarning } from './growth-evaluation'
import { createEmptyBudgetImpact } from './growth-evaluation'
import { isPhaseAllowed, type MaturityPhase } from './phase-capabilities'
import { computeApprovalRoute, type ApprovalRoute } from './approval-router'
import { validateBudget, type BudgetContext } from './budget-validator'

export interface GrowthEngineContext {
  constitution: CompanyConstitution
  phase: MaturityPhase
  units: OrganizationalUnit[]
  /** Budget usage: 0-100 percentage. Null if no budget tracking. */
  currentBudgetUsage: number | null
}

/**
 * Domain service: evaluates a proposal against constitution rules,
 * phase guards, structural limits, and budget constraints.
 */
export function evaluateProposal(
  proposal: Proposal,
  context: GrowthEngineContext,
): GrowthEvaluationResult {
  const violations: GrowthViolation[] = []
  const warnings: GrowthWarning[] = []
  const { constitution, phase, units } = context

  // Rule 1: Phase guard
  if (!isPhaseAllowed(phase, proposal.proposalType)) {
    violations.push({
      rule: 'phase-guard',
      description: `Action '${proposal.proposalType}' is not allowed in '${phase}' phase`,
      blocking: true,
    })
  }

  const limits = constitution.autonomyLimits

  // Rule 2: Depth limit (for structural create proposals)
  if (
    ['create-department', 'create-team'].includes(proposal.proposalType)
  ) {
    const maxDepth = computeMaxDepth(units)
    if (maxDepth >= limits.maxDepth) {
      violations.push({
        rule: 'depth-limit',
        description: `Adding this unit would exceed max depth of ${limits.maxDepth}`,
        blocking: true,
      })
    }
  }

  // Rule 3: Fan-out limit
  if (
    ['create-department', 'create-team', 'create-specialist'].includes(proposal.proposalType)
  ) {
    // We check the generic fan-out limit
    const parentCounts = new Map<string, number>()
    for (const u of units) {
      if (u.status === 'retired' || !u.parentUoId) continue
      parentCounts.set(u.parentUoId, (parentCounts.get(u.parentUoId) ?? 0) + 1)
    }
    const maxFanOut = parentCounts.size > 0 ? Math.max(...parentCounts.values()) : 0
    if (maxFanOut >= limits.maxFanOut) {
      violations.push({
        rule: 'fanout-limit',
        description: `A parent UO already has ${maxFanOut} children (limit: ${limits.maxFanOut})`,
        blocking: true,
      })
    }
  }

  // Rule 5: Expansion rules match
  const expansionRules = constitution.expansionRules
  if (['create-department', 'create-team', 'create-specialist'].includes(proposal.proposalType)) {
    const targetType = proposal.proposalType.replace('create-', '') as
      | 'department'
      | 'team'
      | 'specialist'
    const matchingRule = expansionRules.find((r) => r.targetType === targetType)
    if (!matchingRule) {
      violations.push({
        rule: 'expansion-rules',
        description: `No expansion rule defined for target type '${targetType}'`,
        blocking: true,
      })
    }
  }

  // Rule 8: Duplicate name check
  if (['create-department', 'create-team'].includes(proposal.proposalType)) {
    const duplicate = units.find(
      (u) =>
        u.name.toLowerCase() === proposal.title.toLowerCase() &&
        u.projectId === proposal.projectId &&
        u.status !== 'retired',
    )
    if (duplicate) {
      violations.push({
        rule: 'duplicate-check',
        description: `A unit named '${proposal.title}' already exists`,
        blocking: true,
      })
    }
  }

  // Rule 10: Justification check
  const criterion = constitution.approvalCriteria.find((c) => c.scope === proposal.proposalType)
  if (criterion?.requiresJustification) {
    if (!proposal.motivation.trim() || !proposal.problemDetected.trim()) {
      violations.push({
        rule: 'justification-check',
        description: 'Proposal requires motivation and problemDetected fields',
        blocking: true,
      })
    }
  }

  // Rule 9: Ratio check (warning only)
  if (proposal.proposalType === 'create-specialist') {
    const coordinatorCount = units.filter(
      (u) => u.coordinatorAgentId && u.status !== 'retired',
    ).length
    const agentBearingUnits = units.filter(
      (u) => u.uoType !== 'company' && u.status !== 'retired',
    )
    const totalAgents = agentBearingUnits.length
    if (totalAgents > 0) {
      const ratio = coordinatorCount / (totalAgents + 1)
      if (ratio < limits.coordinatorToSpecialistRatio * 0.5) {
        warnings.push({
          rule: 'coordinator-ratio',
          description: `Adding a specialist may worsen coordinator-to-specialist ratio`,
          advisory: true,
        })
      }
    }
  }

  // Budget validation (Rule 7)
  let budgetImpact = createEmptyBudgetImpact()
  const budgetConfig = constitution.budgetConfig
  if (budgetConfig.globalBudget !== null) {
    const budgetCtx: BudgetContext = {
      budgetConfig,
      currentGlobalUsage: context.currentBudgetUsage ?? 0,
      currentUoUsage: 0,
      estimatedMonthlyCost: proposal.estimatedCost
        ? parseFloat(proposal.estimatedCost) || null
        : null,
    }
    budgetImpact = validateBudget(budgetCtx)
    if (budgetImpact.exceedsBudget) {
      const matchingExpRule = expansionRules.find(
        (r) => r.targetType === proposal.proposalType.replace('create-', ''),
      )
      if (matchingExpRule?.requiresBudget) {
        violations.push({
          rule: 'budget-check',
          description: `Proposal would exceed global budget (projected: ${budgetImpact.projectedBudgetUsage.toFixed(1)}%)`,
          blocking: true,
        })
      }
    }
    if (budgetImpact.exceedsAlertThreshold) {
      warnings.push({
        rule: 'budget-alert',
        description: `Budget usage would cross ${budgetImpact.thresholdExceeded}% threshold`,
        advisory: true,
      })
    }
  }

  // Compute approval route
  const route: ApprovalRoute = computeApprovalRoute({
    proposalId: proposal.id,
    proposalType: proposal.proposalType,
    phase,
    approvalCriteria: constitution.approvalCriteria,
  })

  const valid = !violations.some((v) => v.blocking)

  return {
    proposalId: proposal.id,
    valid,
    violations,
    warnings,
    budgetImpact,
    requiredApprover: route.effectiveApprover as ApproverLevel,
    autoApprovable: route.autoApprovable,
  }
}

function computeMaxDepth(units: OrganizationalUnit[]): number {
  const parentMap = new Map<string | null, string[]>()
  for (const u of units) {
    if (u.status === 'retired') continue
    const key = u.parentUoId
    if (!parentMap.has(key)) parentMap.set(key, [])
    parentMap.get(key)!.push(u.id)
  }

  let maxDepth = 0
  function walk(parentId: string | null, depth: number): void {
    const children = parentMap.get(parentId) ?? []
    if (depth > maxDepth) maxDepth = depth
    for (const childId of children) {
      walk(childId, depth + 1)
    }
  }
  walk(null, 0)
  return maxDepth
}
