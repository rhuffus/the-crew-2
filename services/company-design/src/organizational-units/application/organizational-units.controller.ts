import { Controller, Get, Post, Patch, Delete, Param, Body, HttpCode, Inject, NotFoundException } from '@nestjs/common'
import type { CreateOrganizationalUnitDto, UpdateOrganizationalUnitDto } from '@the-crew/shared-types'
import { ORGANIZATIONAL_UNIT_REPOSITORY, type OrganizationalUnitRepository } from '../domain/organizational-unit-repository'
import { OrganizationalUnit } from '../domain/organizational-unit'
import { OrganizationalUnitMapper } from './organizational-unit.mapper'
import { randomUUID } from 'crypto'

@Controller('projects/:projectId/organizational-units')
export class OrganizationalUnitsController {
  constructor(
    @Inject(ORGANIZATIONAL_UNIT_REPOSITORY)
    private readonly repo: OrganizationalUnitRepository,
  ) {}

  @Get()
  async list(@Param('projectId') projectId: string) {
    const units = await this.repo.findByProjectId(projectId)
    return units.map(OrganizationalUnitMapper.toDto)
  }

  @Get(':id')
  async get(@Param('projectId') projectId: string, @Param('id') id: string) {
    const unit = await this.repo.findById(id)
    if (!unit || unit.projectId !== projectId) throw new NotFoundException(`Organizational unit ${id} not found`)
    return OrganizationalUnitMapper.toDto(unit)
  }

  @Post()
  @HttpCode(201)
  async create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateOrganizationalUnitDto,
  ) {
    const unit = OrganizationalUnit.create({
      id: randomUUID(),
      projectId,
      name: dto.name,
      description: dto.description,
      uoType: dto.uoType,
      mandate: dto.mandate,
      purpose: dto.purpose ?? '',
      parentUoId: dto.parentUoId ?? null,
      coordinatorAgentId: dto.coordinatorAgentId ?? null,
      functions: dto.functions ?? [],
    })
    await this.repo.save(unit)
    return OrganizationalUnitMapper.toDto(unit)
  }

  @Patch(':id')
  async update(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body() dto: UpdateOrganizationalUnitDto,
  ) {
    const unit = await this.repo.findById(id)
    if (!unit || unit.projectId !== projectId) throw new NotFoundException(`Organizational unit ${id} not found`)
    unit.update(dto)
    await this.repo.save(unit)
    return OrganizationalUnitMapper.toDto(unit)
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('projectId') projectId: string, @Param('id') id: string) {
    const unit = await this.repo.findById(id)
    if (!unit || unit.projectId !== projectId) throw new NotFoundException(`Organizational unit ${id} not found`)
    await this.repo.delete(id)
  }
}
