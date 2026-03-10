import type { SelectionSummary } from './inspector-utils'
import { getNodeTypeLabel } from './inspector-utils'
import type { NodeType } from '@the-crew/shared-types'

export interface MultiSelectSummaryProps {
  summary: SelectionSummary
}

export function MultiSelectSummary({ summary }: MultiSelectSummaryProps) {
  const entries = Object.entries(summary.countByType)

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
    </div>
  )
}
