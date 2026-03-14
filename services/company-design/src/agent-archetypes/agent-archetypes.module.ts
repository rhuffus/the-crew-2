import { Module } from '@nestjs/common'
import { AgentArchetypesController } from './agent-archetypes.controller'
import { AgentArchetypeService } from './application/agent-archetype.service'
import { PrismaAgentArchetypeRepository } from './infra/prisma-agent-archetype.repository'
import { AGENT_ARCHETYPE_REPOSITORY } from './domain/agent-archetype-repository'

@Module({
  controllers: [AgentArchetypesController],
  providers: [
    AgentArchetypeService,
    {
      provide: AGENT_ARCHETYPE_REPOSITORY,
      useClass: PrismaAgentArchetypeRepository,
    },
  ],
  exports: [AGENT_ARCHETYPE_REPOSITORY],
})
export class AgentArchetypesModule {}
