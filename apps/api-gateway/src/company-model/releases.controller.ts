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
import { CompanyDesignClient } from './company-design.client'

@Controller('projects/:projectId/releases')
export class ReleasesController {
  constructor(private readonly companyDesign: CompanyDesignClient) {}

  @Get()
  list(@Param('projectId') projectId: string) {
    return this.companyDesign.listReleases(projectId)
  }

  @Get(':id')
  get(@Param('id') id: string, @Param('projectId') projectId: string) {
    return this.companyDesign.getRelease(id, projectId)
  }

  @Post()
  @HttpCode(201)
  create(@Param('projectId') projectId: string, @Body() dto: CreateReleaseDto) {
    return this.companyDesign.createRelease(projectId, dto)
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Param('projectId') projectId: string,
    @Body() dto: UpdateReleaseDto,
  ) {
    return this.companyDesign.updateRelease(id, projectId, dto)
  }

  @Post(':id/publish')
  publish(@Param('id') id: string, @Param('projectId') projectId: string) {
    return this.companyDesign.publishRelease(id, projectId)
  }

  @Get(':id/diff/:compareId')
  diff(
    @Param('id') id: string,
    @Param('compareId') compareId: string,
    @Param('projectId') projectId: string,
  ) {
    return this.companyDesign.diffReleases(id, compareId, projectId)
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string, @Param('projectId') projectId: string) {
    return this.companyDesign.deleteRelease(id, projectId)
  }
}
