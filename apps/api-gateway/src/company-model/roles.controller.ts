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
import type { CreateRoleDto, UpdateRoleDto } from '@the-crew/shared-types'
import { CompanyDesignClient } from './company-design.client'

@Controller('projects/:projectId/roles')
export class RolesController {
  constructor(private readonly companyDesign: CompanyDesignClient) {}

  @Get()
  list(@Param('projectId') projectId: string) {
    return this.companyDesign.listRoles(projectId)
  }

  @Get(':id')
  get(@Param('id') id: string, @Param('projectId') projectId: string) {
    return this.companyDesign.getRole(id, projectId)
  }

  @Post()
  @HttpCode(201)
  create(@Param('projectId') projectId: string, @Body() dto: CreateRoleDto) {
    return this.companyDesign.createRole(projectId, dto)
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Param('projectId') projectId: string,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.companyDesign.updateRole(id, projectId, dto)
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string, @Param('projectId') projectId: string) {
    return this.companyDesign.deleteRole(id, projectId)
  }
}
