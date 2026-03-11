import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useAudit } from '@/hooks/use-audit'
import { AuditList } from '@/components/audit/audit-list'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

const ENTITY_TYPES = [
  'companyModel',
  'department',
  'capability',
  'role',
  'agentArchetype',
  'agentAssignment',
  'skill',
  'contract',
  'workflow',
  'policy',
  'release',
]

export const Route = createFileRoute('/projects/$projectId/admin/audit')({
  component: AuditPage,
})

function AuditPage() {
  const { projectId } = Route.useParams()
  const [entityType, setEntityType] = useState('')
  const { data, isLoading, error, refetch, isFetching } = useAudit(
    projectId,
    entityType || undefined,
  )

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-medium text-foreground">Audit Log</h3>
        <div className="flex items-center gap-2">
          <select
            value={entityType}
            onChange={(e) => setEntityType(e.target.value)}
            className="rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Filter by entity type"
          >
            <option value="">All entities</option>
            {ENTITY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`mr-1.5 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {isLoading && <p className="text-muted-foreground">Loading audit log...</p>}
      {error && <p className="text-destructive">Failed to load audit log.</p>}
      {data && <AuditList entries={data} />}
    </div>
  )
}
