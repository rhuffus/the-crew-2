import { Module } from '@nestjs/common'
import { WorkflowsController } from './workflows.controller'
import { WorkflowService } from './application/workflow.service'
import { PrismaWorkflowRepository } from './infra/prisma-workflow.repository'
import { WORKFLOW_REPOSITORY } from './domain/workflow-repository'

@Module({
  controllers: [WorkflowsController],
  providers: [
    WorkflowService,
    {
      provide: WORKFLOW_REPOSITORY,
      useClass: PrismaWorkflowRepository,
    },
  ],
  exports: [WORKFLOW_REPOSITORY],
})
export class WorkflowsModule {}
