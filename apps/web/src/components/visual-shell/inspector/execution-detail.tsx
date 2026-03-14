import { useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Clock,
  DollarSign,
  FileText,
  Lightbulb,
  Scale,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Loader2,
  Timer,
  Ban,
} from 'lucide-react'
import type { RuntimeExecutionDto, RuntimeErrorDto } from '@the-crew/shared-types'

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; colorClass: string; label: string }> = {
  pending: { icon: <Clock className="h-3 w-3" />, colorClass: 'text-gray-500', label: 'Pending' },
  running: { icon: <Loader2 className="h-3 w-3 animate-spin" />, colorClass: 'text-blue-600', label: 'Running' },
  waiting: { icon: <Clock className="h-3 w-3" />, colorClass: 'text-amber-600', label: 'Waiting' },
  blocked: { icon: <Ban className="h-3 w-3" />, colorClass: 'text-orange-600', label: 'Blocked' },
  completed: { icon: <CheckCircle2 className="h-3 w-3" />, colorClass: 'text-green-600', label: 'Completed' },
  failed: { icon: <XCircle className="h-3 w-3" />, colorClass: 'text-red-600', label: 'Failed' },
  cancelled: { icon: <Ban className="h-3 w-3" />, colorClass: 'text-gray-400', label: 'Cancelled' },
  'timed-out': { icon: <Timer className="h-3 w-3" />, colorClass: 'text-orange-600', label: 'Timed Out' },
}

