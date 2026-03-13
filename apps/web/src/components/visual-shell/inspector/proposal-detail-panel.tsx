import { MessageSquarePlus, Check, X } from 'lucide-react'
import { useProposal, useApproveProposal, useRejectProposal } from '@/hooks/use-proposals'
import { useState } from 'react'

interface ProposalDetailPanelProps {
  entityId: string
  projectId: string
}

export function ProposalDetailPanel({ entityId, projectId }: ProposalDetailPanelProps) {
  const { data: proposal, isLoading } = useProposal(projectId, entityId)
  const approveMutation = useApproveProposal(projectId)
  const rejectMutation = useRejectProposal(projectId)
  const [rejectReason, setRejectReason] = useState('')
  const [showReject, setShowReject] = useState(false)

  if (isLoading) return <p className="text-xs text-muted-foreground">Loading...</p>
  if (!proposal) return <p className="text-xs text-muted-foreground">Not found</p>

  const canAct = proposal.status === 'proposed' || proposal.status === 'under-review'

  return (
    <div className="space-y-3" data-testid="proposal-detail-panel">
      <div className="flex items-center gap-2">
        <MessageSquarePlus className="h-4 w-4 text-muted-foreground" />
        <span className="inline-flex rounded bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-blue-700">
          {proposal.proposalType}
        </span>
        <span className="text-xs capitalize text-muted-foreground">{proposal.status}</span>
      </div>

      <div>
        <h4 className="text-sm font-semibold">{proposal.title}</h4>
      </div>

      <div>
        <h5 className="text-xs font-medium text-muted-foreground">Motivation</h5>
        <p className="mt-0.5 text-xs">{proposal.motivation}</p>
      </div>

      <div>
        <h5 className="text-xs font-medium text-muted-foreground">Expected Benefit</h5>
        <p className="mt-0.5 text-xs">{proposal.expectedBenefit}</p>
      </div>

      {proposal.estimatedCost && (
        <div>
          <h5 className="text-xs font-medium text-muted-foreground">Estimated Cost</h5>
          <p className="mt-0.5 text-xs">{proposal.estimatedCost}</p>
        </div>
      )}

      {proposal.proposedByAgentId && (
        <div>
          <h5 className="text-xs font-medium text-muted-foreground">Proposed By</h5>
          <p className="mt-0.5 text-xs font-mono">{proposal.proposedByAgentId}</p>
        </div>
      )}

      {proposal.rejectionReason && (
        <div>
          <h5 className="text-xs font-medium text-muted-foreground">Rejection Reason</h5>
          <p className="mt-0.5 text-xs text-red-600">{proposal.rejectionReason}</p>
        </div>
      )}

      {canAct && !showReject && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => approveMutation.mutate({ proposalId: entityId, approvedByUserId: 'founder' })}
            className="flex items-center gap-1 rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
            data-testid="proposal-approve-btn"
          >
            <Check className="h-3 w-3" /> Approve
          </button>
          <button
            onClick={() => setShowReject(true)}
            className="flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
            data-testid="proposal-reject-btn"
          >
            <X className="h-3 w-3" /> Reject
          </button>
        </div>
      )}

      {showReject && (
        <div className="space-y-2 pt-1">
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
                rejectMutation.mutate({ proposalId: entityId, reason: rejectReason || 'Rejected' })
                setShowReject(false)
                setRejectReason('')
              }}
              className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700"
            >
              Confirm
            </button>
            <button
              onClick={() => { setShowReject(false); setRejectReason('') }}
              className="rounded-md border px-3 py-1 text-xs hover:bg-accent"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
