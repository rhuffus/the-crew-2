import { ArrowRight, ArrowLeftRight } from 'lucide-react'
import type { ReleaseDto, VisualDiffSummary } from '@the-crew/shared-types'

export interface DiffSelectorProps {
  releases: ReleaseDto[]
  baseReleaseId: string | null
  compareReleaseId: string | null
  summary: VisualDiffSummary | null
  onBaseChange: (releaseId: string) => void
  onCompareChange: (releaseId: string) => void
  onSwap: () => void
}

export function DiffSelector({
  releases,
  baseReleaseId,
  compareReleaseId,
  summary,
  onBaseChange,
  onCompareChange,
  onSwap,
}: DiffSelectorProps) {
  const publishedReleases = releases.filter((r) => r.status === 'published')

  return (
    <div
      data-testid="diff-selector"
      className="flex flex-wrap items-center gap-3 border-b border-border bg-card px-4 py-2"
    >
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-muted-foreground">Base:</label>
        <select
          data-testid="diff-base-select"
          value={baseReleaseId ?? ''}
          onChange={(e) => onBaseChange(e.target.value)}
          className="rounded border border-border bg-background px-2 py-1 text-sm"
        >
          <option value="">Select release...</option>
          {publishedReleases.map((r) => (
            <option key={r.id} value={r.id}>
              {r.version}
            </option>
          ))}
        </select>
      </div>

      <ArrowRight className="h-4 w-4 text-muted-foreground" />

      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-muted-foreground">Compare:</label>
        <select
          data-testid="diff-compare-select"
          value={compareReleaseId ?? ''}
          onChange={(e) => onCompareChange(e.target.value)}
          className="rounded border border-border bg-background px-2 py-1 text-sm"
        >
          <option value="">Select release...</option>
          {publishedReleases.map((r) => (
            <option key={r.id} value={r.id}>
              {r.version}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        data-testid="diff-swap-button"
        onClick={onSwap}
        disabled={!baseReleaseId || !compareReleaseId}
        className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
        title="Swap base and compare"
      >
        <ArrowLeftRight className="h-4 w-4" />
      </button>

      {summary && (
        <div data-testid="diff-summary" className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
          <span>
            <span className="font-medium text-green-600">+{summary.nodesAdded}</span>
            {' '}
            <span className="font-medium text-red-600">−{summary.nodesRemoved}</span>
            {' '}
            <span className="font-medium text-amber-600">~{summary.nodesModified}</span>
            {' nodes'}
          </span>
          <span>
            <span className="font-medium text-green-600">+{summary.edgesAdded}</span>
            {' '}
            <span className="font-medium text-red-600">−{summary.edgesRemoved}</span>
            {' '}
            <span className="font-medium text-amber-600">~{summary.edgesModified}</span>
            {' edges'}
          </span>
        </div>
      )}
    </div>
  )
}
