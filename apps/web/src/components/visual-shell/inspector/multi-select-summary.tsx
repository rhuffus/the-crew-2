import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import type { SelectionSummary } from './inspector-utils'
import { getNodeTypeLabel } from './inspector-utils'
import type { NodeType } from '@the-crew/shared-types'

export interface MultiSelectSummaryProps {
  summary: SelectionSummary
  onDeleteSelected?: () => void
  selectedNodeCount?: number
}

export function MultiSelectSummary({ summary, onDeleteSelected, selectedNodeCount = 0 }: MultiSelectSummaryProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const entries = Object.entries(summary.countByType)

  const handleDelete = () => {
    if (confirmDelete) {
      onDeleteSelected?.()
      setConfirmDelete(false)
    } else {
      setConfirmDelete(true)
    }
  }

  return (
    <div data-testid="multi-select-summary" className="space-y-3">
      <p className="text-sm font-medium text-foreground">
        {summary.count} items selected
      </p>
      <ul className="space-y-1">
        {entries.map(([type, count]) => (
          <li
            key={type}
            className="flex items-center justify-between rounded border border-border px-2 py-1.5"
          >
            <span className="text-xs text-foreground">
              {type === 'edge' ? 'Edges' : getNodeTypeLabel(type as NodeType)}
            </span>
            <span className="text-xs font-medium text-muted-foreground">{count}</span>
          </li>
        ))}
      </ul>

      {onDeleteSelected && selectedNodeCount > 0 && (
        <div className="border-t border-border pt-2">
          <h5 className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Bulk Actions
          </h5>
          {confirmDelete ? (
            <div className="space-y-1.5">
              <p className="text-xs text-destructive">
                Delete {selectedNodeCount} selected node{selectedNodeCount !== 1 ? 's' : ''}?
              </p>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  data-testid="confirm-bulk-delete"
                  onClick={handleDelete}
                  className="rounded bg-destructive px-2 py-1 text-xs text-destructive-foreground hover:bg-destructive/90"
                >
                  Confirm Delete
                </button>
                <button
                  type="button"
                  data-testid="cancel-bulk-delete"
                  onClick={() => setConfirmDelete(false)}
                  className="rounded border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-accent"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              data-testid="bulk-delete-btn"
              onClick={handleDelete}
              className="flex items-center gap-1.5 rounded border border-border px-2 py-1.5 text-xs text-muted-foreground hover:border-destructive hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
              Delete Selected
            </button>
          )}
        </div>
      )}
    </div>
  )
}
