import type { ContractDto } from '@the-crew/shared-types'
import type { Contract } from '../domain/contract'

export class ContractMapper {
  static toDto(contract: Contract): ContractDto {
    return {
      id: contract.id,
      projectId: contract.projectId,
      name: contract.name,
      description: contract.description,
      type: contract.type,
      status: contract.status,
      providerId: contract.providerId,
      providerType: contract.providerType,
      consumerId: contract.consumerId,
      consumerType: contract.consumerType,
      acceptanceCriteria: [...contract.acceptanceCriteria],
      createdAt: contract.createdAt.toISOString(),
      updatedAt: contract.updatedAt.toISOString(),
    }
  }
}
