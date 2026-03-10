import type { PolicyDto } from '@the-crew/shared-types'
import type { Policy } from '../domain/policy'

export class PolicyMapper {
  static toDto(policy: Policy): PolicyDto {
    return {
      id: policy.id,
      projectId: policy.projectId,
      name: policy.name,
      description: policy.description,
      scope: policy.scope,
      departmentId: policy.departmentId,
      type: policy.type,
      condition: policy.condition,
      enforcement: policy.enforcement,
      status: policy.status,
      createdAt: policy.createdAt.toISOString(),
      updatedAt: policy.updatedAt.toISOString(),
    }
  }
}
