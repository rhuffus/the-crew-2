import {
  Play,
  AlertTriangle,
  ShieldAlert,
  Activity,
  ArrowRightLeft,
  Package,
  Target,
  Zap,
  DollarSign,
  User,
} from 'lucide-react'
import type { RuntimeEventDto, RuntimeEventType, EventSeverity } from '@the-crew/shared-types'
import { useRuntimeStatusStore } from '@/stores/runtime-status-store'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'

const SEVERITY_COLORS: Record<EventSeverity, string> = {
  info: 'border-l-blue-400',
  warning: 'border-l-amber-400',
  error: 'border-l-red-400',
  critical: 'border-l-red-600',
}

const SEVERITY_BG: Record<EventSeverity, string> = {
  info: 'bg-blue-50',
  warning: 'bg-amber-50',
  error: 'bg-red-50',
  critical: 'bg-red-100',
}

type EventCategory = 'execution' | 'stage' | 'handoff' | 'artifact' | 'governance' | 'incident' | 'budget' | 'agent' | 'objective'

function getEventCategory(eventType: RuntimeEventType): EventCategory {
  if (eventType.startsWith('execution-')) return 'execution'
  if (eventType.startsWith('stage-')) return 'stage'
  if (eventType.startsWith('handoff-')) return 'handoff'
  if (eventType.startsWith('artifact-')) return 'artifact'
  if (eventType.startsWith('proposal-') || eventType === 'decision-made') return 'governance'
  if (eventType.startsWith('incident-') || eventType === 'escalation-raised') return 'incident'
  if (eventType.startsWith('budget-')) return 'budget'
  if (eventType.startsWith('agent-')) return 'agent'
  if (eventType.startsWith('objective-')) return 'objective'
  return 'execution'
}

const CATEGORY_ICONS: Record<EventCategory, typeof Play> = {
  execution: Play,
  stage: ArrowRightLeft,
  handoff: ArrowRightLeft,
  artifact: Package,
  governance: ShieldAlert,
  incident: AlertTriangle,
  budget: DollarSign,
  agent: User,
  objective: Target,
}

function formatTime(isoString: string): string {
  const d = new Date(isoString)
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

interface TimelineEventCardProps {
  event: RuntimeEventDto
  onSelect: (entityId: string) => void
}

function TimelineEventCard({ event, onSelect }: TimelineEventCardProps) {
  const category = getEventCategory(event.eventType)
  const Icon = CATEGORY_ICONS[category]

  return (
    <button
      type="button"
      onClick={() => onSelect(event.sourceEntityId)}
      className={`w-full border-l-2 ${SEVERITY_COLORS[event.severity]} ${SEVERITY_BG[event.severity]} rounded-r px-2 py-1.5 text-left hover:brightness-95 transition-colors`}
      data-testid={`timeline-event-${event.id}`}
    >
      <div className="flex items-start gap-1.5">
        <Icon className="h-3 w-3 mt-0.5 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <span className="truncate text-xs font-medium text-foreground">{event.title}</span>
            <span className="shrink-0 text-[10px] text-muted-foreground">{formatTime(event.occurredAt)}</span>
          </div>
          {event.description && (
            <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{event.description}</p>
          )}
        </div>
      </div>
    </button>
  )
}

export function TimelinePanel() {
  const recentEvents = useRuntimeStatusStore(s => s.recentEvents)
  const connected = useRuntimeStatusStore(s => s.connected)
  const connectionError = useRuntimeStatusStore(s => s.connectionError)
  const designMode = useVisualWorkspaceStore(s => s.designMode)
  const focusNode = useVisualWorkspaceStore(s => s.focusNode)

  if (designMode !== 'live') {
    return (
      <div data-testid="timeline-panel" className="p-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Activity className="h-3 w-3" />
          Switch to Live mode to see the timeline
        </div>
      </div>
    )
  }

  return (
    <div data-testid="timeline-panel" className="p-3">
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Timeline
      </h4>

      {/* Connection status */}
      <div className="mb-2 flex items-center gap-1.5">
        <span
          data-testid="timeline-connection-indicator"
          className={`h-2 w-2 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-400'}`}
        />
        <span className="text-[10px] text-muted-foreground">
          {connected ? 'Connected' : connectionError ?? 'Connecting...'}
        </span>
      </div>

      {/* Events list */}
      {recentEvents.length === 0 ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground py-4">
          <Zap className="h-3 w-3" />
          No events yet
        </div>
      ) : (
        <div className="space-y-1 max-h-[60vh] overflow-y-auto" data-testid="timeline-events-list">
          {recentEvents.map(event => (
            <TimelineEventCard
              key={event.id}
              event={event}
              onSelect={focusNode}
            />
          ))}
        </div>
      )}

      {/* Event count */}
      {recentEvents.length > 0 && (
        <div className="mt-2 text-[10px] text-muted-foreground text-center">
          {recentEvents.length} event{recentEvents.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}
