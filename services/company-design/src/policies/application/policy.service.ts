import { Inject, Injectable, NotFoundException, Optional } from '@nestjs/common'
import type {
  CreatePolicyDto,
  UpdatePolicyDto,
  PolicyDto,
} from '@the-crew/shared-types'
import { Policy } from '../domain/policy'
import {
  POLICY_REPOSITORY,
  type PolicyRepository,
} from '../domain/policy-repository'
import { PolicyMapper } from './policy.mapper'
import { AuditService } from '../../audit/application/audit.service'

@Injectable()
export class PolicyService {
  constructor(
    @Inject(POLICY_REPOSITORY) private readonly repo: PolicyRepository,
    @Optional() private readonly auditService?: AuditService,
  ) {}

  async list(projectId: string): Promise<PolicyDto[]> {
    const policies = await this.repo.findByProjectId(projectId)
    return policies.map(PolicyMapper.toDto)
  }

  async get(id: string): Promise<PolicyDto> {
    const policy = await this.repo.findById(id)
    if (!policy) throw new NotFoundException(`Policy ${id} not found`)
    return PolicyMapper.toDto(policy)
  }

  async create(projectId: string, dto: CreatePolicyDto): Promise<PolicyDto> {
    const id = crypto.randomUUID()
    const policy = Policy.create({
      id,
      projectId,
      name: dto.name,
      description: dto.description,
      scope: dto.scope,
      departmentId: dto.departmentId,
      type: dto.type,
      condition: dto.condition,
      enforcement: dto.enforcement,
    })
    await this.repo.save(policy)
    const result = PolicyMapper.toDto(policy)
    await this.auditService?.record({
      projectId,
      entityType: 'policy',
      entityId: result.id,
      entityName: result.name,
      action: 'created',
    })
    return result
  }

  async update(id: string, dto: UpdatePolicyDto): Promise<PolicyDto> {
    const policy = await this.repo.findById(id)
    if (!policy) throw new NotFoundException(`Policy ${id} not found`)
    policy.update(dto)
    await this.repo.save(policy)
    const result = PolicyMapper.toDto(policy)
    await this.auditService?.record({
      projectId: result.projectId,
      entityType: 'policy',
      entityId: id,
      entityName: result.name,
      action: 'updated',
      changes: dto as Record<string, unknown>,
    })
    return result
  }

  async remove(id: string): Promise<void> {
    const policy = await this.repo.findById(id)
    if (!policy) throw new NotFoundException(`Policy ${id} not found`)
    await this.auditService?.record({
      projectId: policy.projectId,
      entityType: 'policy',
      entityId: id,
      entityName: policy.name,
      action: 'deleted',
    })
    await this.repo.delete(id)
  }
}
