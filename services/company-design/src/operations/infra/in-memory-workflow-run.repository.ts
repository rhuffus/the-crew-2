import { Injectable } from '@nestjs/common'
import type { WorkflowRunRepository } from '../domain/operations-repository'
import type { WorkflowRun } from '../domain/workflow-run'

@Injectable()
export class InMemoryWorkflowRunRepository implements WorkflowRunRepository {
  private readonly store = new Map<string, WorkflowRun>()

  async findById(id: string): Promise<WorkflowRun | null> {
    return this.store.get(id) ?? null
  }

  async listByProject(projectId: string): Promise<WorkflowRun[]> {
    return [...this.store.values()].filter((r) => r.projectId === projectId)
  }

  async listByWorkflow(projectId: string, workflowId: string): Promise<WorkflowRun[]> {
    return [...this.store.values()].filter(
      (r) => r.projectId === projectId && r.workflowId === workflowId,
    )
  }

  async save(run: WorkflowRun): Promise<void> {
    this.store.set(run.id, run)
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id)
  }
}
