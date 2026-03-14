import { Module } from '@nestjs/common'
import { PrismaProposalRepository } from './infra/prisma-proposal.repository'
import { PROPOSAL_REPOSITORY } from './domain/proposal-repository'

@Module({
  providers: [
    {
      provide: PROPOSAL_REPOSITORY,
      useClass: PrismaProposalRepository,
    },
  ],
  exports: [PROPOSAL_REPOSITORY],
})
export class ProposalsModule {}
