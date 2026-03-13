import type { Repository } from '@the-crew/domain-core'
import type { LcpAgent } from './lcp-agent'

export interface LcpAgentRepository extends Repository<LcpAgent, string> {
  findByProjectId(projectId: string): Promise<LcpAgent[]>
}

export const LCP_AGENT_REPOSITORY = Symbol('LCP_AGENT_REPOSITORY')
