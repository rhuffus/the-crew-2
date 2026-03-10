import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { NodeType, NodeStatus, VisualDiffStatus } from '@the-crew/shared-types'
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
  Workflow,
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  ChevronRight,
  ChevronDown,
} from 'lucide-react'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'

export const DRILLABLE_NODE_TYPES: ReadonlySet<NodeType> = new Set([
  'company',
  'department',
  'workflow',
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
}

const NODE_TYPE_LABELS: Record<NodeType, string> = {
  company: 'Company',
  department: 'Department',
  role: 'Role',
  'agent-archetype': 'Archetype',
  'agent-assignment': 'Assignment',
  capability: 'Capability',
  skill: 'Skill',
  workflow: 'Workflow',
  'workflow-stage': 'Stage',
  contract: 'Contract',
  policy: 'Policy',
}

const STATUS_BORDER: Record<NodeStatus, string> = {
  normal: 'border-slate-300',
  warning: 'border-yellow-400',
  error: 'border-red-400',
  dimmed: 'border-slate-200 opacity-50',
}

const STATUS_BG: Record<NodeStatus, string> = {
  normal: 'bg-white',
  warning: 'bg-yellow-50',
  error: 'bg-red-50',
  dimmed: 'bg-slate-50',
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
  [key: string]: unknown
}

function VisualNodeComponent({ data, id }: NodeProps) {
  const nodeData = data as unknown as VisualNodeData
  const Icon = NODE_TYPE_ICONS[nodeData.nodeType] ?? Building2
  const typeLabel = NODE_TYPE_LABELS[nodeData.nodeType] ?? nodeData.nodeType
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
  const drillableClass = isDrillable ? 'cursor-pointer hover:shadow-md transition-shadow' : ''

  const handleToggleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation()
    useVisualWorkspaceStore.getState().toggleCollapse(id)
  }

  return (
    <>
      <Handle type="target" position={Position.Top} className="!bg-slate-400 !w-2.5 !h-2.5" />
      <div
        data-testid={`visual-node-${nodeData.nodeType}`}
        data-connection-dimmed={nodeData.connectionDimmed ? 'true' : undefined}
        data-connection-highlight={nodeData.connectionHighlight ? 'true' : undefined}
        className={`relative rounded-lg border-2 px-4 py-3 shadow-sm ${borderClass} ${bgClass} ${dimClass} ${highlightClass} ${drillableClass} min-w-[160px] max-w-[220px] transition-opacity duration-150`}
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 shrink-0 text-slate-500" />
          <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
            {typeLabel}
          </span>
        </div>
        <div className="mt-1 text-sm font-semibold text-slate-800 leading-tight">
          {nodeData.label}
        </div>
        {nodeData.sublabel && (
          <div className="mt-0.5 text-xs text-slate-500 leading-tight">
            {nodeData.sublabel}
          </div>
        )}
        {nodeData.isContainer && (
          <button
            type="button"
            data-testid="collapse-toggle"
            onClick={handleToggleCollapse}
            className="absolute -left-2 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 shadow hover:bg-slate-300 transition-colors"
            title={nodeData.isCollapsed ? 'Expand children' : 'Collapse children'}
          >
            {nodeData.isCollapsed ? (
              <ChevronRight className="h-3 w-3 text-slate-600" />
            ) : (
              <ChevronDown className="h-3 w-3 text-slate-600" />
            )}
          </button>
        )}
        {nodeData.isCollapsed && (nodeData.hiddenChildCount ?? 0) > 0 && (
          <div
            data-testid="collapsed-badge"
            className="absolute -bottom-2 -left-2 flex h-5 items-center rounded-full bg-slate-500 px-1.5 shadow"
            title={`${nodeData.hiddenChildCount} hidden children`}
          >
            <span className="text-[9px] font-bold text-white">+{nodeData.hiddenChildCount}</span>
          </div>
        )}
        {nodeData.status === 'error' && (
          <div
            data-testid="validation-badge-error"
            className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 shadow"
            title={nodeData.validationCount ? `${nodeData.validationCount} error(s)` : 'Validation error'}
          >
            <AlertCircle className="h-3 w-3 text-white" />
          </div>
        )}
        {nodeData.status === 'warning' && (
          <div
            data-testid="validation-badge-warning"
            className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500 shadow"
            title={nodeData.validationCount ? `${nodeData.validationCount} warning(s)` : 'Validation warning'}
          >
            <AlertTriangle className="h-3 w-3 text-white" />
          </div>
        )}
        {(nodeData.externalRefCount ?? 0) > 0 && (
          <div
            data-testid="external-ref-badge"
            className="absolute -bottom-2 -right-2 flex h-5 items-center gap-0.5 rounded-full bg-blue-500 px-1.5 shadow"
            title={`${nodeData.externalRefCount} external reference(s)`}
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
        {isDrillable && (
          <div
            data-testid="drilldown-indicator"
            className="absolute bottom-1 right-1 text-slate-400"
            title="Double-click to expand"
          >
            <ChevronRight className="h-3 w-3" />
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-slate-400 !w-2.5 !h-2.5" />
    </>
  )
}

export const VisualNode = memo(VisualNodeComponent)
