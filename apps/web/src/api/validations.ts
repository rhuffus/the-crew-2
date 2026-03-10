import type { ValidationResultDto } from '@the-crew/shared-types'
import { apiClient } from '@/lib/api-client'

export const validationsApi = {
  get(projectId: string): Promise<ValidationResultDto> {
    return apiClient.get(`/projects/${projectId}/validations`)
  },
}
