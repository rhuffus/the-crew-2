import type { ProposalDto } from '@the-crew/shared-types'
import type { Proposal } from '../domain/proposal'

export function toProposalDto(p: Proposal): ProposalDto {
  return {
    id: p.id,
    projectId: p.projectId,
    proposalType: p.proposalType,
    title: p.title,
    description: p.description,
    motivation: p.motivation,
    problemDetected: p.problemDetected,
    expectedBenefit: p.expectedBenefit,
    estimatedCost: p.estimatedCost,
    contextToAssign: p.contextToAssign,
    affectedContractIds: [...p.affectedContractIds],
    affectedWorkflowIds: [...p.affectedWorkflowIds],
    requiredApproval: p.requiredApproval as ProposalDto['requiredApproval'],
    status: p.status,
    proposedByAgentId: p.proposedByAgentId,
    reviewedByUserId: p.reviewedByUserId,
    approvedByUserId: p.approvedByUserId,
    rejectionReason: p.rejectionReason,
    implementedAt: p.implementedAt?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }
}
