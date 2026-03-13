import type { RuntimeExecution } from './runtime-execution'
import type { RuntimeEvent } from './runtime-event'

export const RUNTIME_EXECUTION_REPOSITORY = Symbol('RUNTIME_EXECUTION_REPOSITORY')
export const RUNTIME_EVENT_REPOSITORY = Symbol('RUNTIME_EVENT_REPOSITORY')

export interface RuntimeExecutionRepository {
  findById(id: string): Promise<RuntimeExecution | null>
  listByProject(projectId: string): Promise<RuntimeExecution[]>
  listActiveByProject(projectId: string): Promise<RuntimeExecution[]>
  listByEntity(entityId: string): Promise<RuntimeExecution[]>
  save(execution: RuntimeExecution): Promise<void>
  delete(id: string): Promise<void>
}

export interface RuntimeEventRepository {
  findById(id: string): Promise<RuntimeEvent | null>
  append(event: RuntimeEvent): Promise<void>
  listByProject(projectId: string, limit?: number, offset?: number): Promise<RuntimeEvent[]>
  listByExecution(executionId: string): Promise<RuntimeEvent[]>
  listByEntity(entityId: string, limit?: number): Promise<RuntimeEvent[]>
  findLatestByEntity(entityId: string): Promise<RuntimeEvent | null>
  countByProject(projectId: string): Promise<number>
}
