import type { Repository } from '@the-crew/domain-core'
import type { Contract } from './contract'

export interface ContractRepository extends Repository<Contract, string> {
  findByProjectId(projectId: string): Promise<Contract[]>
}

export const CONTRACT_REPOSITORY = Symbol('CONTRACT_REPOSITORY')
