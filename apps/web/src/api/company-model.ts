import type { CompanyModelDto, UpdateCompanyModelDto } from '@the-crew/shared-types'
import { apiClient } from '@/lib/api-client'

export const companyModelApi = {
  get(projectId: string): Promise<CompanyModelDto> {
    return apiClient.get(`/projects/${projectId}/company-model`)
  },

  update(projectId: string, dto: UpdateCompanyModelDto): Promise<CompanyModelDto> {
    return apiClient.put(`/projects/${projectId}/company-model`, dto)
  },
}
