import { Module } from '@nestjs/common'
import { OperationsController } from './application/operations.controller'
import { OperationsService } from './application/operations.service'
import { InMemoryWorkflowRunRepository } from './infrastructure/in-memory-workflow-run.repository'
import { InMemoryStageExecutionRepository } from './infrastructure/in-memory-stage-execution.repository'
import { InMemoryIncidentRepository } from './infrastructure/in-memory-incident.repository'
import { InMemoryContractComplianceRepository } from './infrastructure/in-memory-contract-compliance.repository'
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
    { provide: WORKFLOW_RUN_REPOSITORY, useClass: InMemoryWorkflowRunRepository },
    { provide: STAGE_EXECUTION_REPOSITORY, useClass: InMemoryStageExecutionRepository },
    { provide: INCIDENT_REPOSITORY, useClass: InMemoryIncidentRepository },
    { provide: CONTRACT_COMPLIANCE_REPOSITORY, useClass: InMemoryContractComplianceRepository },
  ],
  exports: [OperationsService],
})
export class OperationsModule {}
