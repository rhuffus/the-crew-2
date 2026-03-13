import { Controller, Get, Post, Patch, Param, Query, Body, HttpCode } from '@nestjs/common'
import type {
  CreateRuntimeExecutionDto,
  UpdateRuntimeExecutionDto,
  CreateRuntimeEventDto,
} from '@the-crew/shared-types'
import { CompanyDesignClient } from './company-design.client'

@Controller('projects/:projectId/runtime')
export class RuntimeProxyController {
  constructor(private readonly companyDesign: CompanyDesignClient) {}

  @Get('status')
  getStatus(@Param('projectId') projectId: string) {
    return this.companyDesign.getRuntimeStatus(projectId)
  }

  @Get('status/:entityId')
  getNodeStatus(
    @Param('projectId') projectId: string,
    @Param('entityId') entityId: string,
    @Query('entityType') entityType?: string,
  ) {
    return this.companyDesign.getRuntimeNodeStatus(projectId, entityId, entityType)
  }

  @Get('executions')
  listExecutions(@Param('projectId') projectId: string) {
    return this.companyDesign.listRuntimeExecutions(projectId)
  }

  @Get('executions/:executionId')
  getExecution(
    @Param('projectId') projectId: string,
    @Param('executionId') executionId: string,
  ) {
    return this.companyDesign.getRuntimeExecution(projectId, executionId)
  }

  @Post('executions')
  @HttpCode(201)
  createExecution(
    @Param('projectId') projectId: string,
    @Body() dto: CreateRuntimeExecutionDto,
  ) {
    return this.companyDesign.createRuntimeExecution(projectId, dto)
  }

  @Patch('executions/:executionId')
  updateExecution(
    @Param('projectId') projectId: string,
    @Param('executionId') executionId: string,
    @Body() dto: UpdateRuntimeExecutionDto,
  ) {
    return this.companyDesign.updateRuntimeExecution(projectId, executionId, dto)
  }

  @Get('events')
  listEvents(
    @Param('projectId') projectId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('executionId') executionId?: string,
    @Query('entityId') entityId?: string,
  ) {
    return this.companyDesign.listRuntimeEvents(projectId, { limit, offset, executionId, entityId })
  }

  @Post('events')
  @HttpCode(201)
  createEvent(
    @Param('projectId') projectId: string,
    @Body() dto: CreateRuntimeEventDto,
  ) {
    return this.companyDesign.createRuntimeEvent(projectId, dto)
  }

  @Get('cost-summary')
  getCostSummary(@Param('projectId') projectId: string) {
    return this.companyDesign.getRuntimeCostSummary(projectId)
  }
}
