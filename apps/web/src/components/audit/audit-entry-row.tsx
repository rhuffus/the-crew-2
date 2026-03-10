import type { AuditEntryDto } from '@the-crew/shared-types'
import { Badge } from '@/components/ui/badge'

const actionVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  created: 'default',
  updated: 'secondary',
  deleted: 'destructive',
  published: 'outline',
}

export function AuditEntryRow({ entry }: { entry: AuditEntryDto }) {
  const date = new Date(entry.timestamp)
  const time = date.toLocaleString()

  return (
    <div className="flex items-start gap-4 border-b px-4 py-3 last:border-b-0">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{entry.entityName}</span>
          <Badge variant={actionVariant[entry.action] ?? 'secondary'}>{entry.action}</Badge>
          <Badge variant="outline">{entry.entityType}</Badge>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{time}</p>
        {entry.changes && Object.keys(entry.changes).length > 0 && (
          <details className="mt-2">
            <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
              Changes
            </summary>
            <pre className="mt-1 overflow-x-auto rounded bg-muted p-2 text-xs">
              {JSON.stringify(entry.changes, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}
