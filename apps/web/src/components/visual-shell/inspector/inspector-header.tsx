import type { NodeType } from '@the-crew/shared-types'
import {
  ArrowRightLeft,
  Bot,
  BrainCircuit,
  Building2,
  FileBox,
  FileText,
  Gavel,
  GitBranch,
  Globe,
  ListOrdered,
  MessageSquarePlus,
  Network,
  Shield,
  Target,
  User,
  UserCog,
  UsersRound,
  Wrench,
  Zap,
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
  artifact: 'Artifact',
  team: 'Team',
  'coordinator-agent': 'Coordinator Agent',
  'specialist-agent': 'Specialist Agent',
  objective: 'Objective',
  'event-trigger': 'Event Trigger',
  'external-source': 'External Source',
  handoff: 'Handoff',
  decision: 'Decision',
  proposal: 'Proposal',
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
