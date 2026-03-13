import { Inject, Injectable } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Observable } from 'rxjs'
import type {
  CreateRuntimeExecutionDto,
  UpdateRuntimeExecutionDto,
  CreateRuntimeEventDto,
  RuntimeExecutionDto,
  RuntimeEventDto,
  RuntimeStatusResponse,
  CostSummaryDto,
} from '@the-crew/shared-types'
import type { RuntimeExecutionRepository, RuntimeEventRepository } from '../domain/runtime-repository'
import { RUNTIME_EXECUTION_REPOSITORY, RUNTIME_EVENT_REPOSITORY } from '../domain/runtime-repository'
import { RuntimeExecution } from '../domain/runtime-execution'
import { RuntimeEvent } from '../domain/runtime-event'
import { RuntimeMapper } from './runtime.mapper'
import { RuntimeStatusProjector } from './runtime-status.projector'

@Injectable()
export class RuntimeService {
  constructor(
    @Inject(RUNTIME_EXECUTION_REPOSITORY) private readonly executionRepo: RuntimeExecutionRepository,
    @Inject(RUNTIME_EVENT_REPOSITORY) private readonly eventRepo: RuntimeEventRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly projector: RuntimeStatusProjector,
  ) {}

  // ── Executions ──────────────────────────────────────────────────────

  async createExecution(projectId: string, dto: CreateRuntimeExecutionDto): Promise<RuntimeExecutionDto> {
    const execution = RuntimeExecution.create(projectId, dto)
    await this.executionRepo.save(execution)

    await this.emitRuntimeEvent(projectId, {
      eventType: 'execution-started',
      severity: 'info',
      title: `Execution started: ${dto.executionType}`,
      description: `New ${dto.executionType} execution created`,
      sourceEntityType: dto.executionType === 'workflow-run' ? 'workflow' : 'agent',
      sourceEntityId: (dto.workflowId ?? dto.agentId)!,
      executionId: execution.id,
    })

    return RuntimeMapper.executionToDto(execution)
  }

  async getExecution(executionId: string): Promise<RuntimeExecutionDto | null> {
    const execution = await this.executionRepo.findById(executionId)
    return execution ? RuntimeMapper.executionToDto(execution) : null
  }

  async listExecutions(projectId: string): Promise<RuntimeExecutionDto[]> {
    const executions = await this.executionRepo.listByProject(projectId)
    return executions.map(RuntimeMapper.executionToDto)
  }

  async updateExecution(executionId: string, dto: UpdateRuntimeExecutionDto): Promise<RuntimeExecutionDto | null> {
    const execution = await this.executionRepo.findById(executionId)
    if (!execution) return null

    const prevStatus = execution.status
    execution.update(dto)
    await this.executionRepo.save(execution)

    if (dto.status && dto.status !== prevStatus) {
      const eventType = dto.status === 'completed' ? 'execution-completed' as const
        : dto.status === 'failed' ? 'execution-failed' as const
        : dto.status === 'blocked' ? 'execution-blocked' as const
        : dto.status === 'waiting' ? 'execution-waiting' as const
        : 'execution-started' as const

      const severity = dto.status === 'failed' ? 'error' as const
        : dto.status === 'blocked' ? 'warning' as const
        : 'info' as const

      await this.emitRuntimeEvent(execution.projectId, {
        eventType,
        severity,
        title: `Execution ${dto.status}: ${execution.executionType}`,
        description: `Execution transitioned from ${prevStatus} to ${dto.status}`,
        sourceEntityType: execution.executionType === 'workflow-run' ? 'workflow' : 'agent',
        sourceEntityId: (execution.workflowId ?? execution.agentId)!,
        executionId: execution.id,
      })
    }

    return RuntimeMapper.executionToDto(execution)
  }

  // ── Events ──────────────────────────────────────────────────────────

  async emitRuntimeEvent(projectId: string, dto: CreateRuntimeEventDto): Promise<RuntimeEventDto> {
    const event = RuntimeEvent.create(projectId, dto)
    await this.eventRepo.append(event)
    this.eventEmitter.emit('runtime.event', event)
    return RuntimeMapper.eventToDto(event)
  }

