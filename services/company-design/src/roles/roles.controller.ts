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
import { RoleService } from './application/role.service'

@Controller('projects/:projectId/roles')
export class RolesController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  list(@Param('projectId') projectId: string) {
    return this.roleService.list(projectId)
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.roleService.get(id)
  }

  @Post()
  @HttpCode(201)
  create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateRoleDto,
  ) {
    return this.roleService.create(projectId, dto)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.roleService.update(id, dto)
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    await this.roleService.remove(id)
  }
}
