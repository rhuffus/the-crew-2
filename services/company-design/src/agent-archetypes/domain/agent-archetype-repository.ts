import type { Repository } from '@the-crew/domain-core'
import type { AgentArchetype } from './agent-archetype'

export interface AgentArchetypeRepository extends Repository<AgentArchetype, string> {
  findByProjectId(projectId: string): Promise<AgentArchetype[]>
}

export const AGENT_ARCHETYPE_REPOSITORY = Symbol('AGENT_ARCHETYPE_REPOSITORY')
