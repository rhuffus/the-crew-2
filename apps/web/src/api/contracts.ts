import type {
  ContractDto,
  CreateContractDto,
  UpdateContractDto,
} from '@the-crew/shared-types'
import { apiClient } from '@/lib/api-client'

export const contractsApi = {
  list(projectId: string): Promise<ContractDto[]> {
    return apiClient.get(`/projects/${projectId}/contracts`)
  },

  get(projectId: string, id: string): Promise<ContractDto> {
    return apiClient.get(`/projects/${projectId}/contracts/${id}`)
  },

  create(projectId: string, dto: CreateContractDto): Promise<ContractDto> {
    return apiClient.post(`/projects/${projectId}/contracts`, dto)
  },

  update(projectId: string, id: string, dto: UpdateContractDto): Promise<ContractDto> {
    return apiClient.patch(`/projects/${projectId}/contracts/${id}`, dto)
  },

  remove(projectId: string, id: string): Promise<void> {
    return apiClient.delete(`/projects/${projectId}/contracts/${id}`)
  },
}
