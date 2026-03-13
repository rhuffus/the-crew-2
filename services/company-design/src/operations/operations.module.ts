import { Module } from '@nestjs/common'
import { isPersistenceModeDrizzle } from '@the-crew/drizzle-db'
import { OperationsController } from './application/operations.controller'
import { OperationsService } from './application/operations.service'
import { InMemoryWorkflowRunRepository } from './infra/in-memory-workflow-run.repository'
import { InMemoryStageExecutionRepository } from './infra/in-memory-stage-execution.repository'
import { InMemoryIncidentRepository } from './infra/in-memory-incident.repository'
import { InMemoryContractComplianceRepository } from './infra/in-memory-contract-compliance.repository'
import { DrizzleWorkflowRunRepository } from './infra/drizzle-workflow-run.repository'
import { DrizzleStageExecutionRepository } from './infra/drizzle-stage-execution.repository'
import { DrizzleIncidentRepository } from './infra/drizzle-incident.repository'
import { DrizzleContractComplianceRepository } from './infra/drizzle-contract-compliance.repository'
import {
  WORKFLOW_RUN_REPOSITORY,
  STAGE_EXECUTION_REPOSITORY,
  INCIDENT_REPOSITORY,
  CONTRACT_COMPLIANCE_REPOSITORY,
} from './domain/operations-repository'
import { ReleasesModule } from '../releases/releases.module'

@Module({
  imports: [ReleasesModule],
  controllers: [OperationsController],
  providers: [
    OperationsService,
    {
      provide: WORKFLOW_RUN_REPOSITORY,
      useClass: isPersistenceModeDrizzle()
        ? DrizzleWorkflowRunRepository
        : InMemoryWorkflowRunRepository,
    },
    {
      provide: STAGE_EXECUTION_REPOSITORY,
      useClass: isPersistenceModeDrizzle()
        ? DrizzleStageExecutionRepository
        : InMemoryStageExecutionRepository,
    },
    {
      provide: INCIDENT_REPOSITORY,
      useClass: isPersistenceModeDrizzle()
        ? DrizzleIncidentRepository
        : InMemoryIncidentRepository,
    },
    {
      provide: CONTRACT_COMPLIANCE_REPOSITORY,
      useClass: isPersistenceModeDrizzle()
        ? DrizzleContractComplianceRepository
        : InMemoryContractComplianceRepository,
    },
  ],
  exports: [OperationsService],
})
export class OperationsModule {}
