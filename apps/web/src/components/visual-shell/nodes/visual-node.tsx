import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { useTranslation } from 'react-i18next'
import type { NodeType, NodeStatus, VisualDiffStatus, ReviewStatus } from '@the-crew/shared-types'
import type { OperationStatus, ComplianceStatus, OperationBadge } from '@the-crew/shared-types'
import {
  Building2,
  Users,
  UserCog,
  Bot,
  UserCheck,
  Zap,
  Wrench,
  GitBranch,
  FileText,
  Shield,
  FileBox,
  Workflow,
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  ChevronRight,
  ChevronDown,
  MessageSquare,
  Lock,
  CheckCircle2,
  AlertOctagon,
  Play,
  Pause,
  XCircle,
  ShieldAlert,
  ShieldX,
  ShieldCheck,
  UsersRound,
  BrainCircuit,
  Target,
  Globe,
  ArrowRightLeft,
  Gavel,
  MessageSquarePlus,
} from 'lucide-react'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'

export const DRILLABLE_NODE_TYPES: ReadonlySet<NodeType> = new Set([
  'company',
  'department',
  'workflow',
  'team',
])

const NODE_TYPE_ICONS: Record<NodeType, typeof Building2> = {
  company: Building2,
  department: Users,
  role: UserCog,
  'agent-archetype': Bot,
  'agent-assignment': UserCheck,
  capability: Zap,
  skill: Wrench,
  workflow: Workflow,
  'workflow-stage': GitBranch,
  contract: FileText,
  policy: Shield,
  artifact: FileBox,
  team: UsersRound,
  'coordinator-agent': BrainCircuit,
  'specialist-agent': Bot,
  objective: Target,
  'event-trigger': Zap,
  'external-source': Globe,
  handoff: ArrowRightLeft,
  decision: Gavel,
  proposal: MessageSquarePlus,
}

const STATUS_BORDER: Record<NodeStatus, string> = {
  normal: 'border-slate-300 dark:border-slate-600',
  warning: 'border-yellow-400 dark:border-yellow-600',
  error: 'border-red-400 dark:border-red-600',
  dimmed: 'border-slate-200 dark:border-slate-700 opacity-50',
  active: 'ring-2 ring-green-500 border-green-400 dark:border-green-600',
  proposed: 'ring-2 ring-blue-400 border-blue-300 dark:border-blue-600 border-dashed',
  retired: 'ring-1 ring-slate-300 dark:ring-slate-600 border-slate-300 dark:border-slate-600 opacity-50',
}

const STATUS_BG: Record<NodeStatus, string> = {
  normal: 'bg-white dark:bg-slate-800',
  warning: 'bg-yellow-50 dark:bg-yellow-950',
  error: 'bg-red-50 dark:bg-red-950',
  dimmed: 'bg-slate-50 dark:bg-slate-800',
  active: 'bg-green-50 dark:bg-green-950',
  proposed: 'bg-blue-50 dark:bg-blue-950',
  retired: 'bg-slate-100 dark:bg-slate-800 opacity-60',
}

export interface VisualNodeData {
  label: string
  sublabel: string | null
  nodeType: NodeType
  entityId: string
  status: NodeStatus
  collapsed: boolean
  layerIds: string[]
  parentId: string | null
  validationCount?: number
  externalRefCount?: number
  isContainer?: boolean
  isCollapsed?: boolean
  hiddenChildCount?: number
  connectionDimmed?: boolean
  connectionHighlight?: boolean
  diffStatus?: VisualDiffStatus
  diffBadge?: string | null
  diffBorderClass?: string
  diffBgClass?: string
  diffOpacityClass?: string
  changes?: Record<string, { before: unknown; after: unknown }>
  commentCount?: number
  reviewStatus?: ReviewStatus | null
  isLocked?: boolean
  lockedByName?: string | null
  operationStatus?: OperationStatus
  operationBadges?: OperationBadge[]
  activeRunCount?: number
  incidentCount?: number
  queueDepth?: number
  complianceStatus?: ComplianceStatus | null
  [key: string]: unknown
}

