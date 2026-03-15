import {
  Bot,
  BrainCircuit,
  Sparkles,
  FileText,
  Activity,
  Loader2,
  Clock,
  AlertTriangle,
  DollarSign,
} from 'lucide-react'
import type {
  BootstrapConversationStatus,
  MaturityPhase,
  DocumentStatus,
} from '@the-crew/shared-types'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'
import { useBootstrapStatus } from '@/hooks/use-bootstrap'
import { useBootstrapConversation } from '@/hooks/use-bootstrap-conversation'
import { useLcpAgent } from '@/hooks/use-lcp-agents'
import { useProjectDocuments } from '@/hooks/use-project-documents'
import { useRuntimeStatusStore } from '@/stores/runtime-status-store'

const PHASE_COLORS: Record<MaturityPhase, string> = {
  seed: 'bg-gray-200 text-gray-700',
  formation: 'bg-blue-100 text-blue-700',
  structured: 'bg-indigo-100 text-indigo-700',
  operating: 'bg-green-100 text-green-700',
  scaling: 'bg-purple-100 text-purple-700',
  optimizing: 'bg-amber-100 text-amber-700',
}

const STATUS_LABELS: Record<BootstrapConversationStatus, string> = {
  'not-started': 'Not started',
  'collecting-context': 'Collecting context',
  'drafting-foundation-docs': 'Drafting documents',
  'reviewing-foundation-docs': 'Reviewing documents',
  'ready-to-grow': 'Ready to grow',
  'growth-started': 'Growth started',
}

const DOC_STATUS_COLORS: Record<DocumentStatus, string> = {
  draft: 'bg-gray-100 text-gray-600',
  review: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
}

interface AgentChatInspectorPanelProps {
  projectId: string
  agentId: string
}

