import { Module } from '@nestjs/common'
import { isPersistenceModeDrizzle } from '@the-crew/drizzle-db'
import { InMemoryProposalRepository } from './infra/in-memory-proposal.repository'
import { DrizzleProposalRepository } from './infra/drizzle-proposal.repository'
import { PROPOSAL_REPOSITORY } from './domain/proposal-repository'

@Module({
  providers: [
    {
      provide: PROPOSAL_REPOSITORY,
      useClass: isPersistenceModeDrizzle()
        ? DrizzleProposalRepository
        : InMemoryProposalRepository,
    },
  ],
  exports: [PROPOSAL_REPOSITORY],
})
export class ProposalsModule {}
