import { Module } from '@nestjs/common'
import { isPersistenceModeDrizzle } from '@the-crew/drizzle-db'
import { AgentArchetypesController } from './agent-archetypes.controller'
import { AgentArchetypeService } from './application/agent-archetype.service'
import { InMemoryAgentArchetypeRepository } from './infra/in-memory-agent-archetype.repository'
import { DrizzleAgentArchetypeRepository } from './infra/drizzle-agent-archetype.repository'
import { AGENT_ARCHETYPE_REPOSITORY } from './domain/agent-archetype-repository'

@Module({
  controllers: [AgentArchetypesController],
  providers: [
    AgentArchetypeService,
    {
      provide: AGENT_ARCHETYPE_REPOSITORY,
      useClass: isPersistenceModeDrizzle()
        ? DrizzleAgentArchetypeRepository
        : InMemoryAgentArchetypeRepository,
    },
  ],
  exports: [AGENT_ARCHETYPE_REPOSITORY],
})
export class AgentArchetypesModule {}
