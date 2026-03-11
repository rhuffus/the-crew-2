import { Injectable } from '@nestjs/common'
import type { ContractComplianceRepository } from '../domain/operations-repository'
import type { ContractCompliance } from '../domain/contract-compliance'

@Injectable()
export class InMemoryContractComplianceRepository implements ContractComplianceRepository {
  private readonly store = new Map<string, ContractCompliance>()

  async findById(id: string): Promise<ContractCompliance | null> {
    return this.store.get(id) ?? null
  }

  async findByContract(projectId: string, contractId: string): Promise<ContractCompliance | null> {
    for (const c of this.store.values()) {
      if (c.projectId === projectId && c.contractId === contractId) {
        return c
      }
    }
    return null
  }

  async listByProject(projectId: string): Promise<ContractCompliance[]> {
    return [...this.store.values()].filter((c) => c.projectId === projectId)
  }

  async save(compliance: ContractCompliance): Promise<void> {
    this.store.set(compliance.id, compliance)
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id)
  }
}
