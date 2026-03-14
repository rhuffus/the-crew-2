import { Module } from '@nestjs/common'
import { PrismaLcpAgentRepository } from './infra/prisma-lcp-agent.repository'
import { LCP_AGENT_REPOSITORY } from './domain/lcp-agent-repository'
import { LcpAgentsController } from './application/lcp-agents.controller'

@Module({
  controllers: [LcpAgentsController],
  providers: [
    {
      provide: LCP_AGENT_REPOSITORY,
      useClass: PrismaLcpAgentRepository,
    },
  ],
  exports: [LCP_AGENT_REPOSITORY],
})
export class LcpAgentsModule {}
