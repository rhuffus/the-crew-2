import { Controller, Get, Put, Delete, Param, Body, HttpCode, NotFoundException } from '@nestjs/common'
import type { UpsertAiProviderConfigDto } from '@the-crew/shared-types'
import { AiProviderConfigService } from './ai-provider-config.service'

@Controller('ai-provider-configs')
export class AiProviderConfigController {
  constructor(private readonly service: AiProviderConfigService) {}

  @Get()
  list() {
    return this.service.list()
  }

  @Get(':providerId')
  get(@Param('providerId') providerId: string) {
    return this.service.get(providerId)
  }

  @Put(':providerId')
  upsert(
    @Param('providerId') providerId: string,
    @Body() dto: UpsertAiProviderConfigDto,
  ) {
    return this.service.upsert(providerId, dto)
  }

  @Delete(':providerId')
  @HttpCode(204)
  async remove(@Param('providerId') providerId: string) {
    await this.service.remove(providerId)
  }

  @Get(':providerId/validate')
  validate(@Param('providerId') providerId: string) {
    return this.service.validate(providerId)
  }

  @Get(':providerId/secret')
  async getSecret(@Param('providerId') providerId: string) {
    const credential = await this.service.getActiveCredential(providerId)
    if (!credential) throw new NotFoundException(`Provider ${providerId} not configured or disabled`)
    return credential
  }
}
