import { useEffect, useRef } from 'react'
import type { EdgeType, VisualNodeDto } from '@the-crew/shared-types'
import { getEdgeTypeLabel, findNodeInGraph } from './inspector/inspector-utils'
import { useFocusTrap } from '@/hooks/use-focus-trap'

export interface EdgeDeleteConfirmProps {
  edgeType: EdgeType
  sourceNodeId: string
  targetNodeId: string
  allNodes: VisualNodeDto[]
  isPending?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function EdgeDeleteConfirm({
  edgeType,
  sourceNodeId,
  targetNodeId,
  allNodes,
  isPending = false,
  onConfirm,
  onCancel,
}: EdgeDeleteConfirmProps) {
  const sourceNode = findNodeInGraph(sourceNodeId, allNodes)
  const targetNode = findNodeInGraph(targetNodeId, allNodes)
  const sourceLabel = sourceNode?.label ?? sourceNodeId
  const targetLabel = targetNode?.label ?? targetNodeId
  const dialogRef = useRef<HTMLDivElement>(null)

  useFocusTrap(dialogRef, true)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onCancel])

  return (
    <div
      data-testid="edge-delete-confirm-backdrop"
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/10"
      onClick={onCancel}
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="edge-delete-title"
        data-testid="edge-delete-confirm"
        className="w-80 rounded-lg border bg-card p-4 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h4 id="edge-delete-title" className="text-sm font-semibold text-foreground">Delete relationship?</h4>
        <p className="mt-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{sourceLabel}</span>
          <span className="mx-1">&rarr;</span>
          <span className="italic">{getEdgeTypeLabel(edgeType)}</span>
          <span className="mx-1">&rarr;</span>
          <span className="font-medium text-foreground">{targetLabel}</span>
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          This action will update the underlying entity data.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            data-testid="delete-cancel-btn"
            onClick={onCancel}
            disabled={isPending}
            className="rounded px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            Cancel
          </button>
          <button
            type="button"
            data-testid="delete-confirm-btn"
            onClick={onConfirm}
            disabled={isPending}
            className="rounded bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
          >
            {isPending ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
