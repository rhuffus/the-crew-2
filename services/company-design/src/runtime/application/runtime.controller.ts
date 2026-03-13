import { Controller, Get, Post, Patch, Param, Query, Body, Sse, MessageEvent, NotFoundException } from '@nestjs/common'
import { Observable, map } from 'rxjs'
import type {
  CreateRuntimeExecutionDto,
  UpdateRuntimeExecutionDto,
  CreateRuntimeEventDto,
} from '@the-crew/shared-types'
import { RuntimeService } from './runtime.service'

@Controller('projects/:projectId/runtime')
export class RuntimeController {
  constructor(private readonly runtimeService: RuntimeService) {}

  // ── Status ──────────────────────────────────────────────────────────

  @Get('status')
  async getStatus(@Param('projectId') projectId: string) {
    return this.runtimeService.getStatus(projectId)
  }

  @Get('status/:entityId')
  async getNodeStatus(
    @Param('entityId') entityId: string,
    @Query('entityType') entityType: string = 'agent',
  ) {
    return this.runtimeService.getNodeStatus(entityId, entityType)
  }

  // ── Executions ──────────────────────────────────────────────────────

  @Get('executions')
  async listExecutions(@Param('projectId') projectId: string) {
    return this.runtimeService.listExecutions(projectId)
  }

  @Get('executions/:executionId')
  async getExecution(@Param('executionId') executionId: string) {
    const result = await this.runtimeService.getExecution(executionId)
    if (!result) throw new NotFoundException('Execution not found')
    return result
  }

  @Post('executions')
  async createExecution(
    @Param('projectId') projectId: string,
    @Body() dto: CreateRuntimeExecutionDto,
  ) {
    return this.runtimeService.createExecution(projectId, dto)
  }

  @Patch('executions/:executionId')
  async updateExecution(
    @Param('executionId') executionId: string,
    @Body() dto: UpdateRuntimeExecutionDto,
  ) {
    const result = await this.runtimeService.updateExecution(executionId, dto)
    if (!result) throw new NotFoundException('Execution not found')
    return result
  }

  // ── Events / Timeline ──────────────────────────────────────────────

  @Get('events')
  async listEvents(
    @Param('projectId') projectId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('executionId') executionId?: string,
    @Query('entityId') entityId?: string,
  ) {
    if (executionId) {
      return this.runtimeService.listEventsByExecution(executionId)
    }
    if (entityId) {
      return this.runtimeService.listEventsByEntity(entityId, limit ? parseInt(limit, 10) : undefined)
    }
    return this.runtimeService.listEvents(
      projectId,
      limit ? parseInt(limit, 10) : undefined,
      offset ? parseInt(offset, 10) : undefined,
    )
  }

  @Post('events')
  async createEvent(
    @Param('projectId') projectId: string,
    @Body() dto: CreateRuntimeEventDto,
  ) {
    return this.runtimeService.emitRuntimeEvent(projectId, dto)
  }

  // ── SSE Stream ──────────────────────────────────────────────────────

  @Sse('events/stream')
  streamEvents(
    @Param('projectId') projectId: string,
    @Query('scope') scope?: string,
    @Query('entityId') entityId?: string,
  ): Observable<MessageEvent> {
    return this.runtimeService.getEventStream(projectId, scope, entityId).pipe(
      map((event) => ({ data: event } as MessageEvent)),
    )
  }

  // ── Cost ────────────────────────────────────────────────────────────

  @Get('cost-summary')
  async getCostSummary(@Param('projectId') projectId: string) {
    return this.runtimeService.getCostSummary(projectId)
  }
}
