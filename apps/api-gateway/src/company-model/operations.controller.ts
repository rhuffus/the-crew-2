import { Controller, Get, Post, Patch, Param, Query, Body, HttpCode } from '@nestjs/common'
import type {
  CreateWorkflowRunDto,
  UpdateWorkflowRunDto,
  CreateIncidentDto,
  UpdateIncidentDto,
  CreateContractComplianceDto,
  UpdateContractComplianceDto,
  StageExecutionStatus,
} from '@the-crew/shared-types'
import { CompanyDesignClient } from './company-design.client'

@Controller('projects/:projectId/operations')
export class OperationsController {
  constructor(private readonly companyDesign: CompanyDesignClient) {}

  @Get('status')
  getStatus(
    @Param('projectId') projectId: string,
    @Query('scopeType') scopeType: string,
    @Query('entityId') entityId?: string,
  ) {
    return this.companyDesign.getOperationsStatus(projectId, scopeType || 'company', entityId)
  }

  @Get('runs')
  listRuns(
    @Param('projectId') projectId: string,
    @Query('workflowId') workflowId?: string,
  ) {
    return this.companyDesign.listWorkflowRuns(projectId, workflowId)
  }

  @Post('runs')
  @HttpCode(201)
  createRun(
    @Param('projectId') projectId: string,
    @Body() dto: CreateWorkflowRunDto,
  ) {
    return this.companyDesign.createWorkflowRun(projectId, dto)
  }

  @Patch('runs/:runId')
  updateRun(
    @Param('projectId') projectId: string,
    @Param('runId') runId: string,
    @Body() dto: UpdateWorkflowRunDto,
  ) {
    return this.companyDesign.updateWorkflowRun(projectId, runId, dto)
  }

  @Post('runs/:runId/stages/:stageIndex/advance')
  @HttpCode(200)
  advanceStage(
    @Param('projectId') projectId: string,
    @Param('runId') runId: string,
    @Param('stageIndex') stageIndex: string,
    @Body() body: { status: StageExecutionStatus; blockReason?: string | null },
  ) {
    return this.companyDesign.advanceStage(projectId, runId, parseInt(stageIndex, 10), body.status, body.blockReason)
  }

  @Get('incidents')
  listIncidents(
    @Param('projectId') projectId: string,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
  ) {
    return this.companyDesign.listIncidents(projectId, entityType, entityId)
  }

  @Post('incidents')
  @HttpCode(201)
  createIncident(
    @Param('projectId') projectId: string,
    @Body() dto: CreateIncidentDto,
  ) {
    return this.companyDesign.createIncident(projectId, dto)
  }

  @Patch('incidents/:incidentId')
  updateIncident(
    @Param('projectId') projectId: string,
    @Param('incidentId') incidentId: string,
    @Body() dto: UpdateIncidentDto,
  ) {
    return this.companyDesign.updateIncident(projectId, incidentId, dto)
  }

  @Post('incidents/:incidentId/resolve')
  @HttpCode(200)
  resolveIncident(
    @Param('projectId') projectId: string,
    @Param('incidentId') incidentId: string,
  ) {
    return this.companyDesign.resolveIncident(projectId, incidentId)
  }

  @Get('compliance')
  listCompliances(@Param('projectId') projectId: string) {
    return this.companyDesign.listCompliances(projectId)
  }

  @Post('compliance')
  @HttpCode(201)
  setCompliance(
    @Param('projectId') projectId: string,
    @Body() dto: CreateContractComplianceDto,
  ) {
    return this.companyDesign.setCompliance(projectId, dto)
  }

  @Patch('compliance/:complianceId')
  updateCompliance(
    @Param('projectId') projectId: string,
    @Param('complianceId') complianceId: string,
    @Body() dto: UpdateContractComplianceDto,
  ) {
    return this.companyDesign.updateCompliance(projectId, complianceId, dto)
  }
}
