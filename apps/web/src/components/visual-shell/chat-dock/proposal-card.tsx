import { Check, X, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import type { ProposalDto } from '@the-crew/shared-types'

interface ProposalCardProps {
  proposal: ProposalDto
  onApprove: (proposalId: string) => void
  onReject: (proposalId: string, reason: string) => void
}

export function ProposalCard({ proposal, onApprove, onReject }: ProposalCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  const canAct = proposal.status === 'proposed' || proposal.status === 'under-review'

  return (
    <div className="rounded-lg border bg-card p-3 text-sm" data-testid="ceo-proposal-card">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <span className="inline-flex rounded bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-blue-700">
            {proposal.proposalType}
          </span>
          <p className="mt-1 font-medium">{proposal.title}</p>
        </div>
        <button onClick={() => setExpanded(!expanded)} className="text-muted-foreground hover:text-foreground">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-2 space-y-1 text-xs text-muted-foreground">
          <p><strong>Motivation:</strong> {proposal.motivation}</p>
          <p><strong>Expected Benefit:</strong> {proposal.expectedBenefit}</p>
          {proposal.estimatedCost && <p><strong>Estimated Cost:</strong> {proposal.estimatedCost}</p>}
        </div>
      )}

      {canAct && !rejecting && (
        <div className="mt-2 flex gap-2">
          <button
            onClick={() => onApprove(proposal.id)}
            className="flex items-center gap-1 rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
            data-testid="ceo-approve-btn"
          >
            <Check className="h-3 w-3" /> Approve
          </button>
          <button
            onClick={() => setRejecting(true)}
            className="flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
            data-testid="ceo-reject-btn"
          >
            <X className="h-3 w-3" /> Reject
          </button>
        </div>
      )}

      {rejecting && (
        <div className="mt-2 space-y-2">
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Reason for rejection..."
            className="w-full rounded-md border bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
            rows={2}
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                onReject(proposal.id, rejectReason || 'Rejected')
                setRejecting(false)
                setRejectReason('')
              }}
              className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700"
            >
              Confirm Rejection
            </button>
            <button
              onClick={() => { setRejecting(false); setRejectReason('') }}
              className="rounded-md border px-3 py-1 text-xs hover:bg-accent"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {!canAct && (
        <p className="mt-2 text-xs capitalize text-muted-foreground">{proposal.status}</p>
      )}
    </div>
  )
}
