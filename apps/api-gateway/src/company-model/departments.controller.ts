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
import { CompanyDesignClient } from './company-design.client'

@Controller('projects/:projectId/departments')
export class DepartmentsController {
  constructor(private readonly companyDesign: CompanyDesignClient) {}

  @Get()
  list(@Param('projectId') projectId: string) {
    return this.companyDesign.listDepartments(projectId)
  }

  @Get(':id')
  get(@Param('id') id: string, @Param('projectId') projectId: string) {
    return this.companyDesign.getDepartment(id, projectId)
  }

  @Post()
  @HttpCode(201)
  create(@Param('projectId') projectId: string, @Body() dto: CreateDepartmentDto) {
    return this.companyDesign.createDepartment(projectId, dto)
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Param('projectId') projectId: string,
    @Body() dto: UpdateDepartmentDto,
  ) {
    return this.companyDesign.updateDepartment(id, projectId, dto)
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string, @Param('projectId') projectId: string) {
    return this.companyDesign.deleteDepartment(id, projectId)
  }
}
