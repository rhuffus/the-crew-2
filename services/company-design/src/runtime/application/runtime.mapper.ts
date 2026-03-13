import type { RuntimeExecutionDto, RuntimeEventDto } from '@the-crew/shared-types'
import type { RuntimeExecution } from '../domain/runtime-execution'
import type { RuntimeEvent } from '../domain/runtime-event'

export class RuntimeMapper {
  static executionToDto(execution: RuntimeExecution): RuntimeExecutionDto {
    return {
      id: execution.id,
      projectId: execution.projectId,
      executionType: execution.executionType,
      workflowId: execution.workflowId,
      agentId: execution.agentId,
      status: execution.status,
      startedAt: execution.startedAt?.toISOString() ?? null,
      completedAt: execution.completedAt?.toISOString() ?? null,
      input: execution.input,
      output: execution.output,
      errors: execution.errors,
      waitingFor: execution.waitingFor,
      approvals: execution.approvals,
      aiCost: execution.aiCost,
      logSummary: execution.logSummary,
      createdAt: execution.createdAt.toISOString(),
      updatedAt: execution.updatedAt.toISOString(),
    }
  }

  static eventToDto(event: RuntimeEvent): RuntimeEventDto {
    return {
      id: event.id,
      projectId: event.projectId,
      eventType: event.eventType,
      severity: event.severity,
      title: event.title,
      description: event.description,
      sourceEntityType: event.sourceEntityType,
      sourceEntityId: event.sourceEntityId,
      targetEntityType: event.targetEntityType,
      targetEntityId: event.targetEntityId,
      executionId: event.executionId,
      metadata: event.metadata,
      occurredAt: event.occurredAt.toISOString(),
    }
  }
}
