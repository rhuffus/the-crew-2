import { Injectable } from '@nestjs/common'
import { PlatformPrismaService } from '../../prisma/platform-prisma.service'
import type { AiProviderConfigRepository } from '../domain/ai-provider-config.repository'
import { AiProviderConfig } from '../domain/ai-provider-config'

@Injectable()
export class PrismaAiProviderConfigRepository implements AiProviderConfigRepository {
  constructor(private readonly prisma: PlatformPrismaService) {}

  async findAll(): Promise<AiProviderConfig[]> {
    const rows = await this.prisma.aiProviderConfig.findMany()
    return rows.map((r) => this.toDomain(r))
  }

  async findByProviderId(providerId: string): Promise<AiProviderConfig | null> {
    const row = await this.prisma.aiProviderConfig.findUnique({ where: { providerId } })
    return row ? this.toDomain(row) : null
  }

  async save(config: AiProviderConfig): Promise<void> {
    await this.prisma.aiProviderConfig.upsert({
      where: { providerId: config.providerId },
      create: {
        id: config.id,
        providerId: config.providerId,
        name: config.name,
        apiKey: config.apiKey,
        authType: config.authType,
        enabled: config.enabled,
        createdAt: config.createdAt,
        updatedAt: config.updatedAt,
      },
      update: {
        name: config.name,
        apiKey: config.apiKey,
        authType: config.authType,
        enabled: config.enabled,
        updatedAt: config.updatedAt,
      },
    })
  }

  async deleteByProviderId(providerId: string): Promise<void> {
    await this.prisma.aiProviderConfig.deleteMany({ where: { providerId } })
  }

  private toDomain(row: {
    id: string
    providerId: string
    name: string
    apiKey: string
    authType: string
    enabled: boolean
    createdAt: Date
    updatedAt: Date
  }): AiProviderConfig {
    return AiProviderConfig.reconstitute(row.id, {
      providerId: row.providerId,
      name: row.name,
      apiKey: row.apiKey,
      authType: (row.authType === 'oauth-token' ? 'oauth-token' : 'api-key'),
      enabled: row.enabled,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }
}
