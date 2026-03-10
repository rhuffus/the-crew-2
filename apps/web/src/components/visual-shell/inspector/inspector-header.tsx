import type { NodeType } from '@the-crew/shared-types'
import {
  Building2,
  Network,
  UserCog,
  Bot,
  Zap,
  Wrench,
  GitBranch,
  FileText,
  Shield,
  User,
  ListOrdered,
} from 'lucide-react'

const NODE_TYPE_ICONS: Record<NodeType, typeof Building2> = {
  company: Building2,
  department: Network,
  role: UserCog,
  'agent-archetype': Bot,
  'agent-assignment': User,
  capability: Zap,
  skill: Wrench,
  workflow: GitBranch,
  'workflow-stage': ListOrdered,
  contract: FileText,
  policy: Shield,
}

const NODE_TYPE_LABELS: Record<NodeType, string> = {
  company: 'Company',
  department: 'Department',
  role: 'Role',
  'agent-archetype': 'Agent Archetype',
  'agent-assignment': 'Agent Assignment',
  capability: 'Capability',
  skill: 'Skill',
  workflow: 'Workflow',
  'workflow-stage': 'Workflow Stage',
  contract: 'Contract',
  policy: 'Policy',
}

export interface InspectorHeaderProps {
  nodeType?: NodeType
  label?: string
}

export function InspectorHeader({ nodeType, label }: InspectorHeaderProps) {
  if (!nodeType || !label) {
    return (
      <div data-testid="inspector-header" className="border-b border-border p-3">
        <p className="text-sm text-muted-foreground">No selection</p>
      </div>
    )
  }

  const Icon = NODE_TYPE_ICONS[nodeType]

  return (
    <div data-testid="inspector-header" className="border-b border-border p-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          {NODE_TYPE_LABELS[nodeType]}
        </span>
      </div>
      <h3 className="mt-1 font-medium text-foreground">{label}</h3>
    </div>
  )
}
