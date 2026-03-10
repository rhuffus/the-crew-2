import { Inject, Injectable, NotFoundException, Optional } from '@nestjs/common'
import type {
  CreateContractDto,
  UpdateContractDto,
  ContractDto,
} from '@the-crew/shared-types'
import { Contract } from '../domain/contract'
import {
  CONTRACT_REPOSITORY,
  type ContractRepository,
} from '../domain/contract-repository'
import { ContractMapper } from './contract.mapper'
import { AuditService } from '../../audit/application/audit.service'

@Injectable()
export class ContractService {
  constructor(
    @Inject(CONTRACT_REPOSITORY) private readonly repo: ContractRepository,
    @Optional() private readonly auditService?: AuditService,
  ) {}

  async list(projectId: string): Promise<ContractDto[]> {
    const contracts = await this.repo.findByProjectId(projectId)
    return contracts.map(ContractMapper.toDto)
  }

  async get(id: string): Promise<ContractDto> {
    const contract = await this.repo.findById(id)
    if (!contract) throw new NotFoundException(`Contract ${id} not found`)
    return ContractMapper.toDto(contract)
  }

  async create(projectId: string, dto: CreateContractDto): Promise<ContractDto> {
    const id = crypto.randomUUID()
    const contract = Contract.create({
      id,
      projectId,
      name: dto.name,
      description: dto.description,
      type: dto.type,
      providerId: dto.providerId,
      providerType: dto.providerType,
      consumerId: dto.consumerId,
      consumerType: dto.consumerType,
      acceptanceCriteria: dto.acceptanceCriteria,
    })
    await this.repo.save(contract)
    const result = ContractMapper.toDto(contract)
    await this.auditService?.record({
      projectId,
      entityType: 'contract',
      entityId: result.id,
      entityName: result.name,
      action: 'created',
    })
    return result
  }

  async update(id: string, dto: UpdateContractDto): Promise<ContractDto> {
    const contract = await this.repo.findById(id)
    if (!contract) throw new NotFoundException(`Contract ${id} not found`)
    contract.update(dto)
    await this.repo.save(contract)
    const result = ContractMapper.toDto(contract)
    await this.auditService?.record({
      projectId: result.projectId,
      entityType: 'contract',
      entityId: id,
      entityName: result.name,
      action: 'updated',
      changes: dto as Record<string, unknown>,
    })
    return result
  }

  async remove(id: string): Promise<void> {
    const contract = await this.repo.findById(id)
    if (!contract) throw new NotFoundException(`Contract ${id} not found`)
    await this.auditService?.record({
      projectId: contract.projectId,
      entityType: 'contract',
      entityId: id,
      entityName: contract.name,
      action: 'deleted',
    })
    await this.repo.delete(id)
  }
}
