import { useState } from 'react'
import {
  ChevronRight,
  ChevronDown,
  Building2,
  Users,
  UserCog,
  Bot,
  UserMinus,
  Lightbulb,
  Sparkles,
  GitBranch,
  ArrowRightLeft,
  FileText,
  Shield,
  Plus,
  Minus,
  PenLine,
} from 'lucide-react'
import type { NodeType, VisualNodeDto, VisualDiffStatus } from '@the-crew/shared-types'
import { cn } from '@/lib/utils'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'

const NODE_TYPE_CONFIG: Record<NodeType, { label: string; icon: typeof Building2 }> = {
  company: { label: 'Companies', icon: Building2 },
  department: { label: 'Departments', icon: Users },
  role: { label: 'Roles', icon: UserCog },
  'agent-archetype': { label: 'Agent Archetypes', icon: Bot },
  'agent-assignment': { label: 'Agent Assignments', icon: UserMinus },
  capability: { label: 'Capabilities', icon: Lightbulb },
  skill: { label: 'Skills', icon: Sparkles },
  workflow: { label: 'Workflows', icon: GitBranch },
  'workflow-stage': { label: 'Workflow Stages', icon: ArrowRightLeft },
  contract: { label: 'Contracts', icon: FileText },
  policy: { label: 'Policies', icon: Shield },
}

const NODE_TYPE_ORDER: NodeType[] = [
  'company',
  'department',
  'role',
  'agent-archetype',
  'agent-assignment',
  'capability',
  'skill',
  'workflow',
  'workflow-stage',
  'contract',
  'policy',
]

const DIFF_BADGE_CONFIG: Record<VisualDiffStatus, { icon: typeof Plus; colorClass: string; label: string } | null> = {
  added: { icon: Plus, colorClass: 'text-green-600', label: '+' },
  removed: { icon: Minus, colorClass: 'text-red-600', label: '−' },
  modified: { icon: PenLine, colorClass: 'text-amber-600', label: '~' },
  unchanged: null,
}

function getDiffStatus(node: VisualNodeDto): VisualDiffStatus | undefined {
  return (node as VisualNodeDto & { diffStatus?: VisualDiffStatus }).diffStatus
}

function getGroupDiffSummary(nodes: VisualNodeDto[]): string | null {
  let added = 0, removed = 0, modified = 0
  for (const node of nodes) {
    const status = getDiffStatus(node)
    if (status === 'added') added++
    else if (status === 'removed') removed++
    else if (status === 'modified') modified++
  }
  if (added === 0 && removed === 0 && modified === 0) return null
  const parts: string[] = []
  if (added > 0) parts.push(`${added} added`)
  if (removed > 0) parts.push(`${removed} removed`)
  if (modified > 0) parts.push(`${modified} modified`)
  return parts.join(', ')
}

export function EntityTree() {
  const { graphNodes, selectedNodeIds, isDiffMode, selectNodes, focusNode } = useVisualWorkspaceStore()
  const [collapsedGroups, setCollapsedGroups] = useState<Set<NodeType>>(new Set())

  const groupedNodes = NODE_TYPE_ORDER.reduce<[NodeType, VisualNodeDto[]][]>((acc, nodeType) => {
    const nodes = graphNodes.filter((n) => n.nodeType === nodeType)
    if (nodes.length > 0) {
      acc.push([nodeType, nodes])
    }
    return acc
  }, [])

  if (graphNodes.length === 0) {
    return (
      <div data-testid="entity-tree" className="p-3">
        <p className="text-xs text-muted-foreground">No entities in current view.</p>
      </div>
    )
  }

  const toggleGroup = (nodeType: NodeType) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(nodeType)) next.delete(nodeType)
      else next.add(nodeType)
      return next
    })
  }

  const handleNodeClick = (nodeId: string) => {
    selectNodes([nodeId])
    focusNode(nodeId)
  }

  return (
    <div data-testid="entity-tree" className="p-1">
      {groupedNodes.map(([nodeType, nodes]) => {
        const config = NODE_TYPE_CONFIG[nodeType]
        const isCollapsed = collapsedGroups.has(nodeType)
        const Icon = config.icon

        const diffSummary = isDiffMode ? getGroupDiffSummary(nodes) : null

        return (
          <div key={nodeType} data-testid={`entity-group-${nodeType}`}>
            <button
              type="button"
              onClick={() => toggleGroup(nodeType)}
              className="flex w-full items-center gap-1 rounded px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              {isCollapsed ? (
                <ChevronRight className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
              <Icon className="h-3.5 w-3.5" />
              <span>{config.label}</span>
              {diffSummary && (
                <span data-testid={`diff-group-summary-${nodeType}`} className="ml-1 text-[10px] text-muted-foreground">
                  ({diffSummary})
                </span>
              )}
              <span className="ml-auto text-[10px] opacity-60">{nodes.length}</span>
            </button>
            {!isCollapsed && (
              <div className="ml-3">
                {nodes.map((node) => {
                  const isSelected = selectedNodeIds.includes(node.id)
                  const nodeDiffStatus = isDiffMode ? getDiffStatus(node) : undefined
                  const diffBadge = nodeDiffStatus ? DIFF_BADGE_CONFIG[nodeDiffStatus] : null
                  return (
                    <button
                      key={node.id}
                      type="button"
                      data-testid={`entity-tree-node-${node.id}`}
                      onClick={() => handleNodeClick(node.id)}
                      className={cn(
                        'flex w-full items-center gap-2 rounded px-2 py-1 text-xs hover:bg-accent hover:text-accent-foreground',
                        isSelected && 'bg-primary/10 font-medium text-primary',
                      )}
                    >
                      <span className="truncate">{node.label}</span>
                      {diffBadge && (
                        <span
                          data-testid={`diff-badge-${node.id}`}
                          className={`ml-auto shrink-0 text-[10px] font-bold ${diffBadge.colorClass}`}
                        >
                          {diffBadge.label}
                        </span>
                      )}
                      {!isDiffMode && node.status === 'error' && (
                        <span
                          data-testid={`node-status-error-${node.id}`}
                          className="h-1.5 w-1.5 shrink-0 rounded-full bg-destructive"
                        />
                      )}
                      {!isDiffMode && node.status === 'warning' && (
                        <span
                          data-testid={`node-status-warning-${node.id}`}
                          className="h-1.5 w-1.5 shrink-0 rounded-full bg-yellow-500"
                        />
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