function VisualNodeComponent({ data, id }: NodeProps) {
  const nodeData = data as unknown as VisualNodeData
  const { t } = useTranslation('entities')
  const { t: tCanvas } = useTranslation('canvas')
  const Icon = NODE_TYPE_ICONS[nodeData.nodeType] ?? Building2
  const typeLabel = t(`nodeTypeShort.${nodeData.nodeType}`, { defaultValue: nodeData.nodeType })
  const isDiffMode = !!nodeData.diffStatus
  const borderClass = isDiffMode
    ? (nodeData.diffBorderClass ?? STATUS_BORDER.normal)
    : (STATUS_BORDER[nodeData.status] ?? STATUS_BORDER.normal)
  const bgClass = isDiffMode
    ? (nodeData.diffBgClass ?? STATUS_BG.normal)
    : (STATUS_BG[nodeData.status] ?? STATUS_BG.normal)

  const isDrillable = !isDiffMode && DRILLABLE_NODE_TYPES.has(nodeData.nodeType)
  const dimClass = nodeData.connectionDimmed ? 'opacity-30 pointer-events-none' : (nodeData.diffOpacityClass ?? '')
  const highlightClass = nodeData.connectionHighlight ? 'ring-2 ring-blue-400 ring-offset-1' : ''
  const interactionClass = isDrillable ? 'cursor-pointer hover:shadow-md transition-shadow' : ''

  const handleToggleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation()
    useVisualWorkspaceStore.getState().toggleCollapse(id)
  }

  return (
    <>
      <Handle type="target" position={Position.Top} className="!bg-slate-400 dark:!bg-slate-500 !w-2.5 !h-2.5" />
      <div
        data-testid={`visual-node-${nodeData.nodeType}`}
        data-connection-dimmed={nodeData.connectionDimmed ? 'true' : undefined}
        data-connection-highlight={nodeData.connectionHighlight ? 'true' : undefined}
        className={`relative rounded-lg border-2 px-4 py-3 shadow-sm ${borderClass} ${bgClass} ${dimClass} ${highlightClass} ${interactionClass} min-w-[160px] max-w-[220px] transition-opacity duration-150`}
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" />
          <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {typeLabel}
          </span>
        </div>
        <div className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200 leading-tight">
          {nodeData.label}
        </div>
        {nodeData.sublabel && (
          <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 leading-tight">
            {nodeData.sublabel}
          </div>
        )}
        {nodeData.isContainer && (
          <button
            type="button"
            data-testid="collapse-toggle"
            onClick={handleToggleCollapse}
            className="absolute -left-2 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 shadow hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            title={nodeData.isCollapsed ? tCanvas('expandChildren') : tCanvas('collapseChildren')}
          >
            {nodeData.isCollapsed ? (
              <ChevronRight className="h-3 w-3 text-slate-600 dark:text-slate-300" />
            ) : (
              <ChevronDown className="h-3 w-3 text-slate-600 dark:text-slate-300" />
            )}
          </button>
        )}
        {nodeData.isCollapsed && (nodeData.hiddenChildCount ?? 0) > 0 && (
          <div
            data-testid="collapsed-badge"
            className="absolute -bottom-2 -left-2 flex h-5 items-center rounded-full bg-slate-500 dark:bg-slate-600 px-1.5 shadow"
            title={t('badges.hiddenChildren', { count: nodeData.hiddenChildCount })}
          >
            <span className="text-[9px] font-bold text-white">+{nodeData.hiddenChildCount}</span>
          </div>
        )}
        {nodeData.status === 'error' && (
          <div
            data-testid="validation-badge-error"
            className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 shadow"
            title={nodeData.validationCount ? t('validationBadge.errorCount', { count: nodeData.validationCount }) : t('validationBadge.error')}
          >
            <AlertCircle className="h-3 w-3 text-white" />
          </div>
        )}
        {nodeData.status === 'warning' && (
          <div
            data-testid="validation-badge-warning"
            className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500 shadow"
            title={nodeData.validationCount ? t('validationBadge.warningCount', { count: nodeData.validationCount }) : t('validationBadge.warning')}
          >
            <AlertTriangle className="h-3 w-3 text-white" />
          </div>
        )}
        {(nodeData.externalRefCount ?? 0) > 0 && (
          <div
            data-testid="external-ref-badge"
            className="absolute -bottom-2 -right-2 flex h-5 items-center gap-0.5 rounded-full bg-blue-500 px-1.5 shadow"
            title={t('badges.externalRefCount', { count: nodeData.externalRefCount })}
          >
            <ArrowUpRight className="h-2.5 w-2.5 text-white" />
            <span className="text-[9px] font-bold text-white">{nodeData.externalRefCount}</span>
          </div>
        )}
        {isDiffMode && nodeData.diffBadge && (
          <div
            data-testid={`diff-badge-${nodeData.diffStatus}`}
            className={`absolute -left-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full shadow text-white text-xs font-bold ${
              nodeData.diffStatus === 'added'
                ? 'bg-green-500'
                : nodeData.diffStatus === 'removed'
                  ? 'bg-red-500'
                  : 'bg-amber-500'
            }`}
          >
            {nodeData.diffBadge}
          </div>
        )}
        {/* Collaboration badges (CAV-021) */}
        {!isDiffMode && (nodeData.commentCount ?? 0) > 0 && (
          <div
            data-testid="comment-badge"
            className="absolute -top-2 right-5 flex h-5 items-center gap-0.5 rounded-full bg-blue-100 px-1.5 shadow"
            title={t('badges.commentCount', { count: nodeData.commentCount })}
          >
            <MessageSquare className="h-2.5 w-2.5 text-blue-600" />
            <span className="text-[9px] font-bold text-blue-600">{nodeData.commentCount}</span>
          </div>
        )}
        {!isDiffMode && nodeData.reviewStatus === 'approved' && (
          <div
            data-testid="review-badge-approved"
            className="absolute -bottom-2 right-5 flex h-5 w-5 items-center justify-center rounded-full bg-green-100 shadow"
            title={t('badges.approved')}
          >
            <CheckCircle2 className="h-3 w-3 text-green-600" />
          </div>
        )}
        {!isDiffMode && nodeData.reviewStatus === 'needs-changes' && (
          <div
            data-testid="review-badge-needs-changes"
            className="absolute -bottom-2 right-5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 shadow"
            title={t('badges.needsChanges')}
          >
            <AlertOctagon className="h-3 w-3 text-amber-600" />
          </div>
        )}
        {!isDiffMode && nodeData.isLocked && (
          <div
            data-testid="lock-badge"
            className="absolute -top-2 left-5 flex h-5 items-center gap-0.5 rounded-full bg-orange-100 px-1.5 shadow"
            title={nodeData.lockedByName ? t('badges.lockedBy', { name: nodeData.lockedByName }) : t('badges.locked')}
          >
            <Lock className="h-2.5 w-2.5 text-orange-600" />
          </div>
        )}
        {/* Operations overlay badges (CAV-019) */}
        {!isDiffMode && nodeData.operationStatus === 'running' && (
          <div
            data-testid="ops-badge-running"
            className="absolute -bottom-2 -left-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white shadow"
            title={t('badges.activeRuns', { count: nodeData.activeRunCount ?? 0 })}
          >
            <Play className="h-3 w-3" />
          </div>
        )}
        {!isDiffMode && nodeData.operationStatus === 'blocked' && (
          <div
            data-testid="ops-badge-blocked"
            className="absolute -bottom-2 -left-2 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white shadow"
            title={t('badges.blocked')}
          >
            <Pause className="h-3 w-3" />
          </div>
        )}
        {!isDiffMode && nodeData.operationStatus === 'failed' && (
          <div
            data-testid="ops-badge-failed"
            className="absolute -bottom-2 -left-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white shadow"
            title={nodeData.incidentCount ? t('badges.failedIncidents', { count: nodeData.incidentCount }) : t('operationStatus.failed')}
          >
            <XCircle className="h-3 w-3" />
          </div>
        )}
        {!isDiffMode && (nodeData.incidentCount ?? 0) > 0 && nodeData.operationStatus !== 'failed' && nodeData.operationStatus !== 'running' && nodeData.operationStatus !== 'blocked' && (
          <div
            data-testid="ops-badge-incident"
            className="absolute -bottom-2 -left-2 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-white shadow"
            title={t('badges.openIncidents', { count: nodeData.incidentCount })}
          >
            <AlertOctagon className="h-3 w-3" />
          </div>
        )}
        {!isDiffMode && nodeData.complianceStatus === 'compliant' && (
          <div
            data-testid="ops-badge-compliance-ok"
            className="absolute -bottom-2 left-4 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white shadow"
            title={t('badges.compliant')}
          >
            <ShieldCheck className="h-3 w-3" />
          </div>
        )}
        {!isDiffMode && nodeData.complianceStatus === 'at-risk' && (
          <div
            data-testid="ops-badge-compliance-risk"
            className="absolute -bottom-2 left-4 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white shadow"
            title={t('badges.atRisk')}
          >
            <ShieldAlert className="h-3 w-3" />
          </div>
        )}
        {!isDiffMode && nodeData.complianceStatus === 'violated' && (
          <div
            data-testid="ops-badge-compliance-violated"
            className="absolute -bottom-2 left-4 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white shadow"
            title={t('badges.violated')}
          >
            <ShieldX className="h-3 w-3" />
          </div>
        )}
        {isDrillable && (
          <div
            data-testid="drilldown-indicator"
            className="absolute bottom-1 right-1 text-slate-400 dark:text-slate-500"
            title={tCanvas('doubleClickExpand')}
          >
            <ChevronRight className="h-3 w-3" />
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-slate-400 dark:!bg-slate-500 !w-2.5 !h-2.5" />
    </>
  )
}

export const VisualNode = memo(VisualNodeComponent)
