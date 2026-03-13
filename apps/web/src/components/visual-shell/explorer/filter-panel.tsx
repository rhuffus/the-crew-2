import type { NodeType, NodeStatus } from '@the-crew/shared-types'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'

const NODE_TYPE_LABELS: Record<NodeType, string> = {
  'company': 'Company',
  'department': 'Department',
  'team': 'Team',
  'coordinator-agent': 'Coordinator Agent',
  'specialist-agent': 'Specialist Agent',
  'objective': 'Objective',
  'event-trigger': 'Event Trigger',
  'external-source': 'External Source',
  'role': 'Role',
  'agent-archetype': 'Agent Archetype',
  'agent-assignment': 'Agent Assignment',
  'capability': 'Capability',
  'skill': 'Skill',
  'workflow': 'Workflow',
  'workflow-stage': 'Workflow Stage',
  'handoff': 'Handoff',
  'contract': 'Contract',
  'policy': 'Policy',
  'artifact': 'Artifact',
  'decision': 'Decision',
  'proposal': 'Proposal',
}

const STATUS_LABELS: Record<NodeStatus, string> = {
  normal: 'Normal',
  warning: 'Warning',
  error: 'Error',
  dimmed: 'Dimmed',
  active: 'Active',
  proposed: 'Proposed',
  retired: 'Retired',
}

const STATUS_COLORS: Record<NodeStatus, string> = {
  normal: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
  dimmed: 'bg-slate-400',
  active: 'bg-green-500',
  proposed: 'bg-blue-400',
  retired: 'bg-slate-400',
}

export function FilterPanel() {
  const { graphNodes, nodeTypeFilter, statusFilter, setNodeTypeFilter, setStatusFilter, clearFilters } =
    useVisualWorkspaceStore()

  // Derive available node types from current graph
  const availableTypes = Array.from(new Set(graphNodes.map((n) => n.nodeType))).sort()
  // Derive available statuses
  const availableStatuses = Array.from(
    new Set(graphNodes.map((n) => n.status)),
  ).sort() as NodeStatus[]

  const handleNodeTypeToggle = (type: NodeType) => {
    if (!nodeTypeFilter) {
      // First filter: show only this type
      setNodeTypeFilter([type])
    } else if (nodeTypeFilter.includes(type)) {
      const next = nodeTypeFilter.filter((t) => t !== type)
      setNodeTypeFilter(next.length > 0 ? next : null)
    } else {
      setNodeTypeFilter([...nodeTypeFilter, type])
    }
  }

  const handleStatusToggle = (status: NodeStatus) => {
    if (!statusFilter) {
      setStatusFilter([status])
    } else if (statusFilter.includes(status)) {
      const next = statusFilter.filter((s) => s !== status)
      setStatusFilter(next.length > 0 ? next : null)
    } else {
      setStatusFilter([...statusFilter, status])
    }
  }

  const hasActiveFilters = nodeTypeFilter !== null || statusFilter !== null

  return (
    <div data-testid="filter-panel" className="p-3">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Filters
        </h4>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs text-primary hover:underline"
            data-testid="clear-filters"
          >
            Clear all
          </button>
        )}
      </div>

      {availableTypes.length > 0 && (
        <div className="mb-4">
          <h5 className="mb-1 text-xs font-medium text-muted-foreground">Node Type</h5>
          <ul className="space-y-0.5">
            {availableTypes.map((type) => {
              const isActive = !nodeTypeFilter || nodeTypeFilter.includes(type)
              return (
                <li key={type}>
                  <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm hover:bg-accent">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={() => handleNodeTypeToggle(type)}
                      className="rounded border-border"
                      data-testid={`filter-type-${type}`}
                    />
                    <span className={isActive ? 'text-foreground' : 'text-muted-foreground'}>
                      {NODE_TYPE_LABELS[type] ?? type}
                    </span>
                  </label>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {availableStatuses.length > 0 && (
        <div>
          <h5 className="mb-1 text-xs font-medium text-muted-foreground">Status</h5>
          <ul className="space-y-0.5">
            {availableStatuses.map((status) => {
              const isActive = !statusFilter || statusFilter.includes(status)
              return (
                <li key={status}>
                  <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm hover:bg-accent">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={() => handleStatusToggle(status)}
                      className="rounded border-border"
                      data-testid={`filter-status-${status}`}
                    />
                    <span
                      className={`inline-block h-2 w-2 rounded-full ${STATUS_COLORS[status]}`}
                    />
                    <span className={isActive ? 'text-foreground' : 'text-muted-foreground'}>
                      {STATUS_LABELS[status]}
                    </span>
                  </label>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {availableTypes.length === 0 && (
        <p className="text-xs text-muted-foreground">No graph loaded</p>
      )}
    </div>
  )
}
