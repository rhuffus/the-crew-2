import type { AuditEntryDto } from '@the-crew/shared-types'
import { AuditEntryRow } from './audit-entry-row'

interface AuditListProps {
  entries: AuditEntryDto[]
}

export function AuditList({ entries }: AuditListProps) {
  if (entries.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">No audit entries found.</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-card">
      {entries.map((entry) => (
        <AuditEntryRow key={entry.id} entry={entry} />
      ))}
    </div>
  )
}
