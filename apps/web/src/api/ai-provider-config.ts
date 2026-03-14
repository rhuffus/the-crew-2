import type {
  AiProviderConfigDto,
  UpsertAiProviderConfigDto,
  AiProviderValidationDto,
} from '@the-crew/shared-types'
import { apiClient } from '@/lib/api-client'

export const aiProviderConfigApi = {
  list(): Promise<AiProviderConfigDto[]> {
    return apiClient.get('/ai-provider-configs')
  },

  get(providerId: string): Promise<AiProviderConfigDto> {
    return apiClient.get(`/ai-provider-configs/${providerId}`)
  },

  upsert(providerId: string, dto: UpsertAiProviderConfigDto): Promise<AiProviderConfigDto> {
    return apiClient.put(`/ai-provider-configs/${providerId}`, dto)
  },

  remove(providerId: string): Promise<void> {
    return apiClient.delete(`/ai-provider-configs/${providerId}`)
  },

  validate(providerId: string): Promise<AiProviderValidationDto> {
    return apiClient.get(`/ai-provider-configs/${providerId}/validate`)
  },
}
