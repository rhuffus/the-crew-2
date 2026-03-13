import type { Repository } from '@the-crew/domain-core'
import type { Proposal, ProposalStatus, ProposalType } from './proposal'

export interface ProposalRepository extends Repository<Proposal, string> {
  findByProjectId(
    projectId: string,
    filters?: { status?: ProposalStatus; proposalType?: ProposalType },
  ): Promise<Proposal[]>
}

export const PROPOSAL_REPOSITORY = Symbol('PROPOSAL_REPOSITORY')
