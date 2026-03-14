import { Module } from '@nestjs/common'
import { OperationsController } from './application/operations.controller'
import { OperationsService } from './application/operations.service'
import { PrismaWorkflowRunRepository } from './infra/prisma-workflow-run.repository'
import { PrismaStageExecutionRepository } from './infra/prisma-stage-execution.repository'
import { PrismaIncidentRepository } from './infra/prisma-incident.repository'
import { PrismaContractComplianceRepository } from './infra/prisma-contract-compliance.repository'
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
      useClass: PrismaWorkflowRunRepository,
    },
    {
      provide: STAGE_EXECUTION_REPOSITORY,
      useClass: PrismaStageExecutionRepository,
    },
    {
      provide: INCIDENT_REPOSITORY,
      useClass: PrismaIncidentRepository,
    },
    {
      provide: CONTRACT_COMPLIANCE_REPOSITORY,
      useClass: PrismaContractComplianceRepository,
    },
  ],
  exports: [OperationsService],
})
export class OperationsModule {}
