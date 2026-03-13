import type {
  ApproverLevel,
  ApprovalCriterionProps,
} from '../../constitution/domain/company-constitution'
import type { ProposalType } from '../../proposals/domain/proposal'
import { STRUCTURAL_PROPOSAL_TYPES } from '../../proposals/domain/proposal'
import type { MaturityPhase, ApprovalOverride } from './phase-capabilities'
import { PHASE_CAPABILITIES } from './phase-capabilities'

export interface ApprovalRoute {
  proposalId: string
  requiredApprover: ApproverLevel
  effectiveApprover: ApproverLevel
  phaseOverrideApplied: boolean
  autoApprovable: boolean
}

/**
 * Maps ApprovalScope strings to match against ProposalType.
 * ApprovalScope and ProposalType overlap for structural + non-structural types.
 * 'revise-policy' proposals use 'revise-contract' scope as fallback if no direct match.
 */
function findCriterion(
  criteria: readonly ApprovalCriterionProps[],
  proposalType: ProposalType,
): ApprovalCriterionProps | undefined {
  return criteria.find((c) => c.scope === proposalType)
}

function applyPhaseOverride(
  approvalOverride: ApprovalOverride,
  proposalType: ProposalType,
  constitutionApprover: ApproverLevel,
): { effectiveApprover: ApproverLevel; overrideApplied: boolean } {
  switch (approvalOverride) {
    case 'all-founder':
      return {
        effectiveApprover: 'founder',
        overrideApplied: constitutionApprover !== 'founder',
      }
    case 'structural-founder': {
      const isStructural = STRUCTURAL_PROPOSAL_TYPES.includes(proposalType)
      if (isStructural) {
        return {
          effectiveApprover: 'founder',
          overrideApplied: constitutionApprover !== 'founder',
        }
      }
      return { effectiveApprover: constitutionApprover, overrideApplied: false }
    }
    case 'constitution-rules':
      return { effectiveApprover: constitutionApprover, overrideApplied: false }
  }
}

export function computeApprovalRoute(params: {
  proposalId: string
  proposalType: ProposalType
  phase: MaturityPhase
  approvalCriteria: readonly ApprovalCriterionProps[]
}): ApprovalRoute {
  const { proposalId, proposalType, phase, approvalCriteria } = params

  const criterion = findCriterion(approvalCriteria, proposalType)
  const constitutionApprover: ApproverLevel = criterion?.requiredApprover ?? 'founder'

  const capabilities = PHASE_CAPABILITIES[phase]
  const { effectiveApprover, overrideApplied } = applyPhaseOverride(
    capabilities.approvalOverride,
    proposalType,
    constitutionApprover,
  )

  const autoApprovable = effectiveApprover === 'auto' && capabilities.canAutoApprove

  return {
    proposalId,
    requiredApprover: constitutionApprover,
    effectiveApprover,
    phaseOverrideApplied: overrideApplied,
    autoApprovable,
  }
}
