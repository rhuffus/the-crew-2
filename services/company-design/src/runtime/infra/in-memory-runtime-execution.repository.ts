import { Injectable } from '@nestjs/common'
import type { RuntimeExecutionRepository } from '../domain/runtime-repository'
import type { RuntimeExecution } from '../domain/runtime-execution'

const ACTIVE_STATUSES = new Set(['pending', 'running', 'waiting', 'blocked'])

@Injectable()
export class InMemoryRuntimeExecutionRepository implements RuntimeExecutionRepository {
  private readonly store = new Map<string, RuntimeExecution>()

  async findById(id: string): Promise<RuntimeExecution | null> {
    return this.store.get(id) ?? null
  }

  async listByProject(projectId: string): Promise<RuntimeExecution[]> {
    return [...this.store.values()].filter(e => e.projectId === projectId)
  }

  async listActiveByProject(projectId: string): Promise<RuntimeExecution[]> {
    return [...this.store.values()].filter(
      e => e.projectId === projectId && ACTIVE_STATUSES.has(e.status),
    )
  }

  async listByEntity(entityId: string): Promise<RuntimeExecution[]> {
    return [...this.store.values()].filter(
      e => e.workflowId === entityId || e.agentId === entityId,
    )
  }

  async save(execution: RuntimeExecution): Promise<void> {
    this.store.set(execution.id, execution)
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id)
  }
}