  async listEvents(projectId: string, limit = 50, offset = 0): Promise<RuntimeEventDto[]> {
    const events = await this.eventRepo.listByProject(projectId, limit, offset)
    return events.map(RuntimeMapper.eventToDto)
  }

  async listEventsByExecution(executionId: string): Promise<RuntimeEventDto[]> {
    const events = await this.eventRepo.listByExecution(executionId)
    return events.map(RuntimeMapper.eventToDto)
  }

  async listEventsByEntity(entityId: string, limit = 50): Promise<RuntimeEventDto[]> {
    const events = await this.eventRepo.listByEntity(entityId, limit)
    return events.map(RuntimeMapper.eventToDto)
  }

  // ── Status ──────────────────────────────────────────────────────────

  async getStatus(projectId: string): Promise<RuntimeStatusResponse> {
    const executions = await this.executionRepo.listActiveByProject(projectId)
    const entityIds = new Set<string>()
    for (const e of executions) {
      if (e.workflowId) entityIds.add(e.workflowId)
      if (e.agentId) entityIds.add(e.agentId)
    }

    const nodeStatuses = await Promise.all(
      [...entityIds].map(id => {
        const exec = executions.find(e => e.workflowId === id || e.agentId === id)
        const type = exec?.executionType === 'workflow-run' ? 'workflow' : 'agent'
        return this.projector.computeNodeStatus(id, type)
      }),
    )

    const summary = await this.projector.computeProjectSummary(projectId)

    return {
      projectId,
      nodeStatuses,
      summary,
      fetchedAt: new Date().toISOString(),
    }
  }

  async getNodeStatus(entityId: string, entityType: string) {
    return this.projector.computeNodeStatus(entityId, entityType)
  }

  // ── Cost ────────────────────────────────────────────────────────────

  async getCostSummary(projectId: string): Promise<CostSummaryDto> {
    const executions = await this.executionRepo.listByProject(projectId)
    const now = new Date()
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const periodExecutions = executions.filter(e => e.createdAt >= periodStart)
    const totalCost = periodExecutions.reduce((sum, e) => sum + e.aiCost, 0)

    const costByAgent = new Map<string, number>()
    const costByWorkflow = new Map<string, number>()
    for (const e of periodExecutions) {
      if (e.agentId) {
        costByAgent.set(e.agentId, (costByAgent.get(e.agentId) ?? 0) + e.aiCost)
      }
      if (e.workflowId) {
        costByWorkflow.set(e.workflowId, (costByWorkflow.get(e.workflowId) ?? 0) + e.aiCost)
      }
    }

    return {
      projectId,
      period: { start: periodStart.toISOString(), end: now.toISOString() },
      totalCost,
      costByAgent: [...costByAgent.entries()].map(([agentId, cost]) => ({ agentId, agentName: agentId, cost })),
      costByWorkflow: [...costByWorkflow.entries()].map(([workflowId, cost]) => ({ workflowId, workflowName: workflowId, cost })),
      costByDepartment: [],
      budgetUsedPercent: null,
      alerts: [],
    }
  }

  // ── SSE Stream ──────────────────────────────────────────────────────

  getEventStream(projectId: string, scope?: string, entityId?: string): Observable<RuntimeEventDto> {
    return new Observable((subscriber) => {
      const handler = (event: RuntimeEvent) => {
        if (event.projectId !== projectId) return
        if (scope && entityId && !this.matchesScope(event, scope, entityId)) return
        subscriber.next(RuntimeMapper.eventToDto(event))
      }
      this.eventEmitter.on('runtime.event', handler)
      return () => { this.eventEmitter.off('runtime.event', handler) }
    })
  }

  private matchesScope(event: RuntimeEvent, scope: string, entityId: string): boolean {
    if (scope === 'company') return true
    return event.sourceEntityId === entityId || event.targetEntityId === entityId
  }
}
