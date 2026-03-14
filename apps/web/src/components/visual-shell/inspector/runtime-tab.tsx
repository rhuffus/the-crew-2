import {
  Play,
  Pause,
  XCircle,
  AlertOctagon,
  Clock,
  DollarSign,
  Activity,
  AlertTriangle,
} from 'lucide-react'
import { useMemo } from 'react'
import type { NodeType, NodeRuntimeState, RuntimeEventDto, EventSeverity } from '@the-crew/shared-types'
import { useRuntimeStatusStore } from '@/stores/runtime-status-store'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'
import { useRuntimeExecutions } from '@/hooks/use-runtime-executions'
import { RuntimeBadges } from '../runtime-badges'
import { ExecutionDetail } from './execution-detail'

export interface RuntimeTabProps {
  entityId: string
  nodeType: NodeType
  projectId: string
}

const STATE_CONFIG: Record<NodeRuntimeState, { label: string; colorClass: string; icon: React.ReactNode }> = {
  idle: { label: 'Idle', colorClass: 'bg-gray-100 text-gray-700', icon: <Pause className="h-3 w-3" /> },
  active: { label: 'Active', colorClass: 'bg-blue-100 text-blue-700', icon: <Play className="h-3 w-3" /> },
  waiting: { label: 'Waiting', colorClass: 'bg-amber-100 text-amber-700', icon: <Clock className="h-3 w-3" /> },
  blocked: { label: 'Blocked', colorClass: 'bg-orange-100 text-orange-700', icon: <AlertOctagon className="h-3 w-3" /> },
  error: { label: 'Error', colorClass: 'bg-red-100 text-red-700', icon: <XCircle className="h-3 w-3" /> },
  degraded: { label: 'Degraded', colorClass: 'bg-yellow-100 text-yellow-700', icon: <AlertOctagon className="h-3 w-3" /> },
}

const SEVERITY_COLORS: Record<EventSeverity, string> = {
  info: 'border-l-blue-400 bg-blue-50/50',
  warning: 'border-l-amber-400 bg-amber-50/50',
  error: 'border-l-red-400 bg-red-50/50',
  critical: 'border-l-red-600 bg-red-50',
}

