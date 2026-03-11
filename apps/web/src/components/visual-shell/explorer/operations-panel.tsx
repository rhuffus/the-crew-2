import { Activity, Play, AlertOctagon, Shield, Pause, XCircle } from 'lucide-react'
import type { OperationsStatusDto, ComplianceStatus } from '@the-crew/shared-types'

interface OperationsPanelProps {
  projectId: string
  operationsStatus: OperationsStatusDto | null
  onFocusNode: (visualNodeId: string) => void
}

const COMPLIANCE_COLORS: Record<ComplianceStatus, string> = {
  compliant: 'text-green-600',
  'at-risk': 'text-amber-600',
  violated: 'text-red-600',
}

const COMPLIANCE_LABELS: Record<ComplianceStatus, string> = {
  compliant: 'Compliant',
  'at-risk': 'At Risk',
  violated: 'Violated',
}

export function OperationsPanel({ projectId: _projectId, operationsStatus, onFocusNode }: OperationsPanelProps) {
  if (!operationsStatus) {
    return (
      <div data-testid="operations-panel" className="p-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Activity className="h-3 w-3 animate-spin" />
          Loading operations status...
        </div>
      </div>
    )
  }

  const { summary, entities } = operationsStatus
  const activeRuns = entities.filter((e) => e.activeRunCount > 0)
  const incidents = entities.filter((e) => e.incidentCount > 0)
  const compliance = entities.filter((e) => e.complianceStatus !== null)

  return (
    <div data-testid="operations-panel" className="p-3">
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Operations
      </h4>

      {/* Summary */}
      <div data-testid="ops-summary" className="mb-4 grid grid-cols-2 gap-2">
        <div className="rounded border border-border p-2">
          <div className="flex items-center gap-1">
            <Play className="h-3.5 w-3.5 text-blue-600" />
            <span className="text-lg font-semibold text-blue-600">{summary.totalActiveRuns}</span>
          </div>
          <div className="text-xs text-muted-foreground">Active Runs</div>
        </div>
        <div className="rounded border border-border p-2">
          <div className="flex items-center gap-1">
            <Pause className="h-3.5 w-3.5 text-amber-600" />
            <span className="text-lg font-semibold text-amber-600">{summary.totalBlockedStages}</span>
          </div>
          <div className="text-xs text-muted-foreground">Blocked</div>
        </div>
        <div className="rounded border border-border p-2">
          <div className="flex items-center gap-1">
            <XCircle className="h-3.5 w-3.5 text-red-600" />
            <span className="text-lg font-semibold text-red-600">{summary.totalFailedRuns}</span>
          </div>
          <div className="text-xs text-muted-foreground">Failed</div>
        </div>
        <div className="rounded border border-border p-2">
          <div className="flex items-center gap-1">
            <AlertOctagon className="h-3.5 w-3.5 text-orange-600" />
            <span className="text-lg font-semibold text-orange-600">{summary.totalOpenIncidents}</span>
          </div>
          <div className="text-xs text-muted-foreground">Incidents</div>
        </div>
        <div className="col-span-2 rounded border border-border p-2">
          <div className="flex items-center gap-1">
            <Shield className="h-3.5 w-3.5 text-red-600" />
            <span className="text-lg font-semibold text-red-600">{summary.totalComplianceViolations}</span>
          </div>
          <div className="text-xs text-muted-foreground">Compliance Violations</div>
        </div>
      </div>

      {/* Active Runs */}
      <div data-testid="ops-active-runs" className="mb-4">
        <h5 className="mb-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
          <Play className="h-3 w-3" />
          Active Runs
        </h5>
        {activeRuns.length === 0 ? (
          <p className="px-2 text-xs text-muted-foreground">No active runs</p>
        ) : (
          <ul className="space-y-0.5">
            {activeRuns.map((entity) => (
              <li key={entity.visualNodeId}>
                <button
                  type="button"
                  onClick={() => onFocusNode(entity.visualNodeId)}
                  className="flex w-full items-center justify-between rounded px-2 py-1 text-sm hover:bg-accent"
                >
                  <span className="truncate text-foreground">{entity.entityId}</span>
                  <span className="ml-2 shrink-0 rounded-full bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700">
                    {entity.activeRunCount}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Incidents */}
      <div data-testid="ops-incidents" className="mb-4">
        <h5 className="mb-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
          <AlertOctagon className="h-3 w-3" />
          Incidents
        </h5>
        {incidents.length === 0 ? (
          <p className="px-2 text-xs text-muted-foreground">No open incidents</p>
        ) : (
          <ul className="space-y-0.5">
            {incidents.map((entity) => {
              const severity = entity.incidentCount >= 3 ? 'text-red-600' : entity.incidentCount >= 2 ? 'text-orange-600' : 'text-amber-600'
              return (
                <li key={entity.visualNodeId}>
                  <button
                    type="button"
                    onClick={() => onFocusNode(entity.visualNodeId)}
                    className="flex w-full items-center justify-between rounded px-2 py-1 text-sm hover:bg-accent"
                  >
                    <span className="truncate text-foreground">{entity.entityId}</span>
                    <span className={`ml-2 shrink-0 text-xs font-medium ${severity}`}>
                      {entity.incidentCount} incident{entity.incidentCount !== 1 ? 's' : ''}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Compliance */}
      <div data-testid="ops-compliance">
        <h5 className="mb-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
          <Shield className="h-3 w-3" />
          Compliance
        </h5>
        {compliance.length === 0 ? (
          <p className="px-2 text-xs text-muted-foreground">No compliance data</p>
        ) : (
          <ul className="space-y-0.5">
            {compliance.map((entity) => {
              const status = entity.complianceStatus!
              return (
                <li key={entity.visualNodeId}>
                  <button
                    type="button"
                    onClick={() => onFocusNode(entity.visualNodeId)}
                    className="flex w-full items-center justify-between rounded px-2 py-1 text-sm hover:bg-accent"
                  >
                    <span className="truncate text-foreground">{entity.entityId}</span>
                    <span className={`ml-2 shrink-0 text-xs font-medium ${COMPLIANCE_COLORS[status]}`}>
                      {COMPLIANCE_LABELS[status]}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
