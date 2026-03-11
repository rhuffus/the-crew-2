import {
  Play,
  Pause,
  XCircle,
  AlertOctagon,
  Shield,
  ShieldAlert,
  ShieldX,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react'
import type {
  NodeType,
  OperationStatus,
  ComplianceStatus,
  OperationBadge,
} from '@the-crew/shared-types'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'

export interface OperationsTabProps {
  entityId: string
  nodeType: NodeType
  projectId: string
}

const STATUS_CONFIG: Record<OperationStatus, { label: string; colorClass: string; icon: React.ReactNode }> = {
  idle: {
    label: 'Idle',
    colorClass: 'bg-gray-100 text-gray-700',
    icon: <Pause className="h-3 w-3" />,
  },
  running: {
    label: 'Running',
    colorClass: 'bg-blue-100 text-blue-700',
    icon: <Play className="h-3 w-3" />,
  },
  blocked: {
    label: 'Blocked',
    colorClass: 'bg-yellow-100 text-yellow-700',
    icon: <AlertOctagon className="h-3 w-3" />,
  },
  failed: {
    label: 'Failed',
    colorClass: 'bg-red-100 text-red-700',
    icon: <XCircle className="h-3 w-3" />,
  },
  completed: {
    label: 'Completed',
    colorClass: 'bg-green-100 text-green-700',
    icon: <CheckCircle className="h-3 w-3" />,
  },
}

const COMPLIANCE_CONFIG: Record<ComplianceStatus, { label: string; colorClass: string; icon: React.ReactNode }> = {
  compliant: {
    label: 'Compliant',
    colorClass: 'bg-green-100 text-green-700',
    icon: <ShieldCheck className="h-3 w-3" />,
  },
  'at-risk': {
    label: 'At Risk',
    colorClass: 'bg-yellow-100 text-yellow-700',
    icon: <ShieldAlert className="h-3 w-3" />,
  },
  violated: {
    label: 'Violated',
    colorClass: 'bg-red-100 text-red-700',
    icon: <ShieldX className="h-3 w-3" />,
  },
}

const BADGE_SEVERITY_CLASS: Record<OperationBadge['severity'], string> = {
  info: 'bg-blue-50 text-blue-700',
  warning: 'bg-yellow-50 text-yellow-700',
  critical: 'bg-red-50 text-red-700',
}

export function OperationsTab({ entityId, nodeType, projectId }: OperationsTabProps) {
  const operationsStatus = useVisualWorkspaceStore((s) => s.operationsStatus)

  // Suppress unused variable warnings — props kept for future use
  void projectId

  const entityOps = operationsStatus?.entities.find((e) => e.entityId === entityId)

  if (!entityOps) {
    return (
      <div data-testid="operations-tab" className="space-y-3">
        <div className="flex items-center gap-2 rounded bg-gray-50 p-2 text-gray-500">
          <Shield className="h-4 w-4 shrink-0" />
          <span className="text-xs font-medium">
            Enable operations overlay to see runtime state
          </span>
        </div>
      </div>
    )
  }

  const statusCfg = STATUS_CONFIG[entityOps.operationStatus]

  return (
    <div data-testid="operations-tab" className="space-y-3">
      {/* Operation status badge */}
      <div className="space-y-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Status
        </span>
        <div
          data-testid="operation-status-badge"
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusCfg.colorClass}`}
        >
          {statusCfg.icon}
          {statusCfg.label}
        </div>
      </div>

      {/* Metrics */}
      <div className="space-y-1.5">
        {/* Active runs — relevant for workflows */}
        {(nodeType === 'workflow' || entityOps.activeRunCount > 0) && (
          <div data-testid="active-run-count" className="flex items-center justify-between rounded bg-muted/50 px-2 py-1.5 text-xs">
            <span className="text-muted-foreground">Active runs</span>
            <span className="font-medium">{entityOps.activeRunCount}</span>
          </div>
        )}

        {/* Incident count */}
        <div data-testid="incident-count" className="flex items-center justify-between rounded bg-muted/50 px-2 py-1.5 text-xs">
          <span className="text-muted-foreground">Incidents</span>
          <span className={`font-medium ${entityOps.incidentCount > 0 ? 'text-red-600' : ''}`}>
            {entityOps.incidentCount}
          </span>
        </div>

        {/* Queue depth — relevant for stages */}
        {(nodeType === 'workflow-stage' || entityOps.queueDepth > 0) && (
          <div data-testid="queue-depth" className="flex items-center justify-between rounded bg-muted/50 px-2 py-1.5 text-xs">
            <span className="text-muted-foreground">Queue depth</span>
            <span className="font-medium">{entityOps.queueDepth}</span>
          </div>
        )}

        {/* Compliance status — relevant for contracts */}
        {entityOps.complianceStatus && (
          <div data-testid="compliance-status" className="flex items-center justify-between rounded bg-muted/50 px-2 py-1.5 text-xs">
            <span className="text-muted-foreground">Compliance</span>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${COMPLIANCE_CONFIG[entityOps.complianceStatus].colorClass}`}
            >
              {COMPLIANCE_CONFIG[entityOps.complianceStatus].icon}
              {COMPLIANCE_CONFIG[entityOps.complianceStatus].label}
            </span>
          </div>
        )}
      </div>

      {/* Badges */}
      {entityOps.badges.length > 0 && (
        <div className="space-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Badges
          </span>
          <div data-testid="operation-badges" className="flex flex-wrap gap-1.5">
            {entityOps.badges.map((badge, idx) => (
              <span
                key={idx}
                data-testid={`operation-badge-${idx}`}
                className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium ${BADGE_SEVERITY_CLASS[badge.severity]}`}
              >
                {badge.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
