export type MaturityPhase =
  | 'seed'
  | 'formation'
  | 'structured'
  | 'operating'
  | 'scaling'
  | 'optimizing'

export type ApprovalOverride = 'all-founder' | 'structural-founder' | 'constitution-rules'

export interface PhaseCapabilities {
  phase: MaturityPhase
  canCreateDepartments: boolean
  canCreateTeams: boolean
  canCreateSpecialists: boolean
  canSplitMerge: boolean
  canCreateWorkflows: boolean
  canCreateContracts: boolean
  canToggleLiveMode: boolean
  canDelegateApprovals: boolean
  canAutoApprove: boolean
  approvalOverride: ApprovalOverride
}

export const PHASE_CAPABILITIES: Record<MaturityPhase, PhaseCapabilities> = {
  seed: {
    phase: 'seed',
    canCreateDepartments: true,
    canCreateTeams: false,
    canCreateSpecialists: false,
    canSplitMerge: false,
    canCreateWorkflows: false,
    canCreateContracts: false,
    canToggleLiveMode: false,
    canDelegateApprovals: false,
    canAutoApprove: false,
    approvalOverride: 'all-founder',
  },
  formation: {
    phase: 'formation',
    canCreateDepartments: true,
    canCreateTeams: true,
    canCreateSpecialists: true,
    canSplitMerge: false,
    canCreateWorkflows: true,
    canCreateContracts: false,
    canToggleLiveMode: false,
    canDelegateApprovals: false,
    canAutoApprove: false,
    approvalOverride: 'structural-founder',
  },
  structured: {
    phase: 'structured',
    canCreateDepartments: true,
    canCreateTeams: true,
    canCreateSpecialists: true,
    canSplitMerge: true,
    canCreateWorkflows: true,
    canCreateContracts: true,
    canToggleLiveMode: false,
    canDelegateApprovals: true,
    canAutoApprove: false,
    approvalOverride: 'constitution-rules',
  },
  operating: {
    phase: 'operating',
    canCreateDepartments: true,
    canCreateTeams: true,
    canCreateSpecialists: true,
    canSplitMerge: true,
    canCreateWorkflows: true,
    canCreateContracts: true,
    canToggleLiveMode: true,
    canDelegateApprovals: true,
    canAutoApprove: true,
    approvalOverride: 'constitution-rules',
  },
  scaling: {
    phase: 'scaling',
    canCreateDepartments: true,
    canCreateTeams: true,
    canCreateSpecialists: true,
    canSplitMerge: true,
    canCreateWorkflows: true,
    canCreateContracts: true,
    canToggleLiveMode: true,
    canDelegateApprovals: true,
    canAutoApprove: true,
    approvalOverride: 'constitution-rules',
  },
  optimizing: {
    phase: 'optimizing',
    canCreateDepartments: true,
    canCreateTeams: true,
    canCreateSpecialists: true,
    canSplitMerge: true,
    canCreateWorkflows: true,
    canCreateContracts: true,
    canToggleLiveMode: true,
    canDelegateApprovals: true,
    canAutoApprove: true,
    approvalOverride: 'constitution-rules',
  },
}

import type { ProposalType } from '../../proposals/domain/proposal'

/** Minimum phase required for each proposal type */
export const PHASE_GUARDS: Record<ProposalType, MaturityPhase> = {
  'create-department': 'seed',
  'create-team': 'formation',
  'create-specialist': 'formation',
  'split-team': 'structured',
  'merge-teams': 'structured',
  'retire-unit': 'formation',
  'revise-contract': 'structured',
  'revise-workflow': 'formation',
  'revise-policy': 'formation',
  'update-constitution': 'seed',
}

const PHASE_ORDER: readonly MaturityPhase[] = [
  'seed',
  'formation',
  'structured',
  'operating',
  'scaling',
  'optimizing',
]

export function phaseIndex(phase: MaturityPhase): number {
  return PHASE_ORDER.indexOf(phase)
}

export function isPhaseAllowed(currentPhase: MaturityPhase, proposalType: ProposalType): boolean {
  const minimumPhase = PHASE_GUARDS[proposalType]
  return phaseIndex(currentPhase) >= phaseIndex(minimumPhase)
}

export function getPhaseCapabilities(phase: MaturityPhase): PhaseCapabilities {
  return PHASE_CAPABILITIES[phase]
}
