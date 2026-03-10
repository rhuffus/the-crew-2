import type { CapabilityDto } from '@the-crew/shared-types'
import type { Capability } from '../domain/capability'

export class CapabilityMapper {
  static toDto(cap: Capability): CapabilityDto {
    return {
      id: cap.id,
      projectId: cap.projectId,
      name: cap.name,
      description: cap.description,
      ownerDepartmentId: cap.ownerDepartmentId,
      inputs: [...cap.inputs],
      outputs: [...cap.outputs],
      createdAt: cap.createdAt.toISOString(),
      updatedAt: cap.updatedAt.toISOString(),
    }
  }
}
