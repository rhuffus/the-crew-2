import { Controller, Get, Post, Patch, Param, Body, HttpCode } from '@nestjs/common'
import type { CreateProjectDto, UpdateProjectDto } from '@the-crew/shared-types'
import { PlatformClient } from './platform.client'

@Controller('projects')
export class ProjectsController {
  constructor(private readonly platform: PlatformClient) {}

  @Get()
  list() {
    return this.platform.listProjects()
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.platform.getProject(id)
  }

  @Post()
  @HttpCode(201)
  create(@Body() dto: CreateProjectDto) {
    return this.platform.createProject(dto)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.platform.updateProject(id, dto)
  }
}
