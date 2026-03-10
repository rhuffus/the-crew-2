import { Inject, Injectable, NotFoundException, Optional } from '@nestjs/common'
import type {
  CreateDepartmentDto,
  UpdateDepartmentDto,
  DepartmentDto,
} from '@the-crew/shared-types'
import { Department } from '../domain/department'
import {
  DEPARTMENT_REPOSITORY,
  type DepartmentRepository,
} from '../domain/department-repository'
import { DepartmentMapper } from './department.mapper'
import { AuditService } from '../../audit/application/audit.service'

@Injectable()
export class DepartmentService {
  constructor(
    @Inject(DEPARTMENT_REPOSITORY) private readonly repo: DepartmentRepository,
    @Optional() private readonly auditService?: AuditService,
  ) {}

  async list(projectId: string): Promise<DepartmentDto[]> {
    const departments = await this.repo.findByProjectId(projectId)
    return departments.map(DepartmentMapper.toDto)
  }

  async get(id: string): Promise<DepartmentDto> {
    const dept = await this.repo.findById(id)
    if (!dept) throw new NotFoundException(`Department ${id} not found`)
    return DepartmentMapper.toDto(dept)
  }

  async create(projectId: string, dto: CreateDepartmentDto): Promise<DepartmentDto> {
    const id = crypto.randomUUID()
    const dept = Department.create({
      id,
      projectId,
      name: dto.name,
      description: dto.description,
      mandate: dto.mandate,
      parentId: dto.parentId,
    })
    await this.repo.save(dept)
    const result = DepartmentMapper.toDto(dept)
    await this.auditService?.record({
      projectId,
      entityType: 'department',
      entityId: result.id,
      entityName: result.name,
      action: 'created',
    })
    return result
  }

  async update(id: string, dto: UpdateDepartmentDto): Promise<DepartmentDto> {
    const dept = await this.repo.findById(id)
    if (!dept) throw new NotFoundException(`Department ${id} not found`)
    dept.update(dto)
    await this.repo.save(dept)
    const result = DepartmentMapper.toDto(dept)
    await this.auditService?.record({
      projectId: result.projectId,
      entityType: 'department',
      entityId: id,
      entityName: result.name,
      action: 'updated',
      changes: dto as Record<string, unknown>,
    })
    return result
  }

  async remove(id: string): Promise<void> {
    const dept = await this.repo.findById(id)
    if (!dept) throw new NotFoundException(`Department ${id} not found`)
    await this.auditService?.record({
      projectId: dept.projectId,
      entityType: 'department',
      entityId: id,
      entityName: dept.name,
      action: 'deleted',
    })
    await this.repo.delete(id)
  }
}
