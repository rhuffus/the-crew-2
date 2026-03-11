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
import type { CreateSavedViewDto, UpdateSavedViewDto } from '@the-crew/shared-types'
import { SavedViewService } from './application/saved-view.service'

@Controller('projects/:projectId/saved-views')
export class SavedViewsController {
  constructor(private readonly savedViewService: SavedViewService) {}

  @Get()
  list(@Param('projectId') projectId: string) {
    return this.savedViewService.list(projectId)
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.savedViewService.get(id)
  }

  @Post()
  @HttpCode(201)
  create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateSavedViewDto,
  ) {
    return this.savedViewService.create(projectId, dto)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSavedViewDto) {
    return this.savedViewService.update(id, dto)
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.savedViewService.remove(id)
  }
}
