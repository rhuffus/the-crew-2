import type { ProposalType } from '../../proposals/domain/proposal'

export type GrowthSignalType =
  | 'workload-overflow'
  | 'capability-gap'
  | 'coordination-bottleneck'
  | 'scope-creep'
  | 'repeated-escalation'
  | 'user-initiated'
  | 'objective-unserved'
  | 'workflow-unowned'

export interface GrowthSignalProps {
  id: string
  projectId: string
  signalType: GrowthSignalType
  description: string
  sourceAgentId: string | null
  sourceUoId: string | null
  evidence: string[]
  suggestedAction: ProposalType | null
  detectedAt: Date
  acknowledged: boolean
  resolvedByProposalId: string | null
}

/** Advisory mapping from signal type to suggested proposal type. */
export const SIGNAL_TO_PROPOSAL: Record<GrowthSignalType, ProposalType[]> = {
  'workload-overflow': ['create-specialist', 'create-team'],
  'capability-gap': ['create-specialist'],
  'coordination-bottleneck': ['create-team', 'split-team'],
  'scope-creep': ['create-department', 'split-team'],
  'repeated-escalation': ['revise-workflow', 'create-specialist'],
  'user-initiated': [], // user decides
  'objective-unserved': ['create-department', 'create-team'],
  'workflow-unowned': ['create-specialist'],
}

export function createGrowthSignal(props: {
  id: string
  projectId: string
  signalType: GrowthSignalType
  description: string
  sourceAgentId?: string | null
  sourceUoId?: string | null
  evidence?: string[]
}): GrowthSignalProps {
  const suggestedActions = SIGNAL_TO_PROPOSAL[props.signalType]
  return {
    id: props.id,
    projectId: props.projectId,
    signalType: props.signalType,
    description: props.description,
    sourceAgentId: props.sourceAgentId ?? null,
    sourceUoId: props.sourceUoId ?? null,
    evidence: props.evidence ?? [],
    suggestedAction: suggestedActions[0] ?? null,
    detectedAt: new Date(),
    acknowledged: false,
    resolvedByProposalId: null,
  }
}
