import type { AgentAssignmentDto } from '@the-crew/shared-types'
import type { AgentAssignment } from '../domain/agent-assignment'

export class AgentAssignmentMapper {
  static toDto(assignment: AgentAssignment): AgentAssignmentDto {
    return {
      id: assignment.id,
      projectId: assignment.projectId,
      archetypeId: assignment.archetypeId,
      name: assignment.name,
      status: assignment.status,
      createdAt: assignment.createdAt.toISOString(),
      updatedAt: assignment.updatedAt.toISOString(),
    }
  }
}
