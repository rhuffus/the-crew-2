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
import { CompanyDesignClient } from './company-design.client'

@Controller('projects/:projectId/documents')
export class ProjectDocumentsProxyController {
  constructor(private readonly companyDesign: CompanyDesignClient) {}

  @Get()
  list(@Param('projectId') projectId: string) {
    return this.companyDesign.listProjectDocuments(projectId)
  }

  @Get('by-slug')
  getBySlug(@Param('projectId') projectId: string, @Query('slug') slug: string) {
    return this.companyDesign.getProjectDocumentBySlug(projectId, slug)
  }

  @Get(':id')
  get(@Param('projectId') projectId: string, @Param('id') id: string) {
    return this.companyDesign.getProjectDocument(projectId, id)
  }

  @Post()
  @HttpCode(201)
  create(@Param('projectId') projectId: string, @Body() dto: CreateProjectDocumentDto) {
    return this.companyDesign.createProjectDocument(projectId, dto)
  }

  @Patch(':id')
  update(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body() dto: UpdateProjectDocumentDto,
  ) {
    return this.companyDesign.updateProjectDocument(projectId, id, dto)
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('projectId') projectId: string, @Param('id') id: string) {
    return this.companyDesign.deleteProjectDocument(projectId, id)
  }
}
