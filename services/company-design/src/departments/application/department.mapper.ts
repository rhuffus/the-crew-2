import type { DepartmentDto } from '@the-crew/shared-types'
import type { Department } from '../domain/department'

export class DepartmentMapper {
  static toDto(dept: Department): DepartmentDto {
    return {
      id: dept.id,
      projectId: dept.projectId,
      name: dept.name,
      description: dept.description,
      mandate: dept.mandate,
      parentId: dept.parentId,
      createdAt: dept.createdAt.toISOString(),
      updatedAt: dept.updatedAt.toISOString(),
    }
  }
}
