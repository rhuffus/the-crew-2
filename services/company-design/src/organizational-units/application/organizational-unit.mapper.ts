import type { OrganizationalUnitDto } from '@the-crew/shared-types'
import type { OrganizationalUnit } from '../domain/organizational-unit'

export class OrganizationalUnitMapper {
  static toDto(unit: OrganizationalUnit): OrganizationalUnitDto {
    return {
      id: unit.id,
      projectId: unit.projectId,
      name: unit.name,
      description: unit.description,
      uoType: unit.uoType,
      mandate: unit.mandate,
      purpose: unit.purpose,
      parentUoId: unit.parentUoId,
      coordinatorAgentId: unit.coordinatorAgentId,
      functions: unit.functions,
      status: unit.status,
      createdAt: unit.createdAt.toISOString(),
      updatedAt: unit.updatedAt.toISOString(),
    }
  }
}
