import type { AgentArchetypeDto } from '@the-crew/shared-types'
import type { AgentArchetype } from '../domain/agent-archetype'

export class AgentArchetypeMapper {
  static toDto(archetype: AgentArchetype): AgentArchetypeDto {
    return {
      id: archetype.id,
      projectId: archetype.projectId,
      name: archetype.name,
      description: archetype.description,
      roleId: archetype.roleId,
      departmentId: archetype.departmentId,
      skillIds: [...archetype.skillIds],
      constraints: archetype.constraints,
      createdAt: archetype.createdAt.toISOString(),
      updatedAt: archetype.updatedAt.toISOString(),
    }
  }
}