function formatTime(isoString: string): string {
  const d = new Date(isoString)
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function EventRow({ event }: { event: RuntimeEventDto }) {
  return (
    <div
      className={`flex items-start gap-1.5 border-l-2 ${SEVERITY_COLORS[event.severity]} rounded-r px-2 py-1`}
      data-testid="event-row"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1">
          <span className="truncate text-[10px] font-medium text-foreground">{event.title}</span>
          <span className="shrink-0 text-[10px] text-muted-foreground/60">{formatTime(event.occurredAt)}</span>
        </div>
        {event.description && (
          <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{event.description}</p>
        )}
      </div>
    </div>
  )
}

export function RuntimeTab({ entityId, nodeType: _nodeType, projectId }: RuntimeTabProps) {
  const designMode = useVisualWorkspaceStore(s => s.designMode)
  const nodeStatuses = useRuntimeStatusStore(s => s.nodeStatuses)
  const recentEvents = useRuntimeStatusStore(s => s.recentEvents)

  // Fetch ALL executions for the project (not just active from store)
  const { data: allExecutions } = useRuntimeExecutions(projectId, {
    enabled: designMode === 'live',
    pollingInterval: 15_000,
  })

  const nodeStatus = useMemo(() => nodeStatuses.get(entityId) ?? null, [nodeStatuses, entityId])

  // Filter executions for this entity (all statuses, not just active)
  const entityExecutions = useMemo(
    () => (allExecutions ?? [])
      .filter(e => e.workflowId === entityId || e.agentId === entityId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [allExecutions, entityId],
  )

  const events = useMemo(
    () => recentEvents.filter(e => e.sourceEntityId === entityId || e.targetEntityId === entityId),
    [recentEvents, entityId],
  )

  // Separate active vs recent completed/failed
  const activeExecutions = useMemo(
    () => entityExecutions.filter(e => e.status === 'pending' || e.status === 'running' || e.status === 'waiting' || e.status === 'blocked'),
    [entityExecutions],
  )
  const terminalExecutions = useMemo(
    () => entityExecutions.filter(e => e.status === 'completed' || e.status === 'failed' || e.status === 'cancelled'),
    [entityExecutions],
  )

  // Aggregate cost
  const totalCost = useMemo(
    () => entityExecutions.reduce((sum, e) => sum + e.aiCost, 0),
    [entityExecutions],
  )

  // Failed execution count for prominent display
  const failedCount = terminalExecutions.filter(e => e.status === 'failed').length

  if (designMode !== 'live') {
    return (
      <div data-testid="runtime-tab" className="space-y-3">
        <div className="flex items-center gap-2 rounded bg-gray-50 p-2 text-gray-500">
          <Activity className="h-4 w-4 shrink-0" />
          <span className="text-xs font-medium">Switch to Live mode to see runtime state</span>
        </div>
      </div>
    )
  }

  const stateCfg = nodeStatus ? STATE_CONFIG[nodeStatus.state] : STATE_CONFIG.idle

  return (
    <div data-testid="runtime-tab" className="space-y-3">
      {/* Runtime state badge */}
      <div className="space-y-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Runtime State
        </span>
        <div className="flex items-center gap-2">
          <div
            data-testid="runtime-state-badge"
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${stateCfg.colorClass}`}
          >
            {stateCfg.icon}
            {stateCfg.label}
          </div>
          {failedCount > 0 && (
            <div
              data-testid="runtime-failed-count"
              className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700"
            >
              <AlertTriangle className="h-3 w-3" />
              {failedCount} failed
            </div>
          )}
        </div>
      </div>

      {/* Runtime badges */}
      {nodeStatus && nodeStatus.badges.length > 0 && (
        <div className="space-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Indicators
          </span>
          <RuntimeBadges badges={nodeStatus.badges} />
        </div>
      )}

      {/* Active executions */}
      {activeExecutions.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Active Executions ({activeExecutions.length})
          </span>
          <div className="space-y-1.5">
            {activeExecutions.slice(0, 10).map(exec => (
              <ExecutionDetail key={exec.id} execution={exec} defaultExpanded={activeExecutions.length === 1} />
            ))}
          </div>
        </div>
      )}

      {/* Recent completed/failed executions */}
      {terminalExecutions.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Recent Executions ({terminalExecutions.length})
          </span>
          <div className="space-y-1.5">
            {terminalExecutions.slice(0, 10).map(exec => (
              <ExecutionDetail key={exec.id} execution={exec} defaultExpanded={exec.status === 'failed'} />
            ))}
          </div>
        </div>
      )}

      {/* Cost summary */}
      {totalCost > 0 && (
        <div className="space-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Total Cost
          </span>
          <div className="flex items-center gap-1 rounded bg-muted/50 px-2 py-1.5 text-xs">
            <DollarSign className="h-3 w-3 text-muted-foreground" />
            <span className="font-medium">${totalCost.toFixed(2)}</span>
            <span className="text-muted-foreground">across {entityExecutions.length} execution{entityExecutions.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      )}

      {/* Recent events timeline */}
      {events.length > 0 && (
        <div className="space-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Recent Events ({events.length})
          </span>
          <div className="space-y-0.5">
            {events.slice(0, 8).map(event => (
              <EventRow key={event.id} event={event} />
            ))}
            {events.length > 8 && (
              <p className="text-[10px] text-muted-foreground text-center py-1">
                +{events.length - 8} more events
              </p>
            )}
          </div>
        </div>
      )}

      {/* Last event time */}
      {nodeStatus?.lastEventAt && (
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Clock className="h-3 w-3" />
          Last activity: {formatTime(nodeStatus.lastEventAt)}
        </div>
      )}

      {/* Empty state */}
      {entityExecutions.length === 0 && events.length === 0 && (
        <div className="flex items-center gap-2 py-4 text-xs text-muted-foreground">
          <Activity className="h-3 w-3" />
          No runtime activity recorded
        </div>
      )}
    </div>
  )
}
