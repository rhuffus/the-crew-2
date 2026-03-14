import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
} from '@nestjs/common'
import type { CreateProjectDocumentDto, UpdateProjectDocumentDto } from '@the-crew/shared-types'
import { ProjectDocumentService } from './application/project-document.service'

@Controller('projects/:projectId/documents')
export class ProjectDocumentsController {
  constructor(private readonly service: ProjectDocumentService) {}

  @Get()
  list(@Param('projectId') projectId: string) {
    return this.service.list(projectId)
  }

  @Get('by-slug')
  getBySlug(@Param('projectId') projectId: string, @Query('slug') slug: string) {
    return this.service.getBySlug(projectId, slug)
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.get(id)
  }

  @Post()
  @HttpCode(201)
  create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateProjectDocumentDto,
  ) {
    return this.service.create(projectId, dto)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProjectDocumentDto) {
    return this.service.update(id, dto)
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.service.remove(id)
  }
}
