import { Module } from '@nestjs/common'
import { isPersistenceModeDrizzle } from '@the-crew/drizzle-db'
import { InMemoryLcpAgentRepository } from './infra/in-memory-lcp-agent.repository'
import { DrizzleLcpAgentRepository } from './infra/drizzle-lcp-agent.repository'
import { LCP_AGENT_REPOSITORY } from './domain/lcp-agent-repository'
import { LcpAgentsController } from './application/lcp-agents.controller'

@Module({
  controllers: [LcpAgentsController],
  providers: [
    {
      provide: LCP_AGENT_REPOSITORY,
      useClass: isPersistenceModeDrizzle()
        ? DrizzleLcpAgentRepository
        : InMemoryLcpAgentRepository,
    },
  ],
  exports: [LCP_AGENT_REPOSITORY],
})
export class LcpAgentsModule {}
