import { useEffect } from 'react'
import { useProposals, useApproveProposal, useRejectProposal } from '@/hooks/use-proposals'
import { useBootstrapStatus } from '@/hooks/use-bootstrap'
import { ProposalCard } from './proposal-card'
import type { MaturityPhase } from '@the-crew/shared-types'
import { Bot, Sparkles } from 'lucide-react'

const PHASE_MESSAGES: Record<MaturityPhase, string> = {
  seed: 'Your company is in its seed phase. I\'ll propose the initial organizational structure.',
  formation: 'We\'re forming the core departments and teams. Review my proposals to shape the organization.',
  structured: 'The basic structure is in place. I\'m now optimizing workflows and team composition.',
  operating: 'The company is operating. I\'ll suggest improvements based on performance metrics.',
  scaling: 'We\'re scaling up. Watch for proposals to split teams and create new departments.',
  optimizing: 'The organization is mature. I focus on efficiency and continuous improvement.',
}

interface CeoConversationDockProps {
  projectId: string
}

export function CeoConversationDock({ projectId }: CeoConversationDockProps) {
  const { data: status } = useBootstrapStatus(projectId)
  const { data: proposals, refetch } = useProposals(projectId)
  const approveMutation = useApproveProposal(projectId)
  const rejectMutation = useRejectProposal(projectId)

  // Poll for new proposals every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => { refetch() }, 5000)
    return () => clearInterval(interval)
  }, [refetch])

  const phase = (status?.maturityPhase ?? 'seed') as MaturityPhase
  const phaseMessage = PHASE_MESSAGES[phase] ?? PHASE_MESSAGES.seed

  const pendingProposals = (proposals ?? []).filter(
    p => p.status === 'proposed' || p.status === 'under-review',
  )
  const recentApproved = (proposals ?? []).filter(
    p => p.status === 'approved' || p.status === 'implemented',
  ).slice(0, 3)

  function handleApprove(proposalId: string) {
    approveMutation.mutate({ proposalId, approvedByUserId: 'founder' })
  }

  function handleReject(proposalId: string, reason: string) {
    rejectMutation.mutate({ proposalId, reason })
  }

  return (
    <div className="flex h-full flex-col" data-testid="ceo-conversation-dock">
      {/* CEO welcome message */}
      <div className="border-b border-border p-3">
        <div className="flex items-start gap-2">
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
            <Bot className="h-4 w-4 text-blue-700" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-blue-700">CEO Agent</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{phaseMessage}</p>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-amber-500" />
          <span className="text-xs capitalize text-muted-foreground">Phase: {phase}</span>
        </div>
      </div>

      {/* Proposals feed */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {pendingProposals.length > 0 && (
          <section>
            <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
              Pending Proposals ({pendingProposals.length})
            </h4>
            {pendingProposals.map(p => (
              <ProposalCard
                key={p.id}
                proposal={p}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </section>
        )}

        {pendingProposals.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Bot className="mb-2 h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              No pending proposals. The CEO is analyzing the organization...
            </p>
          </div>
        )}

        {recentApproved.length > 0 && (
          <section>
            <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
              Recently Approved
            </h4>
            {recentApproved.map(p => (
              <ProposalCard
                key={p.id}
                proposal={p}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </section>
        )}
      </div>
    </div>
  )
}
