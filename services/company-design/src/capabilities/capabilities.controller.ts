import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
} from '@nestjs/common'
import type { CreateCapabilityDto, UpdateCapabilityDto } from '@the-crew/shared-types'
import { CapabilityService } from './application/capability.service'

@Controller('projects/:projectId/capabilities')
export class CapabilitiesController {
  constructor(private readonly capabilityService: CapabilityService) {}

  @Get()
  list(@Param('projectId') projectId: string) {
    return this.capabilityService.list(projectId)
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.capabilityService.get(id)
  }

  @Post()
  @HttpCode(201)
  create(@Param('projectId') projectId: string, @Body() dto: CreateCapabilityDto) {
    return this.capabilityService.create(projectId, dto)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCapabilityDto) {
    return this.capabilityService.update(id, dto)
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    await this.capabilityService.remove(id)
  }
}
