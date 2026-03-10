import { Injectable } from '@nestjs/common'
import type { WorkflowRepository } from '../domain/workflow-repository'
import type { Workflow } from '../domain/workflow'

@Injectable()
export class InMemoryWorkflowRepository implements WorkflowRepository {
  private readonly store = new Map<string, Workflow>()

  async findById(id: string): Promise<Workflow | null> {
    return this.store.get(id) ?? null
  }

  async findByProjectId(projectId: string): Promise<Workflow[]> {
    return [...this.store.values()].filter((w) => w.projectId === projectId)
  }

  async save(workflow: Workflow): Promise<void> {
    this.store.set(workflow.id, workflow)
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id)
  }
}