export function AgentChatInspectorPanel({ projectId, agentId }: AgentChatInspectorPanelProps) {
  const openDocumentView = useVisualWorkspaceStore((s) => s.openDocumentView)

  const { data: agent, isLoading: agentLoading } = useLcpAgent(projectId, agentId)
  const { data: bootstrapStatus } = useBootstrapStatus(projectId)
  const { data: conversation } = useBootstrapConversation(projectId)
  const { data: documents } = useProjectDocuments(projectId)
  const runtimeSummary = useRuntimeStatusStore((s) => s.summary)
  const costSummary = useRuntimeStatusStore((s) => s.costSummary)
  const connected = useRuntimeStatusStore((s) => s.connected)

  const phase = (bootstrapStatus?.maturityPhase ?? null) as MaturityPhase | null
  const conversationStatus = (conversation?.status ?? 'not-started') as BootstrapConversationStatus
  const Icon = agent?.agentType === 'coordinator' ? BrainCircuit : Bot

  return (
    <div data-testid="agent-chat-inspector-panel" className="space-y-4 p-3">
      {/* Agent Info */}
      <div data-testid="agent-inspector-info">
        <h4 className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Agent
        </h4>
        {agentLoading ? (
          <p className="text-xs text-muted-foreground">Loading...</p>
        ) : agent ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold">{agent.name}</span>
            </div>
            {agent.role && (
              <p className="text-xs text-muted-foreground">{agent.role}</p>
            )}
            {agent.skills && agent.skills.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {agent.skills.map((skill, i: number) => (
                  <span key={i} className="rounded bg-muted px-1.5 py-0.5 text-[10px]">{skill.name}</span>
                ))}
              </div>
            )}
            {agent.responsibilities && agent.responsibilities.length > 0 && (
              <div>
                <h5 className="text-[10px] font-medium text-muted-foreground">Responsibilities</h5>
                <ul className="mt-0.5 space-y-0.5">
                  {agent.responsibilities.map((r: string, i: number) => (
                    <li key={i} className="text-xs">- {r}</li>
                  ))}
                </ul>
              </div>
            )}
            {agent.budget && (
              <div className="text-xs text-muted-foreground">
                {agent.budget.costLimit != null && <span>Budget: ${agent.budget.costLimit}</span>}
              </div>
            )}
            <div>
              <span className="inline-flex rounded bg-muted px-1.5 py-0.5 text-[10px] capitalize">
                {agent.status ?? 'active'}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Agent not found</p>
        )}
      </div>

      {/* Bootstrap Status */}
      <div data-testid="agent-inspector-bootstrap">
        <h4 className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Bootstrap Status
        </h4>
        <div className="space-y-2">
          {phase && (
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span
                className={`inline-flex rounded px-2 py-0.5 text-xs font-medium capitalize ${PHASE_COLORS[phase]}`}
              >
                {phase}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Bot className="h-3.5 w-3.5 text-blue-600" />
            <span className="text-xs text-foreground">
              {STATUS_LABELS[conversationStatus]}
            </span>
          </div>
        </div>
      </div>

      {/* Project Documents */}
      <div data-testid="agent-inspector-documents">
        <h4 className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <FileText className="mr-1 inline h-3 w-3" />
          Documents ({documents?.length ?? 0})
        </h4>
        {documents && documents.length > 0 ? (
          <ul className="space-y-1">
            {documents.map((doc) => (
              <li key={doc.id}>
                <button
                  type="button"
                  onClick={() => openDocumentView(doc.id)}
                  className="flex w-full items-center justify-between rounded px-2 py-1 text-left text-xs hover:bg-accent"
                  data-testid="agent-inspector-doc-link"
                >
                  <span className="min-w-0 truncate text-foreground">
                    {doc.title}
                  </span>
                  <span
                    className={`ml-1 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${DOC_STATUS_COLORS[doc.status]}`}
                  >
                    {doc.status}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground">No documents yet</p>
        )}
      </div>

      {/* Runtime Summary */}
      <div data-testid="agent-inspector-runtime">
        <h4 className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <Activity className="mr-1 inline h-3 w-3" />
          Runtime
        </h4>
        <div className="flex items-center gap-1.5 mb-1.5">
          <span
            data-testid="agent-inspector-connection-dot"
            className={`h-2 w-2 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-400'}`}
          />
          <span className="text-[10px] text-muted-foreground">
            {connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        {runtimeSummary ? (
          <div className="space-y-0.5">
            {runtimeSummary.activeExecutionCount > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-blue-600">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Active
                </span>
                <span className="text-foreground">
                  {runtimeSummary.activeExecutionCount}
                </span>
              </div>
            )}
            {runtimeSummary.blockedExecutionCount > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-orange-600">
                  <Clock className="h-3 w-3" />
                  Blocked
                </span>
                <span className="text-foreground">
                  {runtimeSummary.blockedExecutionCount}
                </span>
              </div>
            )}
            {runtimeSummary.failedExecutionCount > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-red-600">
                  <AlertTriangle className="h-3 w-3" />
                  Failed
                </span>
                <span className="text-foreground">
                  {runtimeSummary.failedExecutionCount}
                </span>
              </div>
            )}
            {runtimeSummary.activeExecutionCount === 0 &&
              runtimeSummary.blockedExecutionCount === 0 &&
              runtimeSummary.failedExecutionCount === 0 && (
                <p className="text-xs text-muted-foreground">
                  All systems idle
                </p>
              )}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No runtime data</p>
        )}
        {costSummary && costSummary.totalCost > 0 && (
          <div className="mt-1.5 rounded bg-muted/50 px-2 py-1 text-[10px] text-muted-foreground">
            <DollarSign className="mr-0.5 inline h-3 w-3" />
            Total AI cost: ${costSummary.totalCost.toFixed(2)}
            {costSummary.budgetUsedPercent != null && (
              <span className="ml-1">
                ({costSummary.budgetUsedPercent.toFixed(0)}% of budget)
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
