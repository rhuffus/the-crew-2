import { Inject, Injectable, NotFoundException, Optional } from '@nestjs/common'
import type { CreateRoleDto, UpdateRoleDto, RoleDto } from '@the-crew/shared-types'
import { Role } from '../domain/role'
import { ROLE_REPOSITORY, type RoleRepository } from '../domain/role-repository'
import { RoleMapper } from './role.mapper'
import { AuditService } from '../../audit/application/audit.service'

@Injectable()
export class RoleService {
  constructor(
    @Inject(ROLE_REPOSITORY) private readonly repo: RoleRepository,
    @Optional() private readonly auditService?: AuditService,
  ) {}

  async list(projectId: string): Promise<RoleDto[]> {
    const roles = await this.repo.findByProjectId(projectId)
    return roles.map(RoleMapper.toDto)
  }

  async get(id: string): Promise<RoleDto> {
    const role = await this.repo.findById(id)
    if (!role) throw new NotFoundException(`Role ${id} not found`)
    return RoleMapper.toDto(role)
  }

  async create(projectId: string, dto: CreateRoleDto): Promise<RoleDto> {
    const id = crypto.randomUUID()
    const role = Role.create({
      id,
      projectId,
      name: dto.name,
      description: dto.description,
      departmentId: dto.departmentId,
      capabilityIds: dto.capabilityIds,
      accountability: dto.accountability,
      authority: dto.authority,
    })
    await this.repo.save(role)
    const result = RoleMapper.toDto(role)
    await this.auditService?.record({
      projectId,
      entityType: 'role',
      entityId: result.id,
      entityName: result.name,
      action: 'created',
    })
    return result
  }

  async update(id: string, dto: UpdateRoleDto): Promise<RoleDto> {
    const role = await this.repo.findById(id)
    if (!role) throw new NotFoundException(`Role ${id} not found`)
    role.update(dto)
    await this.repo.save(role)
    const result = RoleMapper.toDto(role)
    await this.auditService?.record({
      projectId: result.projectId,
      entityType: 'role',
      entityId: id,
      entityName: result.name,
      action: 'updated',
      changes: dto as Record<string, unknown>,
    })
    return result
  }

  async remove(id: string): Promise<void> {
    const role = await this.repo.findById(id)
    if (!role) throw new NotFoundException(`Role ${id} not found`)
    await this.auditService?.record({
      projectId: role.projectId,
      entityType: 'role',
      entityId: id,
      entityName: role.name,
      action: 'deleted',
    })
    await this.repo.delete(id)
  }
}
