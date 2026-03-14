import type { AiProviderConfigRepository } from '../domain/ai-provider-config.repository'
import type { AiProviderConfig } from '../domain/ai-provider-config'

export class InMemoryAiProviderConfigRepository implements AiProviderConfigRepository {
  private configs: Map<string, AiProviderConfig> = new Map()

  async findAll(): Promise<AiProviderConfig[]> {
    return [...this.configs.values()]
  }

  async findByProviderId(providerId: string): Promise<AiProviderConfig | null> {
    for (const config of this.configs.values()) {
      if (config.providerId === providerId) return config
    }
    return null
  }

  async save(config: AiProviderConfig): Promise<void> {
    this.configs.set(config.providerId, config)
  }

  async deleteByProviderId(providerId: string): Promise<void> {
    this.configs.delete(providerId)
  }
}
