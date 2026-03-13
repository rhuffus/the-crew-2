import { Inject, Injectable } from '@nestjs/common'
import type { NodeRuntimeStatusDto, RuntimeBadgeDto, NodeRuntimeState, RuntimeExecutionStatus, RuntimeSummaryDto } from '@the-crew/shared-types'
import type { RuntimeExecutionRepository, RuntimeEventRepository } from '../domain/runtime-repository'
import { RUNTIME_EXECUTION_REPOSITORY, RUNTIME_EVENT_REPOSITORY } from '../domain/runtime-repository'
import type { RuntimeExecution } from '../domain/runtime-execution'

const STATUS_PRIORITY: Record<RuntimeExecutionStatus, number> = {
  failed: 5,
  blocked: 4,
  waiting: 3,
  running: 2,
  pending: 1,
  completed: 0,
  cancelled: 0,
}

@Injectable()
export class RuntimeStatusProjector {
  constructor(
    @Inject(RUNTIME_EXECUTION_REPOSITORY) private readonly executionRepo: RuntimeExecutionRepository,
    @Inject(RUNTIME_EVENT_REPOSITORY) private readonly eventRepo: RuntimeEventRepository,
  ) {}

  async computeNodeStatus(entityId: string, entityType: string): Promise<NodeRuntimeStatusDto> {
    const executions = await this.executionRepo.listByEntity(entityId)
    const activeExecutions = executions.filter(e =>
      e.status === 'pending' || e.status === 'running' || e.status === 'waiting' || e.status === 'blocked',
    )

    const state = this.computeState(activeExecutions)
    const badges = this.computeBadges(activeExecutions, executions)
    const lastEvent = await this.eventRepo.findLatestByEntity(entityId)

    return {
      entityId,
      entityType,
      state,
      badges,
      lastEventAt: lastEvent?.occurredAt.toISOString() ?? null,
    }
  }

  private computeState(executions: RuntimeExecution[]): NodeRuntimeState {
    if (executions.length === 0) return 'idle'

    let maxPriority = 0
    for (const e of executions) {
      const p = STATUS_PRIORITY[e.status] ?? 0
      if (p > maxPriority) maxPriority = p
    }

    if (maxPriority >= 5) return 'error'
    if (maxPriority >= 4) return 'blocked'
    if (maxPriority >= 3) return 'waiting'
    if (maxPriority >= 1) return 'active'
    return 'idle'
  }

  private computeBadges(activeExecutions: RuntimeExecution[], allExecutions: RuntimeExecution[]): RuntimeBadgeDto[] {
    const badges: RuntimeBadgeDto[] = []

    const running = activeExecutions.filter(e => e.status === 'running' || e.status === 'pending')
    if (running.length > 0) {
      badges.push({ type: 'running', label: `${running.length} running`, severity: 'info' })
    }

    const waiting = activeExecutions.filter(e => e.status === 'waiting')
    if (waiting.length > 0) {
      badges.push({ type: 'waiting', label: `${waiting.length} waiting`, severity: 'warning' })
    }

    const blocked = activeExecutions.filter(e => e.status === 'blocked')
    if (blocked.length > 0) {
      badges.push({ type: 'blocked', label: `${blocked.length} blocked`, severity: 'error' })
    }

    const recentErrors = allExecutions.filter(e => e.status === 'failed')
    if (recentErrors.length > 0) {
      badges.push({ type: 'error', label: `${recentErrors.length} failed`, severity: 'error' })
    }

    const queued = activeExecutions.filter(e => e.status === 'pending')
    if (queued.length > 1) {
      badges.push({ type: 'queue', label: `${queued.length} queued`, severity: 'info' })
    }

    const totalCost = allExecutions.reduce((sum, e) => sum + e.aiCost, 0)
    if (totalCost > 0) {
      const severity = totalCost > 50 ? 'error' as const : totalCost > 10 ? 'warning' as const : 'info' as const
      badges.push({ type: 'cost', label: `$${totalCost.toFixed(2)}`, severity })
    }

    return badges
  }

  async computeProjectSummary(projectId: string): Promise<RuntimeSummaryDto> {
    const executions = await this.executionRepo.listByProject(projectId)

    return {
      activeExecutionCount: executions.filter(e => e.status === 'running' || e.status === 'pending').length,
      blockedExecutionCount: executions.filter(e => e.status === 'blocked').length,
      failedExecutionCount: executions.filter(e => e.status === 'failed').length,
      openIncidentCount: 0,
      pendingApprovalCount: executions.reduce(
        (count, e) => count + e.approvals.filter(a => a.status === 'pending').length, 0,
      ),
      totalCostCurrentPeriod: executions.reduce((sum, e) => sum + e.aiCost, 0),
    }
  }
}
