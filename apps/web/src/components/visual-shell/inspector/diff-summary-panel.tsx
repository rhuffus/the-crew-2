import type { VisualDiffSummary } from '@the-crew/shared-types'

export interface DiffSummaryPanelProps {
  summary: VisualDiffSummary
}

export function DiffSummaryPanel({ summary }: DiffSummaryPanelProps) {
  return (
    <div data-testid="diff-summary-panel" className="space-y-4">
      <div>
        <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Diff Summary
        </h4>
      </div>

      <div>
        <h4 className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Nodes
        </h4>
        <div className="grid grid-cols-2 gap-1 text-xs">
          <span className="text-green-600">+{summary.nodesAdded} added</span>
          <span className="text-red-600">−{summary.nodesRemoved} removed</span>
          <span className="text-amber-600">~{summary.nodesModified} modified</span>
          <span className="text-muted-foreground">{summary.nodesUnchanged} unchanged</span>
        </div>
      </div>

      <div>
        <h4 className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Edges
        </h4>
        <div className="grid grid-cols-2 gap-1 text-xs">
          <span className="text-green-600">+{summary.edgesAdded} added</span>
          <span className="text-red-600">−{summary.edgesRemoved} removed</span>
          <span className="text-amber-600">~{summary.edgesModified} modified</span>
          <span className="text-muted-foreground">{summary.edgesUnchanged} unchanged</span>
        </div>
      </div>
    </div>
  )
}
