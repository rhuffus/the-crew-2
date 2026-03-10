import type {
  RoleDto,
  CreateRoleDto,
  UpdateRoleDto,
} from '@the-crew/shared-types'
import { apiClient } from '@/lib/api-client'

export const rolesApi = {
  list(projectId: string): Promise<RoleDto[]> {
    return apiClient.get(`/projects/${projectId}/roles`)
  },

  get(projectId: string, id: string): Promise<RoleDto> {
    return apiClient.get(`/projects/${projectId}/roles/${id}`)
  },

  create(projectId: string, dto: CreateRoleDto): Promise<RoleDto> {
    return apiClient.post(`/projects/${projectId}/roles`, dto)
  },

  update(projectId: string, id: string, dto: UpdateRoleDto): Promise<RoleDto> {
    return apiClient.patch(`/projects/${projectId}/roles/${id}`, dto)
  },

  remove(projectId: string, id: string): Promise<void> {
    return apiClient.delete(`/projects/${projectId}/roles/${id}`)
  },
}
