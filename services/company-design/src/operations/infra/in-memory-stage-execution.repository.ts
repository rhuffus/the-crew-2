import { Injectable } from '@nestjs/common'
import type { StageExecutionRepository } from '../domain/operations-repository'
import type { StageExecution } from '../domain/stage-execution'

@Injectable()
export class InMemoryStageExecutionRepository implements StageExecutionRepository {
  private readonly store = new Map<string, StageExecution>()

  async findById(id: string): Promise<StageExecution | null> {
    return this.store.get(id) ?? null
  }

  async listByRun(runId: string): Promise<StageExecution[]> {
    return [...this.store.values()]
      .filter((e) => e.runId === runId)
      .sort((a, b) => a.stageIndex - b.stageIndex)
  }

  async listByProject(_projectId: string): Promise<StageExecution[]> {
    // StageExecution doesn't have projectId directly, so we return all
    // The service filters by run's projectId after joining
    return [...this.store.values()]
  }

  async save(execution: StageExecution): Promise<void> {
    this.store.set(execution.id, execution)
  }

  async saveAll(executions: StageExecution[]): Promise<void> {
    for (const execution of executions) {
      this.store.set(execution.id, execution)
    }
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id)
  }
}
