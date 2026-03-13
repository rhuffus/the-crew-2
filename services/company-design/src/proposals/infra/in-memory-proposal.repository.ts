import { Injectable } from '@nestjs/common'
import type { ProposalRepository } from '../domain/proposal-repository'
import type { Proposal, ProposalStatus, ProposalType } from '../domain/proposal'

@Injectable()
export class InMemoryProposalRepository implements ProposalRepository {
  private readonly store = new Map<string, Proposal>()

  async findById(id: string): Promise<Proposal | null> {
    return this.store.get(id) ?? null
  }

  async findByProjectId(
    projectId: string,
    filters?: { status?: ProposalStatus; proposalType?: ProposalType },
  ): Promise<Proposal[]> {
    let results = [...this.store.values()].filter((p) => p.projectId === projectId)
    if (filters?.status) {
      results = results.filter((p) => p.status === filters.status)
    }
    if (filters?.proposalType) {
      results = results.filter((p) => p.proposalType === filters.proposalType)
    }
    return results
  }

  async save(proposal: Proposal): Promise<void> {
    this.store.set(proposal.id, proposal)
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id)
  }
}
