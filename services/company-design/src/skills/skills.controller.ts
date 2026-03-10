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
import type { CreateSkillDto, UpdateSkillDto } from '@the-crew/shared-types'
import { SkillService } from './application/skill.service'

@Controller('projects/:projectId/skills')
export class SkillsController {
  constructor(private readonly skillService: SkillService) {}

  @Get()
  list(@Param('projectId') projectId: string) {
    return this.skillService.list(projectId)
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.skillService.get(id)
  }

  @Post()
  @HttpCode(201)
  create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateSkillDto,
  ) {
    return this.skillService.create(projectId, dto)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSkillDto) {
    return this.skillService.update(id, dto)
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.skillService.remove(id)
  }
}
