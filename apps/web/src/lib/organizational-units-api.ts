import { apiClient } from './api-client'
import type {
  OrganizationalUnitDto,
  CreateOrganizationalUnitDto,
  UpdateOrganizationalUnitDto,
} from '@the-crew/shared-types'

export const organizationalUnitsApi = {
  list(projectId: string): Promise<OrganizationalUnitDto[]> {
    return apiClient.get(`/projects/${projectId}/organizational-units`)
  },

  get(projectId: string, id: string): Promise<OrganizationalUnitDto> {
    return apiClient.get(`/projects/${projectId}/organizational-units/${id}`)
  },

  create(projectId: string, dto: CreateOrganizationalUnitDto): Promise<OrganizationalUnitDto> {
    return apiClient.post(`/projects/${projectId}/organizational-units`, dto)
  },

  update(projectId: string, id: string, dto: UpdateOrganizationalUnitDto): Promise<OrganizationalUnitDto> {
    return apiClient.patch(`/projects/${projectId}/organizational-units/${id}`, dto)
  },

  delete(projectId: string, id: string): Promise<void> {
    return apiClient.delete(`/projects/${projectId}/organizational-units/${id}`)
  },
}
