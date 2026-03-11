import { Controller, Get, Post, Patch, Param, Query, Body, HttpCode } from '@nestjs/common'
import type {
  CreateWorkflowRunDto,
  UpdateWorkflowRunDto,
  CreateIncidentDto,
  UpdateIncidentDto,
  CreateContractComplianceDto,
  UpdateContractComplianceDto,
  ScopeType,
  StageExecutionStatus,
} from '@the-crew/shared-types'
import { OperationsService } from './operations.service'

@Controller('projects/:projectId/operations')
export class OperationsController {
  constructor(private readonly operationsService: OperationsService) {}

  // ── Aggregated Status ────────────────────────────────────────────────

  @Get('status')
  getStatus(
    @Param('projectId') projectId: string,
    @Query('scopeType') scopeType: ScopeType,
    @Query('entityId') entityId?: string,
  ) {
    return this.operationsService.getOperationsStatus(projectId, scopeType || 'company', entityId)
  }

  // ── Workflow Runs ────────────────────────────────────────────────────

  @Get('runs')
  listRuns(
    @Param('projectId') projectId: string,
    @Query('workflowId') workflowId?: string,
  ) {
    return this.operationsService.listRuns(projectId, workflowId)
  }

  @Post('runs')
  @HttpCode(201)
  createRun(
    @Param('projectId') projectId: string,
    @Body() dto: CreateWorkflowRunDto,
  ) {
    return this.operationsService.createRun(projectId, dto)
  }

  @Get('runs/:runId')
  getRun(@Param('runId') runId: string) {
    return this.operationsService.getRun(runId)
  }

  @Patch('runs/:runId')
  updateRun(
    @Param('runId') runId: string,
    @Body() dto: UpdateWorkflowRunDto,
  ) {
    return this.operationsService.updateRun(runId, dto)
  }

  @Get('runs/:runId/stages')
  listStageExecutions(@Param('runId') runId: string) {
    return this.operationsService.listStageExecutions(runId)
  }

  @Post('runs/:runId/stages/:stageIndex/advance')
  @HttpCode(200)
  advanceStage(
    @Param('runId') runId: string,
    @Param('stageIndex') stageIndex: string,
    @Body() body: { status: StageExecutionStatus; blockReason?: string | null },
  ) {
    return this.operationsService.advanceStage(runId, parseInt(stageIndex, 10), body.status, body.blockReason)
  }

  // ── Incidents ────────────────────────────────────────────────────────

  @Get('incidents')
  listIncidents(
    @Param('projectId') projectId: string,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
  ) {
    return this.operationsService.listIncidents(projectId, entityType, entityId)
  }

  @Post('incidents')
  @HttpCode(201)
  createIncident(
    @Param('projectId') projectId: string,
    @Body() dto: CreateIncidentDto,
  ) {
    return this.operationsService.createIncident(projectId, dto)
  }

  @Patch('incidents/:incidentId')
  updateIncident(
    @Param('incidentId') incidentId: string,
    @Body() dto: UpdateIncidentDto,
  ) {
    return this.operationsService.updateIncident(incidentId, dto)
  }

  @Post('incidents/:incidentId/resolve')
  @HttpCode(200)
  resolveIncident(@Param('incidentId') incidentId: string) {
    return this.operationsService.resolveIncident(incidentId)
  }

  // ── Contract Compliance ──────────────────────────────────────────────

  @Get('compliance')
  listCompliances(@Param('projectId') projectId: string) {
    return this.operationsService.listCompliances(projectId)
  }

  @Post('compliance')
  @HttpCode(201)
  setCompliance(
    @Param('projectId') projectId: string,
    @Body() dto: CreateContractComplianceDto,
  ) {
    return this.operationsService.setCompliance(projectId, dto)
  }

  @Patch('compliance/:complianceId')
  updateCompliance(
    @Param('complianceId') complianceId: string,
    @Body() dto: UpdateContractComplianceDto,
  ) {
    return this.operationsService.updateCompliance(complianceId, dto)
  }
}
