import { Controller, Get, Put, Delete, Param, Body, HttpCode } from '@nestjs/common'
import type { UpsertAiProviderConfigDto } from '@the-crew/shared-types'
import { PlatformClient } from './platform.client'

@Controller('ai-provider-configs')
export class AiProviderConfigProxyController {
  constructor(private readonly platform: PlatformClient) {}

  @Get()
  list() {
    return this.platform.listAiProviderConfigs()
  }

  @Get(':providerId')
  get(@Param('providerId') providerId: string) {
    return this.platform.getAiProviderConfig(providerId)
  }

  @Put(':providerId')
  upsert(
    @Param('providerId') providerId: string,
    @Body() dto: UpsertAiProviderConfigDto,
  ) {
    return this.platform.upsertAiProviderConfig(providerId, dto)
  }

  @Delete(':providerId')
  @HttpCode(204)
  async remove(@Param('providerId') providerId: string) {
    await this.platform.deleteAiProviderConfig(providerId)
  }

  @Get(':providerId/validate')
  validate(@Param('providerId') providerId: string) {
    return this.platform.validateAiProviderConfig(providerId)
  }
}
