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
import type { CreateArtifactDto, UpdateArtifactDto } from '@the-crew/shared-types'
import { ArtifactService } from './application/artifact.service'

@Controller('projects/:projectId/artifacts')
export class ArtifactsController {
  constructor(private readonly artifactService: ArtifactService) {}

  @Get()
  list(@Param('projectId') projectId: string) {
    return this.artifactService.list(projectId)
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.artifactService.get(id)
  }

  @Post()
  @HttpCode(201)
  create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateArtifactDto,
  ) {
    return this.artifactService.create(projectId, dto)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateArtifactDto) {
    return this.artifactService.update(id, dto)
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.artifactService.remove(id)
  }
}
