import { CheckCircle2, AlertOctagon, Clock } from 'lucide-react'
import type { NodeType, ReviewStatus } from '@the-crew/shared-types'
import { useReviewByEntity, useCreateReview, useUpdateReview } from '@/hooks/use-collaboration'
import { usePermission } from '@/hooks/use-permissions'

export interface ReviewIndicatorProps {
  projectId: string
  entityId: string
  nodeType: NodeType
}

const STATUS_CONFIG: Record<ReviewStatus, { icon: typeof CheckCircle2; label: string; className: string }> = {
  approved: { icon: CheckCircle2, label: 'Approved', className: 'bg-green-50 border-green-200 text-green-700' },
  'needs-changes': { icon: AlertOctagon, label: 'Needs Changes', className: 'bg-amber-50 border-amber-200 text-amber-700' },
  pending: { icon: Clock, label: 'Pending Review', className: 'bg-blue-50 border-blue-200 text-blue-700' },
}

export function ReviewIndicator({ projectId, entityId, nodeType }: ReviewIndicatorProps) {
  const { data: review } = useReviewByEntity(projectId, entityId)
  const createReview = useCreateReview(projectId)
  const updateReview = useUpdateReview(projectId)
  const canReview = usePermission('review:create')

  const handleSetStatus = (status: ReviewStatus) => {
    if (review) {
      updateReview.mutate({ id: review.id, dto: { status } })
    } else {
      createReview.mutate({
        entityId,
        nodeType,
        status,
        reviewerId: 'current-user', // TODO: real user from auth context
        reviewerName: 'You',
      })
    }
  }

  const isPending = createReview.isPending || updateReview.isPending

  if (review) {
    const config = STATUS_CONFIG[review.status]
    const Icon = config.icon
    return (
      <div data-testid="review-indicator" className="space-y-1.5">
        <div className={`flex items-center gap-1.5 rounded border px-2 py-1 ${config.className}`}>
          <Icon className="h-3 w-3" />
          <span className="text-[11px] font-medium">{config.label}</span>
          <span className="text-[10px] opacity-70">by {review.reviewerName}</span>
        </div>
        {canReview && (
          <div className="flex gap-1" data-testid="review-actions">
            {review.status !== 'approved' && (
              <button
                type="button"
                data-testid="approve-btn"
                onClick={() => handleSetStatus('approved')}
                disabled={isPending}
                className="rounded border border-green-200 bg-green-50 px-2 py-0.5 text-[10px] text-green-700 hover:bg-green-100"
              >
                Approve
              </button>
            )}
            {review.status !== 'needs-changes' && (
              <button
                type="button"
                data-testid="needs-changes-btn"
                onClick={() => handleSetStatus('needs-changes')}
                disabled={isPending}
                className="rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] text-amber-700 hover:bg-amber-100"
              >
                Needs Changes
              </button>
            )}
          </div>
        )}
      </div>
    )
  }

  if (canReview) {
    return (
      <div data-testid="review-indicator-empty" className="flex gap-1">
        <button
          type="button"
          data-testid="request-review-btn"
          onClick={() => handleSetStatus('pending')}
          disabled={isPending}
          className="flex items-center gap-1 rounded border border-border px-2 py-1 text-[11px] text-muted-foreground hover:bg-accent"
        >
          <Clock className="h-3 w-3" />
          Request Review
        </button>
      </div>
    )
  }

  return null
}
