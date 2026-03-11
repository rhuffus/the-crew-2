import type { WorkflowRunDto, StageExecutionDto, IncidentDto, ContractComplianceDto } from '@the-crew/shared-types'
import type { WorkflowRun } from '../domain/workflow-run'
import type { StageExecution } from '../domain/stage-execution'
import type { Incident } from '../domain/incident'
import type { ContractCompliance } from '../domain/contract-compliance'

export class OperationsMapper {
  static runToDto(run: WorkflowRun): WorkflowRunDto {
    return {
      id: run.id,
      projectId: run.projectId,
      workflowId: run.workflowId,
      status: run.status,
      currentStageIndex: run.currentStageIndex,
      startedAt: run.startedAt.toISOString(),
      completedAt: run.completedAt?.toISOString() ?? null,
      failureReason: run.failureReason,
      createdAt: run.createdAt.toISOString(),
      updatedAt: run.updatedAt.toISOString(),
    }
  }

  static stageToDto(exec: StageExecution): StageExecutionDto {
    return {
      id: exec.id,
      runId: exec.runId,
      workflowId: exec.workflowId,
      stageName: exec.stageName,
      stageIndex: exec.stageIndex,
      status: exec.status,
      assigneeId: exec.assigneeId,
      blockReason: exec.blockReason,
      startedAt: exec.startedAt?.toISOString() ?? null,
      completedAt: exec.completedAt?.toISOString() ?? null,
    }
  }

  static incidentToDto(incident: Incident): IncidentDto {
    return {
      id: incident.id,
      projectId: incident.projectId,
      entityType: incident.entityType,
      entityId: incident.entityId,
      severity: incident.severity,
      status: incident.status,
      title: incident.title,
      description: incident.description,
      reportedAt: incident.reportedAt.toISOString(),
      resolvedAt: incident.resolvedAt?.toISOString() ?? null,
      createdAt: incident.createdAt.toISOString(),
      updatedAt: incident.updatedAt.toISOString(),
    }
  }

  static complianceToDto(cc: ContractCompliance): ContractComplianceDto {
    return {
      id: cc.id,
      projectId: cc.projectId,
      contractId: cc.contractId,
      status: cc.status,
      reason: cc.reason,
      lastCheckedAt: cc.lastCheckedAt.toISOString(),
      createdAt: cc.createdAt.toISOString(),
      updatedAt: cc.updatedAt.toISOString(),
    }
  }
}
