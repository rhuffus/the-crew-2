import { BrainCircuit, Bot } from 'lucide-react'
import type { NodeType } from '@the-crew/shared-types'
import { useLcpAgent } from '@/hooks/use-lcp-agents'

interface AgentDetailPanelProps {
  entityId: string
  nodeType: NodeType
  projectId: string
}

export function AgentDetailPanel({ entityId, nodeType, projectId }: AgentDetailPanelProps) {
  const { data: agent, isLoading } = useLcpAgent(projectId, entityId)

  if (isLoading) return <p className="text-xs text-muted-foreground">Loading...</p>
  if (!agent) return <p className="text-xs text-muted-foreground">Not found</p>

  const Icon = nodeType === 'coordinator-agent' ? BrainCircuit : Bot

  return (
    <div className="space-y-3" data-testid="agent-detail-panel">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-medium capitalize text-muted-foreground">{agent.agentType ?? nodeType}</span>
      </div>

      <div>
        <h4 className="text-sm font-semibold">{agent.name}</h4>
        {agent.role && <p className="mt-1 text-xs text-muted-foreground">{agent.role}</p>}
      </div>

      {agent.skills && agent.skills.length > 0 && (
        <div>
          <h5 className="text-xs font-medium text-muted-foreground">Skills</h5>
          <div className="mt-0.5 flex flex-wrap gap-1">
            {agent.skills.map((skill, i: number) => (
              <span key={i} className="rounded bg-muted px-1.5 py-0.5 text-xs">{skill.name}</span>
            ))}
          </div>
        </div>
      )}

      {agent.responsibilities && agent.responsibilities.length > 0 && (
        <div>
          <h5 className="text-xs font-medium text-muted-foreground">Responsibilities</h5>
          <ul className="mt-0.5 space-y-0.5">
            {agent.responsibilities.map((r: string, i: number) => (
              <li key={i} className="text-xs">• {r}</li>
            ))}
          </ul>
        </div>
      )}

      {agent.inputs && agent.inputs.length > 0 && (
        <div>
          <h5 className="text-xs font-medium text-muted-foreground">Inputs</h5>
          <ul className="mt-0.5 space-y-0.5">
            {agent.inputs.map((input: string, i: number) => (
              <li key={i} className="text-xs">• {input}</li>
            ))}
          </ul>
        </div>
      )}

      {agent.outputs && agent.outputs.length > 0 && (
        <div>
          <h5 className="text-xs font-medium text-muted-foreground">Outputs</h5>
          <ul className="mt-0.5 space-y-0.5">
            {agent.outputs.map((output: string, i: number) => (
              <li key={i} className="text-xs">• {output}</li>
            ))}
          </ul>
        </div>
      )}

      {agent.budget && (
        <div>
          <h5 className="text-xs font-medium text-muted-foreground">Budget</h5>
          <div className="mt-0.5 space-y-0.5 text-xs">
            {agent.budget.maxMonthlyTokens != null && <p>Max monthly tokens: {agent.budget.maxMonthlyTokens.toLocaleString()}</p>}
            {agent.budget.maxConcurrentTasks != null && <p>Max concurrent tasks: {agent.budget.maxConcurrentTasks}</p>}
            {agent.budget.costLimit != null && <p>Cost limit: ${agent.budget.costLimit}</p>}
          </div>
        </div>
      )}

      <div>
        <h5 className="text-xs font-medium text-muted-foreground">Status</h5>
        <span className="mt-0.5 inline-flex rounded bg-muted px-1.5 py-0.5 text-xs capitalize">{agent.status ?? 'active'}</span>
      </div>
    </div>
  )
}
