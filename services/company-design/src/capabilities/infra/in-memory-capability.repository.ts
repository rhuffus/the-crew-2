import { Injectable } from '@nestjs/common'
import type { CapabilityRepository } from '../domain/capability-repository'
import type { Capability } from '../domain/capability'

@Injectable()
export class InMemoryCapabilityRepository implements CapabilityRepository {
  private readonly store = new Map<string, Capability>()

  async findById(id: string): Promise<Capability | null> {
    return this.store.get(id) ?? null
  }

  async findByProjectId(projectId: string): Promise<Capability[]> {
    return [...this.store.values()].filter((c) => c.projectId === projectId)
  }

  async save(capability: Capability): Promise<void> {
    this.store.set(capability.id, capability)
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id)
  }
}
