import { Module } from '@nestjs/common'
import { AiProviderConfigController } from './application/ai-provider-config.controller'
import { AiProviderConfigService } from './application/ai-provider-config.service'
import { PrismaAiProviderConfigRepository } from './infra/prisma-ai-provider-config.repository'
import { AI_PROVIDER_CONFIG_REPOSITORY } from './domain/ai-provider-config.repository'

@Module({
  controllers: [AiProviderConfigController],
  providers: [
    AiProviderConfigService,
    {
      provide: AI_PROVIDER_CONFIG_REPOSITORY,
      useClass: PrismaAiProviderConfigRepository,
    },
  ],
  exports: [AiProviderConfigService],
})
export class AiProviderConfigModule {}
