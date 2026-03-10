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
import type { CreateDepartmentDto, UpdateDepartmentDto } from '@the-crew/shared-types'
import { DepartmentService } from './application/department.service'

@Controller('projects/:projectId/departments')
export class DepartmentsController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Get()
  list(@Param('projectId') projectId: string) {
    return this.departmentService.list(projectId)
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.departmentService.get(id)
  }

  @Post()
  @HttpCode(201)
  create(@Param('projectId') projectId: string, @Body() dto: CreateDepartmentDto) {
    return this.departmentService.create(projectId, dto)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDepartmentDto) {
    return this.departmentService.update(id, dto)
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    await this.departmentService.remove(id)
  }
}
