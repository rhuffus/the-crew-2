import { Module } from '@nestjs/common'
import { isPersistenceModeDrizzle } from '@the-crew/drizzle-db'
import { AgentAssignmentsController } from './agent-assignments.controller'
import { AgentAssignmentService } from './application/agent-assignment.service'
import { InMemoryAgentAssignmentRepository } from './infra/in-memory-agent-assignment.repository'
import { DrizzleAgentAssignmentRepository } from './infra/drizzle-agent-assignment.repository'
import { AGENT_ASSIGNMENT_REPOSITORY } from './domain/agent-assignment-repository'

@Module({
  controllers: [AgentAssignmentsController],
  providers: [
    AgentAssignmentService,
    {
      provide: AGENT_ASSIGNMENT_REPOSITORY,
      useClass: isPersistenceModeDrizzle()
        ? DrizzleAgentAssignmentRepository
        : InMemoryAgentAssignmentRepository,
    },
  ],
  exports: [AGENT_ASSIGNMENT_REPOSITORY],
})
export class AgentAssignmentsModule {}
