import type { WorkflowDto } from '@the-crew/shared-types'
import type { Workflow } from '../domain/workflow'

export class WorkflowMapper {
  static toDto(workflow: Workflow): WorkflowDto {
    return {
      id: workflow.id,
      projectId: workflow.projectId,
      name: workflow.name,
      description: workflow.description,
      ownerDepartmentId: workflow.ownerDepartmentId,
      status: workflow.status,
      triggerDescription: workflow.triggerDescription,
      stages: workflow.stages.map((s) => ({
        name: s.name,
        order: s.order,
        description: s.description,
      })),
      participants: workflow.participants.map((p) => ({
        participantId: p.participantId,
        participantType: p.participantType,
        responsibility: p.responsibility,
      })),
      contractIds: [...workflow.contractIds],
      createdAt: workflow.createdAt.toISOString(),
      updatedAt: workflow.updatedAt.toISOString(),
    }
  }
}
