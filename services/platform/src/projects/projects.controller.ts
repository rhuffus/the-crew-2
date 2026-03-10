import { Controller, Get, Post, Patch, Param, Body, HttpCode } from '@nestjs/common'
import type { CreateProjectDto, UpdateProjectDto } from '@the-crew/shared-types'
import { ProjectService } from './application/project.service'

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  list() {
    return this.projectService.list()
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.projectService.get(id)
  }

  @Post()
  @HttpCode(201)
  create(@Body() dto: CreateProjectDto) {
    return this.projectService.create(dto)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projectService.update(id, dto)
  }
}
