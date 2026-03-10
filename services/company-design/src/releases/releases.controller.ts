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
import type { CreateReleaseDto, UpdateReleaseDto } from '@the-crew/shared-types'
import { ReleaseService } from './application/release.service'

@Controller('projects/:projectId/releases')
export class ReleasesController {
  constructor(private readonly releaseService: ReleaseService) {}

  @Get()
  list(@Param('projectId') projectId: string) {
    return this.releaseService.list(projectId)
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.releaseService.get(id)
  }

  @Post()
  @HttpCode(201)
  create(@Param('projectId') projectId: string, @Body() dto: CreateReleaseDto) {
    return this.releaseService.create(projectId, dto)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateReleaseDto) {
    return this.releaseService.update(id, dto)
  }

  @Post(':id/publish')
  publish(@Param('id') id: string) {
    return this.releaseService.publish(id)
  }

  @Get(':id/diff/:compareId')
  diff(@Param('id') id: string, @Param('compareId') compareId: string) {
    return this.releaseService.diff(id, compareId)
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    await this.releaseService.remove(id)
  }
}
