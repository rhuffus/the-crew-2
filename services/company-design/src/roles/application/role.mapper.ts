import type { RoleDto } from '@the-crew/shared-types'
import type { Role } from '../domain/role'

export class RoleMapper {
  static toDto(role: Role): RoleDto {
    return {
      id: role.id,
      projectId: role.projectId,
      name: role.name,
      description: role.description,
      departmentId: role.departmentId,
      capabilityIds: [...role.capabilityIds],
      accountability: role.accountability,
      authority: role.authority,
      createdAt: role.createdAt.toISOString(),
      updatedAt: role.updatedAt.toISOString(),
    }
  }
}
