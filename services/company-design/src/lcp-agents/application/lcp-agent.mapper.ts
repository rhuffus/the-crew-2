import type { LcpAgentDto } from '@the-crew/shared-types'
import type { LcpAgent } from '../domain/lcp-agent'

export class LcpAgentMapper {
  static toDto(agent: LcpAgent): LcpAgentDto {
    return {
      id: agent.id,
      projectId: agent.projectId,
      name: agent.name,
      description: agent.description,
      agentType: agent.agentType,
      uoId: agent.uoId,
      role: agent.role,
      skills: agent.skills.map((s) => ({ ...s })),
      inputs: [...agent.inputs],
      outputs: [...agent.outputs],
      responsibilities: [...agent.responsibilities],
      budget: agent.budget ? { ...agent.budget } : null,
      contextWindow: agent.contextWindow,
      status: agent.status,
      systemPromptRef: agent.systemPromptRef,
      createdAt: agent.createdAt.toISOString(),
      updatedAt: agent.updatedAt.toISOString(),
    }
  }
}
