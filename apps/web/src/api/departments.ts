import type {
  DepartmentDto,
  CreateDepartmentDto,
  UpdateDepartmentDto,
} from '@the-crew/shared-types'
import { apiClient } from '@/lib/api-client'

export const departmentsApi = {
  list(projectId: string): Promise<DepartmentDto[]> {
    return apiClient.get(`/projects/${projectId}/departments`)
  },

  get(projectId: string, id: string): Promise<DepartmentDto> {
    return apiClient.get(`/projects/${projectId}/departments/${id}`)
  },

  create(projectId: string, dto: CreateDepartmentDto): Promise<DepartmentDto> {
    return apiClient.post(`/projects/${projectId}/departments`, dto)
  },

  update(projectId: string, id: string, dto: UpdateDepartmentDto): Promise<DepartmentDto> {
    return apiClient.patch(`/projects/${projectId}/departments/${id}`, dto)
  },

  remove(projectId: string, id: string): Promise<void> {
    return apiClient.delete(`/projects/${projectId}/departments/${id}`)
  },
}
