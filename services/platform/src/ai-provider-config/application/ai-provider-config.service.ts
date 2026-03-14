import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import type { AiProviderConfigDto, UpsertAiProviderConfigDto, AiProviderValidationDto, ActiveCredentialDto } from '@the-crew/shared-types'
import { AiProviderConfig } from '../domain/ai-provider-config'
import {
  AI_PROVIDER_CONFIG_REPOSITORY,
  type AiProviderConfigRepository,
} from '../domain/ai-provider-config.repository'

@Injectable()
export class AiProviderConfigService {
  constructor(
    @Inject(AI_PROVIDER_CONFIG_REPOSITORY)
    private readonly repo: AiProviderConfigRepository,
  ) {}

  async list(): Promise<AiProviderConfigDto[]> {
    const configs = await this.repo.findAll()
    return configs.map((c) => this.toDto(c))
  }

  async get(providerId: string): Promise<AiProviderConfigDto> {
    const config = await this.repo.findByProviderId(providerId)
    if (!config) throw new NotFoundException(`Provider ${providerId} not configured`)
    return this.toDto(config)
  }

  async upsert(providerId: string, dto: UpsertAiProviderConfigDto): Promise<AiProviderConfigDto> {
    let config = await this.repo.findByProviderId(providerId)
    if (config) {
      config.update({ name: dto.name, apiKey: dto.apiKey, authType: dto.authType, enabled: dto.enabled })
    } else {
      config = AiProviderConfig.create({
        providerId,
        name: dto.name,
        apiKey: dto.apiKey,
        authType: dto.authType,
        enabled: dto.enabled,
      })
    }
    await this.repo.save(config)
    return this.toDto(config)
  }

  async remove(providerId: string): Promise<void> {
    await this.repo.deleteByProviderId(providerId)
  }

  async validate(providerId: string): Promise<AiProviderValidationDto> {
    const config = await this.repo.findByProviderId(providerId)
    return {
      providerId,
      configured: config !== null && config.enabled && config.apiKey.length > 0,
    }
  }

  async getActiveApiKey(providerId: string): Promise<string | null> {
    const config = await this.repo.findByProviderId(providerId)
    if (!config || !config.enabled) return null
    return config.apiKey
  }

  async getActiveCredential(providerId: string): Promise<ActiveCredentialDto | null> {
    const config = await this.repo.findByProviderId(providerId)
    if (!config || !config.enabled) return null
    return { apiKey: config.apiKey, authType: config.authType }
  }

  private toDto(config: AiProviderConfig): AiProviderConfigDto {
    return {
      providerId: config.providerId,
      name: config.name,
      apiKeyMasked: config.maskedApiKey,
      authType: config.authType,
      enabled: config.enabled,
      createdAt: config.createdAt.toISOString(),
      updatedAt: config.updatedAt.toISOString(),
    }
  }
}
