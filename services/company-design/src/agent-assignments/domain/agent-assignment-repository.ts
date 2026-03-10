import type { Repository } from '@the-crew/domain-core'
import type { AgentAssignment } from './agent-assignment'

export interface AgentAssignmentRepository extends Repository<AgentAssignment, string> {
  findByProjectId(projectId: string): Promise<AgentAssignment[]>
}

export const AGENT_ASSIGNMENT_REPOSITORY = Symbol('AGENT_ASSIGNMENT_REPOSITORY')
