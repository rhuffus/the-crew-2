import { Injectable } from '@nestjs/common'
import type { LcpAgentRepository } from '../domain/lcp-agent-repository'
import type { LcpAgent } from '../domain/lcp-agent'

@Injectable()
export class InMemoryLcpAgentRepository implements LcpAgentRepository {
  private readonly store = new Map<string, LcpAgent>()

  async findById(id: string): Promise<LcpAgent | null> {
    return this.store.get(id) ?? null
  }

  async findByProjectId(projectId: string): Promise<LcpAgent[]> {
    return [...this.store.values()].filter((a) => a.projectId === projectId)
  }

  async save(agent: LcpAgent): Promise<void> {
    this.store.set(agent.id, agent)
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id)
  }
}