function formatDuration(startedAt: string | null, completedAt: string | null): string | null {
  if (!startedAt) return null
  const start = new Date(startedAt).getTime()
  const end = completedAt ? new Date(completedAt).getTime() : Date.now()
  const ms = end - start
  if (ms < 1000) return `${ms}ms`
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`
  const mins = Math.floor(ms / 60_000)
  const secs = Math.floor((ms % 60_000) / 1000)
  return `${mins}m ${secs}s`
}

function formatTime(isoString: string): string {
  const d = new Date(isoString)
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function getOutputCounts(output: Record<string, unknown> | null): { docs: number; proposals: number; decisions: number } {
  if (!output) return { docs: 0, proposals: 0, decisions: 0 }
  const docs = Array.isArray(output.generatedDocs) ? output.generatedDocs.length : 0
  const proposals = Array.isArray(output.generatedProposals) ? output.generatedProposals.length : 0
  const decisions = Array.isArray(output.generatedDecisions) ? output.generatedDecisions.length : 0
  return { docs, proposals, decisions }
}

function ErrorItem({ error }: { error: RuntimeErrorDto }) {
  const severityColor = error.severity === 'fatal' ? 'border-l-red-600 bg-red-50' :
    error.severity === 'error' ? 'border-l-red-400 bg-red-50/50' :
    'border-l-amber-400 bg-amber-50/50'

  return (
    <div className={`border-l-2 ${severityColor} rounded-r px-2 py-1`} data-testid="execution-error-item">
      <div className="flex items-center gap-1">
        <AlertTriangle className="h-3 w-3 shrink-0 text-red-500" />
        <span className="text-[10px] font-medium uppercase text-muted-foreground">{error.severity}</span>
        <span className="text-[10px] text-muted-foreground">{formatTime(error.occurredAt)}</span>
      </div>
      <p className="mt-0.5 text-xs text-foreground">{error.message}</p>
      {error.context && (
        <p className="mt-0.5 text-[10px] text-muted-foreground">{error.context}</p>
      )}
    </div>
  )
}

export interface ExecutionDetailProps {
  execution: RuntimeExecutionDto
  defaultExpanded?: boolean
}

export function ExecutionDetail({ execution, defaultExpanded = false }: ExecutionDetailProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const DEFAULT_STATUS = { icon: <Clock className="h-3 w-3" />, colorClass: 'text-gray-500', label: execution.status }
  const statusCfg = STATUS_CONFIG[execution.status] ?? DEFAULT_STATUS
  const duration = formatDuration(execution.startedAt, execution.completedAt)
  const outputs = getOutputCounts(execution.output)
  const hasOutputs = outputs.docs > 0 || outputs.proposals > 0 || outputs.decisions > 0
  const hasErrors = execution.errors.length > 0
  const summary = execution.output?.summary as string | undefined
  const isTerminal = execution.status === 'completed' || execution.status === 'failed' || execution.status === 'cancelled'

  return (
    <div
      data-testid="execution-detail"
      className={`rounded border ${hasErrors ? 'border-red-200' : 'border-border'} bg-card`}
    >
      {/* Header row - always visible */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-1.5 px-2 py-1.5 text-left hover:bg-muted/50 transition-colors"
        data-testid="execution-detail-toggle"
      >
        {expanded ? <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" /> : <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />}
        <span className={`shrink-0 ${statusCfg.colorClass}`}>{statusCfg.icon}</span>
        <span className="truncate text-xs font-medium text-foreground">{execution.executionType}</span>
        <span className="ml-auto flex items-center gap-2 shrink-0">
          {duration && (
            <span className="text-[10px] text-muted-foreground">{duration}</span>
          )}
          {execution.aiCost > 0 && (
            <span className="text-[10px] text-muted-foreground">${execution.aiCost.toFixed(2)}</span>
          )}
          {hasErrors && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-red-100 px-1 text-[10px] font-semibold text-red-700">
              {execution.errors.length}
            </span>
          )}
        </span>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-border px-2 py-2 space-y-2" data-testid="execution-detail-content">
          {/* Status + Timestamps */}
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
            <span className={`font-medium ${statusCfg.colorClass}`}>{statusCfg.label}</span>
            {execution.startedAt && <span>Started: {formatTime(execution.startedAt)}</span>}
            {execution.completedAt && <span>Completed: {formatTime(execution.completedAt)}</span>}
            {duration && isTerminal && <span>Duration: {duration}</span>}
          </div>

          {/* Waiting info */}
          {execution.waitingFor && (
            <div className="flex items-center gap-1 rounded bg-amber-50 px-2 py-1 text-xs text-amber-700">
              <Clock className="h-3 w-3 shrink-0" />
              Waiting for: {execution.waitingFor}
            </div>
          )}

          {/* Summary */}
          {summary && (
            <div data-testid="execution-summary">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Summary</span>
              <p className="mt-0.5 text-xs text-foreground">{summary}</p>
            </div>
          )}

          {/* Log summary */}
          {execution.logSummary && (
            <div data-testid="execution-log-summary">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Log</span>
              <p className="mt-0.5 text-xs text-muted-foreground whitespace-pre-wrap">{execution.logSummary}</p>
            </div>
          )}

          {/* Outputs */}
          {hasOutputs && (
            <div data-testid="execution-outputs">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Outputs</span>
              <div className="mt-0.5 flex flex-wrap gap-2">
                {outputs.docs > 0 && (
                  <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] text-blue-700">
                    <FileText className="h-3 w-3" />
                    {outputs.docs} doc{outputs.docs > 1 ? 's' : ''}
                  </span>
                )}
                {outputs.proposals > 0 && (
                  <span className="inline-flex items-center gap-1 rounded bg-purple-50 px-1.5 py-0.5 text-[10px] text-purple-700">
                    <Lightbulb className="h-3 w-3" />
                    {outputs.proposals} proposal{outputs.proposals > 1 ? 's' : ''}
                  </span>
                )}
                {outputs.decisions > 0 && (
                  <span className="inline-flex items-center gap-1 rounded bg-green-50 px-1.5 py-0.5 text-[10px] text-green-700">
                    <Scale className="h-3 w-3" />
                    {outputs.decisions} decision{outputs.decisions > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Cost */}
          {execution.aiCost > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <DollarSign className="h-3 w-3" />
              AI Cost: ${execution.aiCost.toFixed(4)}
            </div>
          )}

          {/* Errors */}
          {hasErrors && (
            <div data-testid="execution-errors">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-red-600">
                Errors ({execution.errors.length})
              </span>
              <div className="mt-0.5 space-y-1">
                {execution.errors.map((error, idx) => (
                  <ErrorItem key={idx} error={error} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
