import { Inject, Injectable, NotFoundException, Optional } from '@nestjs/common'
import type {
  CreateCapabilityDto,
  UpdateCapabilityDto,
  CapabilityDto,
} from '@the-crew/shared-types'
import { Capability } from '../domain/capability'
import {
  CAPABILITY_REPOSITORY,
  type CapabilityRepository,
} from '../domain/capability-repository'
import { CapabilityMapper } from './capability.mapper'
import { AuditService } from '../../audit/application/audit.service'

@Injectable()
export class CapabilityService {
  constructor(
    @Inject(CAPABILITY_REPOSITORY) private readonly repo: CapabilityRepository,
    @Optional() private readonly auditService?: AuditService,
  ) {}

  async list(projectId: string): Promise<CapabilityDto[]> {
    const capabilities = await this.repo.findByProjectId(projectId)
    return capabilities.map(CapabilityMapper.toDto)
  }

  async get(id: string): Promise<CapabilityDto> {
    const cap = await this.repo.findById(id)
    if (!cap) throw new NotFoundException(`Capability ${id} not found`)
    return CapabilityMapper.toDto(cap)
  }

  async create(projectId: string, dto: CreateCapabilityDto): Promise<CapabilityDto> {
    const id = crypto.randomUUID()
    const cap = Capability.create({
      id,
      projectId,
      name: dto.name,
      description: dto.description,
      ownerDepartmentId: dto.ownerDepartmentId,
      inputs: dto.inputs,
      outputs: dto.outputs,
    })
    await this.repo.save(cap)
    const result = CapabilityMapper.toDto(cap)
    await this.auditService?.record({
      projectId,
      entityType: 'capability',
      entityId: result.id,
      entityName: result.name,
      action: 'created',
    })
    return result
  }

  async update(id: string, dto: UpdateCapabilityDto): Promise<CapabilityDto> {
    const cap = await this.repo.findById(id)
    if (!cap) throw new NotFoundException(`Capability ${id} not found`)
    cap.update(dto)
    await this.repo.save(cap)
    const result = CapabilityMapper.toDto(cap)
    await this.auditService?.record({
      projectId: result.projectId,
      entityType: 'capability',
      entityId: id,
      entityName: result.name,
      action: 'updated',
      changes: dto as Record<string, unknown>,
    })
    return result
  }

  async remove(id: string): Promise<void> {
    const cap = await this.repo.findById(id)
    if (!cap) throw new NotFoundException(`Capability ${id} not found`)
    await this.auditService?.record({
      projectId: cap.projectId,
      entityType: 'capability',
      entityId: id,
      entityName: cap.name,
      action: 'deleted',
    })
    await this.repo.delete(id)
  }
}
