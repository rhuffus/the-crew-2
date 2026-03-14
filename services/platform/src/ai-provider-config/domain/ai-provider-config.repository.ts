import type { AiProviderConfig } from './ai-provider-config'

export interface AiProviderConfigRepository {
  findAll(): Promise<AiProviderConfig[]>
  findByProviderId(providerId: string): Promise<AiProviderConfig | null>
  save(config: AiProviderConfig): Promise<void>
  deleteByProviderId(providerId: string): Promise<void>
}

export const AI_PROVIDER_CONFIG_REPOSITORY = Symbol('AI_PROVIDER_CONFIG_REPOSITORY')
