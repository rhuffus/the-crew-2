import { Injectable } from '@nestjs/common'
import type { ContractRepository } from '../domain/contract-repository'
import type { Contract } from '../domain/contract'

@Injectable()
export class InMemoryContractRepository implements ContractRepository {
  private readonly store = new Map<string, Contract>()

  async findById(id: string): Promise<Contract | null> {
    return this.store.get(id) ?? null
  }

  async findByProjectId(projectId: string): Promise<Contract[]> {
    return [...this.store.values()].filter((c) => c.projectId === projectId)
  }

  async save(contract: Contract): Promise<void> {
    this.store.set(contract.id, contract)
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id)
  }
}
