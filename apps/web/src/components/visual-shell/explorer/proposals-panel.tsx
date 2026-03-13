import { useEffect } from 'react'
import { useProposalsStore } from '@/stores/proposals-store'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'
import { Check, X, Clock, AlertTriangle, FileText } from 'lucide-react'
import type { ProposalDto, ProposalStatus } from '@the-crew/shared-types'

const STATUS_CONFIG: Record<ProposalStatus, { label: string; color: string; icon: typeof Clock }> = {
  draft: { label: 'Draft', color: 'text-gray-500', icon: FileText },
  proposed: { label: 'Proposed', color: 'text-blue-500', icon: Clock },
  'under-review': { label: 'Under Review', color: 'text-amber-500', icon: AlertTriangle },
  approved: { label: 'Approved', color: 'text-green-500', icon: Check },
  rejected: { label: 'Rejected', color: 'text-red-500', icon: X },
  implemented: { label: 'Implemented', color: 'text-emerald-600', icon: Check },
  superseded: { label: 'Superseded', color: 'text-gray-400', icon: FileText },
}

function ProposalCard({ proposal, projectId }: { proposal: ProposalDto; projectId: string }) {
  const approve = useProposalsStore(s => s.approveProposal)
  const reject = useProposalsStore(s => s.rejectProposal)
  const config = STATUS_CONFIG[proposal.status]
  const StatusIcon = config.icon

  const canAct = proposal.status === 'proposed' || proposal.status === 'under-review'

  return (
    <div className="rounded-md border bg-card p-2.5 text-sm" data-testid="proposal-card">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <span className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-xs font-medium">
            {proposal.proposalType}
          </span>
          <p className="mt-1 font-medium truncate">{proposal.title}</p>
        </div>
        <StatusIcon className={`h-4 w-4 flex-shrink-0 ${config.color}`} />
      </div>
      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{proposal.motivation}</p>
      {canAct && (
        <div className="mt-2 flex gap-1.5">
          <button
            onClick={() => approve(projectId, proposal.id, 'founder')}
            className="flex items-center gap-1 rounded bg-green-50 px-2 py-1 text-xs text-green-700 hover:bg-green-100"
            data-testid="approve-btn"
          >
            <Check className="h-3 w-3" /> Approve
          </button>
          <button
            onClick={() => reject(projectId, proposal.id, 'Rejected by founder')}
            className="flex items-center gap-1 rounded bg-red-50 px-2 py-1 text-xs text-red-700 hover:bg-red-100"
            data-testid="reject-btn"
          >
            <X className="h-3 w-3" /> Reject
          </button>
        </div>
      )}
    </div>
  )
}

export function ProposalsPanel() {
  const projectId = useVisualWorkspaceStore(s => s.projectId)
  const proposals = useProposalsStore(s => s.proposals)
  const loading = useProposalsStore(s => s.loading)
  const loadProposals = useProposalsStore(s => s.loadProposals)

  useEffect(() => {
    if (projectId) loadProposals(projectId)
  }, [projectId, loadProposals])

  if (!projectId) return <div className="p-3 text-sm text-muted-foreground">No project selected</div>

  const pending = proposals.filter(p => p.status === 'proposed' || p.status === 'under-review')
  const approved = proposals.filter(p => p.status === 'approved' || p.status === 'implemented')
  const rejected = proposals.filter(p => p.status === 'rejected' || p.status === 'superseded')
  const drafts = proposals.filter(p => p.status === 'draft')

  return (
    <div className="flex flex-col gap-3 p-3" data-testid="proposals-panel">
      {loading && <p className="text-xs text-muted-foreground">Loading proposals...</p>}

      {!loading && proposals.length === 0 && (
        <p className="text-sm text-muted-foreground">No proposals yet. The CEO will propose structural changes as the company grows.</p>
      )}

      {pending.length > 0 && (
        <section>
          <h4 className="mb-1.5 text-xs font-semibold uppercase text-muted-foreground">
            Pending ({pending.length})
          </h4>
          <div className="space-y-2">
            {pending.map(p => <ProposalCard key={p.id} proposal={p} projectId={projectId} />)}
          </div>
        </section>
      )}

      {approved.length > 0 && (
        <section>
          <h4 className="mb-1.5 text-xs font-semibold uppercase text-muted-foreground">
            Approved ({approved.length})
          </h4>
          <div className="space-y-2">
            {approved.map(p => <ProposalCard key={p.id} proposal={p} projectId={projectId} />)}
          </div>
        </section>
      )}

      {rejected.length > 0 && (
        <section>
          <h4 className="mb-1.5 text-xs font-semibold uppercase text-muted-foreground">
            Rejected ({rejected.length})
          </h4>
          <div className="space-y-2">
            {rejected.map(p => <ProposalCard key={p.id} proposal={p} projectId={projectId} />)}
          </div>
        </section>
      )}

      {drafts.length > 0 && (
        <section>
          <h4 className="mb-1.5 text-xs font-semibold uppercase text-muted-foreground">
            Drafts ({drafts.length})
          </h4>
          <div className="space-y-2">
            {drafts.map(p => <ProposalCard key={p.id} proposal={p} projectId={projectId} />)}
          </div>
        </section>
      )}
    </div>
  )
}
