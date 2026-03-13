import { Controller, Get, Post, Patch, Delete, Param, Body, HttpCode } from '@nestjs/common'
import type { CreateOrganizationalUnitDto, UpdateOrganizationalUnitDto } from '@the-crew/shared-types'
import { CompanyDesignClient } from './company-design.client'

@Controller('projects/:projectId/organizational-units')
export class OrganizationalUnitsProxyController {
  constructor(private readonly companyDesign: CompanyDesignClient) {}

  @Get()
  list(@Param('projectId') projectId: string) {
    return this.companyDesign.listOrganizationalUnits(projectId)
  }

  @Get(':id')
  get(@Param('projectId') projectId: string, @Param('id') id: string) {
    return this.companyDesign.getOrganizationalUnit(projectId, id)
  }

  @Post()
  @HttpCode(201)
  create(@Param('projectId') projectId: string, @Body() dto: CreateOrganizationalUnitDto) {
    return this.companyDesign.createOrganizationalUnit(projectId, dto)
  }

  @Patch(':id')
  update(@Param('projectId') projectId: string, @Param('id') id: string, @Body() dto: UpdateOrganizationalUnitDto) {
    return this.companyDesign.updateOrganizationalUnit(projectId, id, dto)
  }

  @Delete(':id')
  @HttpCode(204)
  delete(@Param('projectId') projectId: string, @Param('id') id: string) {
    return this.companyDesign.deleteOrganizationalUnit(projectId, id)
  }
}
