import { Plus, Minus, PenLine } from 'lucide-react'
import type { VisualDiffStatus } from '@the-crew/shared-types'

export interface ChangesTabProps {
  diffStatus: VisualDiffStatus
  changes?: Record<string, { before: unknown; after: unknown }>
  label: string
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '—'
  if (Array.isArray(value)) return value.join(', ') || '(empty)'
  return String(value)
}

const STATUS_CONFIG: Record<VisualDiffStatus, { label: string; icon: typeof Plus; colorClass: string; bgClass: string }> = {
  added: { label: 'New entity', icon: Plus, colorClass: 'text-green-700', bgClass: 'bg-green-50' },
  removed: { label: 'Deleted entity', icon: Minus, colorClass: 'text-red-700', bgClass: 'bg-red-50' },
  modified: { label: 'Modified entity', icon: PenLine, colorClass: 'text-amber-700', bgClass: 'bg-amber-50' },
  unchanged: { label: 'Unchanged', icon: PenLine, colorClass: 'text-gray-500', bgClass: 'bg-gray-50' },
}

export function ChangesTab({ diffStatus, changes, label }: ChangesTabProps) {
  const config = STATUS_CONFIG[diffStatus]
  const Icon = config.icon

  return (
    <div data-testid="changes-tab" className="space-y-3">
      <div className={`flex items-center gap-2 rounded p-2 ${config.bgClass}`}>
        <Icon className={`h-4 w-4 ${config.colorClass}`} />
        <span className={`text-sm font-medium ${config.colorClass}`}>{config.label}</span>
      </div>

      {diffStatus === 'added' && (
        <p className="text-xs text-muted-foreground">
          All fields are additions for <span className="font-medium">{label}</span>.
        </p>
      )}

      {diffStatus === 'removed' && (
        <p className="text-xs text-muted-foreground">
          All fields were removed for <span className="font-medium">{label}</span>.
        </p>
      )}

      {diffStatus === 'unchanged' && (
        <p className="text-xs text-muted-foreground">No changes detected.</p>
      )}

      {diffStatus === 'modified' && changes && Object.keys(changes).length > 0 && (
        <div className="space-y-3">
          {Object.entries(changes).map(([field, { before, after }]) => (
            <div key={field} data-testid={`change-field-${field}`} className="space-y-1">
              <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {field}
              </dt>
              <dd className="space-y-0.5 text-xs">
                <div className="flex items-start gap-1.5 rounded bg-red-50 p-1.5 text-red-700">
                  <Minus className="mt-0.5 h-3 w-3 shrink-0" />
                  <span>{formatValue(before)}</span>
                </div>
                <div className="flex items-start gap-1.5 rounded bg-green-50 p-1.5 text-green-700">
                  <Plus className="mt-0.5 h-3 w-3 shrink-0" />
                  <span>{formatValue(after)}</span>
                </div>
              </dd>
            </div>
          ))}
        </div>
      )}

      {diffStatus === 'modified' && (!changes || Object.keys(changes).length === 0) && (
        <p className="text-xs text-muted-foreground">
          Entity was modified but no visual field changes detected.
        </p>
      )}
    </div>
  )
}
