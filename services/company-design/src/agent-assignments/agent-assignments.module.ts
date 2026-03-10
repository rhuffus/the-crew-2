import { Module } from '@nestjs/common'
import { AgentAssignmentsController } from './agent-assignments.controller'
import { AgentAssignmentService } from './application/agent-assignment.service'
import { InMemoryAgentAssignmentRepository } from './infra/in-memory-agent-assignment.repository'
import { AGENT_ASSIGNMENT_REPOSITORY } from './domain/agent-assignment-repository'

@Module({
  controllers: [AgentAssignmentsController],
  providers: [
    AgentAssignmentService,
    { provide: AGENT_ASSIGNMENT_REPOSITORY, useClass: InMemoryAgentAssignmentRepository },
  ],
  exports: [AGENT_ASSIGNMENT_REPOSITORY],
})
export class AgentAssignmentsModule {}
