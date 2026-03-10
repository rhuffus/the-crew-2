import { Injectable } from '@nestjs/common'
import type { AgentArchetypeRepository } from '../domain/agent-archetype-repository'
import type { AgentArchetype } from '../domain/agent-archetype'

@Injectable()
export class InMemoryAgentArchetypeRepository implements AgentArchetypeRepository {
  private readonly store = new Map<string, AgentArchetype>()

  async findById(id: string): Promise<AgentArchetype | null> {
    return this.store.get(id) ?? null
  }

  async findByProjectId(projectId: string): Promise<AgentArchetype[]> {
    return [...this.store.values()].filter((a) => a.projectId === projectId)
  }

  async save(archetype: AgentArchetype): Promise<void> {
    this.store.set(archetype.id, archetype)
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id)
  }
}
