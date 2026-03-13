import {
  Play,
  Pause,
  XCircle,
  AlertOctagon,
  Clock,
  DollarSign,
  Activity,
  Loader2,
} from 'lucide-react'
import { useMemo } from 'react'
import type { NodeType, NodeRuntimeState, RuntimeExecutionDto, RuntimeEventDto } from '@the-crew/shared-types'
import { useRuntimeStatusStore } from '@/stores/runtime-status-store'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'
import { RuntimeBadges } from '../runtime-badges'

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

function formatTime(isoString: string): string {
  const d = new Date(isoString)
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function ExecutionRow({ execution }: { execution: RuntimeExecutionDto }) {
  const statusColors: Record<string, string> = {
    pending: 'text-gray-500',
    running: 'text-blue-600',
    waiting: 'text-amber-600',
    blocked: 'text-orange-600',
    completed: 'text-green-600',
    failed: 'text-red-600',
    cancelled: 'text-gray-400',
  }

  return (
    <div className="flex items-center justify-between rounded bg-muted/50 px-2 py-1.5 text-xs" data-testid="execution-row">
      <div className="flex items-center gap-1.5 min-w-0">
        {execution.status === 'running' && <Loader2 className="h-3 w-3 animate-spin text-blue-600" />}
        <span className="truncate">{execution.executionType}</span>
      </div>
      <span className={`shrink-0 font-medium ${statusColors[execution.status] ?? 'text-gray-500'}`}>
        {execution.status}
      </span>
    </div>
  )
}

function EventRow({ event }: { event: RuntimeEventDto }) {
  return (
    <div className="flex items-center justify-between text-[10px]" data-testid="event-row">
      <span className="truncate text-muted-foreground">{event.title}</span>
      <span className="shrink-0 text-muted-foreground/60">{formatTime(event.occurredAt)}</span>
    </div>
  )
}

export function RuntimeTab({ entityId, nodeType: _nodeType, projectId }: RuntimeTabProps) {
  const designMode = useVisualWorkspaceStore(s => s.designMode)
  const nodeStatuses = useRuntimeStatusStore(s => s.nodeStatuses)
  const activeExecutions = useRuntimeStatusStore(s => s.activeExecutions)
  const recentEvents = useRuntimeStatusStore(s => s.recentEvents)

  const nodeStatus = useMemo(() => nodeStatuses.get(entityId) ?? null, [nodeStatuses, entityId])
  const executions = useMemo(
    () => activeExecutions.filter(e => e.workflowId === entityId || e.agentId === entityId),
    [activeExecutions, entityId],
  )
  const events = useMemo(
    () => recentEvents.filter(e => e.sourceEntityId === entityId || e.targetEntityId === entityId),
    [recentEvents, entityId],
  )

  void projectId

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
        <div
          data-testid="runtime-state-badge"
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${stateCfg.colorClass}`}
        >
          {stateCfg.icon}
          {stateCfg.label}
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
      {executions.length > 0 && (
        <div className="space-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Active Executions
          </span>
          <div className="space-y-1">
            {executions.slice(0, 10).map(exec => (
              <ExecutionRow key={exec.id} execution={exec} />
            ))}
          </div>
        </div>
      )}

      {/* Cost */}
      {executions.some(e => e.aiCost > 0) && (
        <div className="space-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Cost
          </span>
          <div className="flex items-center gap-1 rounded bg-muted/50 px-2 py-1.5 text-xs">
            <DollarSign className="h-3 w-3 text-muted-foreground" />
            <span className="font-medium">
              ${executions.reduce((sum, e) => sum + e.aiCost, 0).toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Recent events */}
      {events.length > 0 && (
        <div className="space-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Recent Events
          </span>
          <div className="space-y-0.5">
            {events.slice(0, 5).map(event => (
              <EventRow key={event.id} event={event} />
            ))}
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
    </div>
  )
}
