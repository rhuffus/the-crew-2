import { Injectable } from '@nestjs/common'
import type { PolicyRepository } from '../domain/policy-repository'
import type { Policy } from '../domain/policy'

@Injectable()
export class InMemoryPolicyRepository implements PolicyRepository {
  private readonly store = new Map<string, Policy>()

  async findById(id: string): Promise<Policy | null> {
    return this.store.get(id) ?? null
  }

  async findByProjectId(projectId: string): Promise<Policy[]> {
    return [...this.store.values()].filter((p) => p.projectId === projectId)
  }

  async save(policy: Policy): Promise<void> {
    this.store.set(policy.id, policy)
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id)
  }
}
