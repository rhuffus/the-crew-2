import { Injectable } from '@nestjs/common'
import type { AgentAssignmentRepository } from '../domain/agent-assignment-repository'
import type { AgentAssignment } from '../domain/agent-assignment'

@Injectable()
export class InMemoryAgentAssignmentRepository implements AgentAssignmentRepository {
  private readonly store = new Map<string, AgentAssignment>()

  async findById(id: string): Promise<AgentAssignment | null> {
    return this.store.get(id) ?? null
  }

  async findByProjectId(projectId: string): Promise<AgentAssignment[]> {
    return [...this.store.values()].filter((a) => a.projectId === projectId)
  }

  async save(assignment: AgentAssignment): Promise<void> {
    this.store.set(assignment.id, assignment)
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id)
  }
}
