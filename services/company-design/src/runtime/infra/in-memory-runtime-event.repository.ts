import { Injectable } from '@nestjs/common'
import type { RuntimeEventRepository } from '../domain/runtime-repository'
import type { RuntimeEvent } from '../domain/runtime-event'

@Injectable()
export class InMemoryRuntimeEventRepository implements RuntimeEventRepository {
  private readonly events: RuntimeEvent[] = []

  async findById(id: string): Promise<RuntimeEvent | null> {
    return this.events.find(e => e.id === id) ?? null
  }

  async append(event: RuntimeEvent): Promise<void> {
    this.events.push(event)
  }

  async listByProject(projectId: string, limit = 50, offset = 0): Promise<RuntimeEvent[]> {
    return this.events
      .filter(e => e.projectId === projectId)
      .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())
      .slice(offset, offset + limit)
  }

  async listByExecution(executionId: string): Promise<RuntimeEvent[]> {
    return this.events
      .filter(e => e.executionId === executionId)
      .sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime())
  }

  async listByEntity(entityId: string, limit = 50): Promise<RuntimeEvent[]> {
    return this.events
      .filter(e => e.sourceEntityId === entityId || e.targetEntityId === entityId)
      .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())
      .slice(0, limit)
  }

  async findLatestByEntity(entityId: string): Promise<RuntimeEvent | null> {
    const matching = this.events
      .filter(e => e.sourceEntityId === entityId || e.targetEntityId === entityId)
      .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())
    return matching[0] ?? null
  }

  async countByProject(projectId: string): Promise<number> {
    return this.events.filter(e => e.projectId === projectId).length
  }
}
