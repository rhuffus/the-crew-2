export { VERTICALER_PROJECT_ID, VERTICALER_PROJECT_NAME, VERTICALER_PROJECT_DESCRIPTION } from './verticaler.js'
export * from './live-company-types.js'
import type { OverlayId } from './live-company-types'

export interface ProjectSummary {
  id: string
  name: string
  description: string
  status: 'active' | 'archived'
  createdAt: string
  updatedAt: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

export interface CreateProjectDto {
  name: string
  description: string
}

export interface UpdateProjectDto {
  name?: string
  description?: string
  status?: 'active' | 'archived'
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}

// Company Model
/** @deprecated Live Company Pivot: replaced by ProjectSeedDto + CompanyConstitutionDto (see live-company-types.ts) */

export interface CompanyModelDto {
  projectId: string
  purpose: string
  type: string
  scope: string
  principles: string[]
  updatedAt: string
}

/** @deprecated Live Company Pivot: replaced by UpdateProjectSeedDto + UpdateConstitutionDto */
export interface UpdateCompanyModelDto {
  purpose?: string
  type?: string
  scope?: string
  principles?: string[]
}

// Departments
/** @deprecated Live Company Pivot: replaced by OrganizationalUnitDto with uoType: 'department' */

export interface DepartmentDto {
  id: string
  projectId: string
  name: string
  description: string
  mandate: string
  parentId: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateDepartmentDto {
  name: string
  description: string
  mandate: string
  parentId?: string | null
}

export interface UpdateDepartmentDto {
  name?: string
  description?: string
  mandate?: string
  parentId?: string | null
}

// Capabilities
/** @deprecated Live Company Pivot: capabilities redistributed to OrganizationalUnit.functions + AgentSkillDto */

export interface CapabilityDto {
  id: string
  projectId: string
  name: string
  description: string
  ownerDepartmentId: string | null
  inputs: string[]
  outputs: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateCapabilityDto {
  name: string
  description: string
  ownerDepartmentId?: string | null
  inputs?: string[]
  outputs?: string[]
}

export interface UpdateCapabilityDto {
  name?: string
  description?: string
  ownerDepartmentId?: string | null
  inputs?: string[]
  outputs?: string[]
}

// Contracts

export type ContractType = 'SLA' | 'DataContract' | 'InterfaceContract' | 'OperationalAgreement'
export type ContractStatus = 'draft' | 'active' | 'deprecated'
/** @deprecated Live Company Pivot: replaced by ContractPartyType and ArtifactPartyType */
export type PartyType = 'department' | 'capability'

export interface ContractDto {
  id: string
  projectId: string
  name: string
  description: string
  type: ContractType
  status: ContractStatus
  providerId: string
  providerType: PartyType
  consumerId: string
  consumerType: PartyType
  acceptanceCriteria: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateContractDto {
  name: string
  description: string
  type: ContractType
  providerId: string
  providerType: PartyType
  consumerId: string
  consumerType: PartyType
  acceptanceCriteria?: string[]
}

export interface UpdateContractDto {
  name?: string
  description?: string
  type?: ContractType
  status?: ContractStatus
  providerId?: string
  providerType?: PartyType
  consumerId?: string
  consumerType?: PartyType
  acceptanceCriteria?: string[]
}

// Workflows

export type WorkflowStatus = 'draft' | 'active' | 'archived'
/** @deprecated Live Company Pivot: replaced by LcpWorkflowParticipantType ('agent' | 'uo') */
export type WorkflowParticipantType = 'role' | 'department'

export interface WorkflowStageDto {
  name: string
  order: number
  description: string
}

export interface WorkflowParticipantDto {
  participantId: string
  participantType: WorkflowParticipantType
  responsibility: string
}

export interface WorkflowDto {
  id: string
  projectId: string
  name: string
  description: string
  ownerDepartmentId: string | null
  status: WorkflowStatus
  triggerDescription: string
  stages: WorkflowStageDto[]
  participants: WorkflowParticipantDto[]
  contractIds: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateWorkflowDto {
  name: string
  description: string
  ownerDepartmentId?: string | null
  triggerDescription?: string
  stages?: WorkflowStageDto[]
  participants?: WorkflowParticipantDto[]
  contractIds?: string[]
}

export interface UpdateWorkflowDto {
  name?: string
  description?: string
  ownerDepartmentId?: string | null
  status?: WorkflowStatus
  triggerDescription?: string
  stages?: WorkflowStageDto[]
  participants?: WorkflowParticipantDto[]
  contractIds?: string[]
}

// Policies

/** @deprecated Live Company Pivot: replaced by LcpPolicyScope (7 values) */
export type PolicyScope = 'global' | 'department'
export type PolicyType = 'approval-gate' | 'constraint' | 'rule'
export type PolicyEnforcement = 'mandatory' | 'advisory'
export type PolicyStatus = 'active' | 'inactive'

export interface PolicyDto {
  id: string
  projectId: string
  name: string
  description: string
  scope: PolicyScope
  departmentId: string | null
  type: PolicyType
  condition: string
  enforcement: PolicyEnforcement
  status: PolicyStatus
  createdAt: string
  updatedAt: string
}

export interface CreatePolicyDto {
  name: string
  description: string
  scope: PolicyScope
  departmentId?: string | null
  type: PolicyType
  condition: string
  enforcement: PolicyEnforcement
}

export interface UpdatePolicyDto {
  name?: string
  description?: string
  scope?: PolicyScope
  departmentId?: string | null
  type?: PolicyType
  condition?: string
  enforcement?: PolicyEnforcement
  status?: PolicyStatus
}

// Agent Archetypes
/** @deprecated Live Company Pivot: replaced by LcpAgentDto (unified coordinator/specialist model) */

export interface AgentArchetypeConstraintsDto {
  maxConcurrency: number | null
  allowedDepartmentIds: string[]
}

export interface AgentArchetypeDto {
  id: string
  projectId: string
  name: string
  description: string
  roleId: string
  departmentId: string
  skillIds: string[]
  constraints: AgentArchetypeConstraintsDto
  createdAt: string
  updatedAt: string
}

export interface CreateAgentArchetypeDto {
  name: string
  description: string
  roleId: string
  departmentId: string
  skillIds?: string[]
  constraints?: Partial<AgentArchetypeConstraintsDto>
}

export interface UpdateAgentArchetypeDto {
  name?: string
  description?: string
  roleId?: string
  departmentId?: string
  skillIds?: string[]
  constraints?: Partial<AgentArchetypeConstraintsDto>
}

// Skills
/** @deprecated Live Company Pivot: skills become AgentSkillDto embedded in LcpAgentDto */

export interface SkillDto {
  id: string
  projectId: string
  name: string
  description: string
  category: string
  tags: string[]
  compatibleRoleIds: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateSkillDto {
  name: string
  description: string
  category: string
  tags?: string[]
  compatibleRoleIds?: string[]
}

export interface UpdateSkillDto {
  name?: string
  description?: string
  category?: string
  tags?: string[]
  compatibleRoleIds?: string[]
}

// Agent Assignments
/** @deprecated Live Company Pivot: merged into LcpAgentDto */

export type AgentAssignmentStatus = 'active' | 'inactive'

export interface AgentAssignmentDto {
  id: string
  projectId: string
  archetypeId: string
  name: string
  status: AgentAssignmentStatus
  createdAt: string
  updatedAt: string
}

export interface CreateAgentAssignmentDto {
  archetypeId: string
  name: string
}

export interface UpdateAgentAssignmentDto {
  name?: string
  status?: AgentAssignmentStatus
}

// Roles
/** @deprecated Live Company Pivot: role becomes a string property of LcpAgentDto */

export interface RoleDto {
  id: string
  projectId: string
  name: string
  description: string
  departmentId: string
  capabilityIds: string[]
  accountability: string
  authority: string
  createdAt: string
  updatedAt: string
}

export interface CreateRoleDto {
  name: string
  description: string
  departmentId: string
  capabilityIds?: string[]
  accountability?: string
  authority?: string
}

export interface UpdateRoleDto {
  name?: string
  description?: string
  departmentId?: string
  capabilityIds?: string[]
  accountability?: string
  authority?: string
}

// Artifacts

export type ArtifactType =
  | 'document'
  | 'data'
  | 'deliverable'
  | 'decision'
  | 'template'

export type ArtifactStatus = 'draft' | 'active' | 'archived'

export interface ArtifactDto {
  id: string
  projectId: string
  name: string
  description: string
  type: ArtifactType
  status: ArtifactStatus
  producerId: string | null
  producerType: PartyType | null
  consumerIds: string[]
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateArtifactDto {
  name: string
  description: string
  type: ArtifactType
  producerId?: string | null
  producerType?: PartyType | null
  consumerIds?: string[]
  tags?: string[]
}

export interface UpdateArtifactDto {
  name?: string
  description?: string
  type?: ArtifactType
  status?: ArtifactStatus
  producerId?: string | null
  producerType?: PartyType | null
  consumerIds?: string[]
  tags?: string[]
}

// Releases

export type ReleaseStatus = 'draft' | 'published'
export type ValidationSeverity = 'error' | 'warning'

export interface ValidationIssue {
  entity: string
  entityId: string | null
  field: string | null
  message: string
  severity: ValidationSeverity
}

export interface ReleaseSnapshotDto {
  // Preserved (old model — kept during bridge phase)
  companyModel: CompanyModelDto | null
  departments: DepartmentDto[]
  capabilities: CapabilityDto[]
  roles: RoleDto[]
  agentArchetypes: AgentArchetypeDto[]
  agentAssignments: AgentAssignmentDto[]
  skills: SkillDto[]
  contracts: ContractDto[]
  workflows: WorkflowDto[]
  policies: PolicyDto[]
  artifacts: ArtifactDto[]

  // Live Company Pivot — new entities (optional during bridge phase)
  projectSeed?: import('./live-company-types').ProjectSeedDto | null
  constitution?: import('./live-company-types').CompanyConstitutionDto | null
  organizationalUnits?: import('./live-company-types').OrganizationalUnitDto[]
  agents?: import('./live-company-types').LcpAgentDto[]
  objectives?: import('./live-company-types').ObjectiveDto[]
  eventTriggers?: import('./live-company-types').EventTriggerDto[]
  externalSources?: import('./live-company-types').ExternalSourceDto[]
  proposals?: import('./live-company-types').ProposalDto[]
  decisions?: import('./live-company-types').DecisionDto[]
}

export interface ReleaseDto {
  id: string
  projectId: string
  version: string
  status: ReleaseStatus
  notes: string
  snapshot: ReleaseSnapshotDto | null
  validationIssues: ValidationIssue[]
  createdAt: string
  updatedAt: string
  publishedAt: string | null
}

export interface CreateReleaseDto {
  version: string
  notes?: string
}

export interface UpdateReleaseDto {
  version?: string
  notes?: string
}

// Validation

export interface ValidationResultDto {
  projectId: string
  issues: ValidationIssue[]
  summary: {
    errors: number
    warnings: number
  }
}

// Release Diff

export type DiffChangeType = 'added' | 'removed' | 'modified'

export type DiffEntityType =
  | 'companyModel'
  | 'department'
  | 'capability'
  | 'role'
  | 'agentArchetype'
  | 'agentAssignment'
  | 'skill'
  | 'contract'
  | 'workflow'
  | 'policy'
  | 'artifact'

export interface EntityChange {
  changeType: DiffChangeType
  entityType: DiffEntityType
  entityId: string | null
  entityName: string
  before: Record<string, unknown> | null
  after: Record<string, unknown> | null
}

export interface DiffSummary {
  added: number
  removed: number
  modified: number
}

export interface ReleaseDiffDto {
  baseReleaseId: string
  baseVersion: string
  compareReleaseId: string
  compareVersion: string
  changes: EntityChange[]
  summary: DiffSummary
}

// Audit

export type AuditAction = 'created' | 'updated' | 'deleted' | 'published'

export interface AuditEntryDto {
  id: string
  projectId: string
  entityType: string
  entityId: string
  entityName: string
  action: AuditAction
  changes: Record<string, unknown> | null
  timestamp: string
}

// --- Visual Grammar Types ---

// NodeType — v3 (LCP-012). Old values kept for backend bridge phase.
export type NodeType =
  // Organizational (always visible)
  | 'company'
  | 'department'
  | 'team'                   // v3 — UO type: team
  | 'coordinator-agent'      // v3 — replaces agent-archetype + agent-assignment for coordinators
  | 'specialist-agent'       // v3 — replaces agent-archetype + agent-assignment for specialists
  // Triggers & context
  | 'objective'              // v3 — strategic/operational goal
  | 'event-trigger'          // v3 — signal that starts workflows
  | 'external-source'        // v3 — external information source
  // Workflow
  | 'workflow'
  | 'workflow-stage'
  | 'handoff'                // v3 — explicit transfer point between stages
  // Governance & support
  | 'contract'
  | 'policy'
  | 'artifact'
  | 'decision'               // v3 — traceable decision record
  | 'proposal'               // v3 — organizational change proposal
  // Legacy (kept for backend bridge — will be removed in Phase 4)
  | 'role'
  | 'agent-archetype'
  | 'agent-assignment'
  | 'capability'
  | 'skill'

// EdgeType — v3 (LCP-012). Old values kept for backend bridge phase.
export type EdgeType =
  // Structural (always visible, neutral style)
  | 'contains'               // v3 — UO→UO, UO→Agent (parent contains child)
  | 'belongs_to'             // v3 — child→parent
  | 'reports_to'             // preserved
  // Responsibility
  | 'led_by'                 // v3 — UO→Agent (coordinator)
  | 'accountable_for'        // v3 — Agent→UO, Agent→Workflow
  | 'supervises'             // v3 — coordinator→specialist
  // Collaboration
  | 'requests_from'          // v3
  | 'delegates_to'           // v3
  | 'reviews'                // v3
  | 'approves'               // v3
  | 'hands_off_to'           // preserved
  | 'escalates_to'           // v3
  // Flow
  | 'produces'               // v3 — replaces produces_artifact
  | 'consumes'               // preserved (new meaning: Agent/UO→Artifact)
  | 'informs'                // v3
  | 'triggers'               // v3 — EventTrigger→Workflow
  // Governance
  | 'governed_by'            // v3
  | 'constrained_by'         // v3 — replaces bound_by
  | 'proposed_by'            // v3
  | 'approved_by'            // v3
  // Legacy (kept for backend bridge — will be removed in Phase 4)
  | 'owns'
  | 'assigned_to'
  | 'contributes_to'
  | 'has_skill'
  | 'compatible_with'
  | 'provides'
  | 'bound_by'
  | 'participates_in'
  | 'governs'
  | 'produces_artifact'
  | 'consumes_artifact'

// EdgeCategory — v3 (LCP-012). Old values kept for backend bridge.
export type EdgeCategory =
  // v3 categories
  | 'structural'
  | 'responsibility'
  | 'collaboration'
  | 'flow'
  | 'governance'
  // Legacy categories (kept for backend bridge)
  | 'hierarchical'
  | 'ownership'
  | 'assignment'
  | 'capability'
  | 'contract'
  | 'workflow'
  | 'artifact'

export type LayerId =
  | 'organization'
  | 'capabilities'
  | 'workflows'
  | 'contracts'
  | 'governance'
  | 'artifacts'
  | 'operations'

export type ZoomLevel = 'L1' | 'L2' | 'L3' | 'L4'

// --- v3 Node Metadata (LCP-012) ---

export type NodeCategory = 'organization' | 'agents' | 'triggers' | 'workflow' | 'support'

export const NODE_CATEGORY_MAP: Record<string, NodeCategory> = {
  'company':            'organization',
  'department':         'organization',
  'team':               'organization',
  'coordinator-agent':  'agents',
  'specialist-agent':   'agents',
  'objective':          'triggers',
  'event-trigger':      'triggers',
  'external-source':    'triggers',
  'workflow':           'workflow',
  'workflow-stage':     'workflow',
  'handoff':            'workflow',
  'contract':           'support',
  'policy':             'support',
  'artifact':           'support',
  'decision':           'support',
  'proposal':           'support',
  // Legacy mappings
  'role':               'organization',
  'agent-archetype':    'agents',
  'agent-assignment':   'agents',
  'capability':         'support',
  'skill':              'support',
}

export const NODE_CATEGORY_LABELS: Record<NodeCategory, string> = {
  organization: 'Organization',
  agents:       'Agents',
  triggers:     'Triggers & Context',
  workflow:     'Workflow',
  support:      'Support',
}

export const NODE_CATEGORY_ORDER: NodeCategory[] = [
  'organization', 'agents', 'triggers', 'workflow', 'support',
]

export const NODE_TYPE_LABELS: Record<string, string> = {
  'company':            'Company',
  'department':         'Department',
  'team':               'Team',
  'coordinator-agent':  'Coordinator Agent',
  'specialist-agent':   'Specialist Agent',
  'objective':          'Objective',
  'event-trigger':      'Event Trigger',
  'external-source':    'External Source',
  'workflow':           'Workflow',
  'workflow-stage':     'Stage',
  'handoff':            'Handoff',
  'contract':           'Contract',
  'policy':             'Policy',
  'artifact':           'Artifact',
  'decision':           'Decision',
  'proposal':           'Proposal',
  // Legacy
  'role':               'Role',
  'agent-archetype':    'Agent Archetype',
  'agent-assignment':   'Agent Assignment',
  'capability':         'Capability',
  'skill':              'Skill',
}

/** Lucide icon name per node type (string reference, resolved in frontend) */
export const NODE_TYPE_ICONS: Record<string, string> = {
  'company':            'Building2',
  'department':         'Users',
  'team':               'UsersRound',
  'coordinator-agent':  'BrainCircuit',
  'specialist-agent':   'Bot',
  'objective':          'Target',
  'event-trigger':      'Zap',
  'external-source':    'Globe',
  'workflow':           'Workflow',
  'workflow-stage':     'GitBranch',
  'handoff':            'ArrowRightLeft',
  'contract':           'FileText',
  'policy':             'Shield',
  'artifact':           'Package',
  'decision':           'Gavel',
  'proposal':           'MessageSquarePlus',
  // Legacy
  'role':               'UserCircle',
  'agent-archetype':    'BrainCircuit',
  'agent-assignment':   'Bot',
  'capability':         'Puzzle',
  'skill':              'Sparkles',
}

/** v3 node status colors (CSS class names) */
export const NODE_STATUS_COLORS = {
  normal:   'border-slate-300 bg-white',
  active:   'border-green-500 bg-green-50',
  warning:  'border-yellow-500 bg-yellow-50',
  error:    'border-red-500 bg-red-50',
  dimmed:   'border-slate-200 bg-slate-50 opacity-60',
  proposed: 'border-blue-400 bg-blue-50 border-dashed',
  retired:  'border-slate-300 bg-slate-100 opacity-40 line-through',
} as const

// --- v3 Edge Metadata (LCP-012) ---

export const EDGE_TO_CATEGORY: Record<string, EdgeCategory> = {
  'contains':        'structural',
  'belongs_to':      'structural',
  'reports_to':      'structural',
  'led_by':          'responsibility',
  'accountable_for': 'responsibility',
  'supervises':      'responsibility',
  'requests_from':   'collaboration',
  'delegates_to':    'collaboration',
  'reviews':         'collaboration',
  'approves':        'collaboration',
  'hands_off_to':    'collaboration',
  'escalates_to':    'collaboration',
  'produces':        'flow',
  'consumes':        'flow',
  'informs':         'flow',
  'triggers':        'flow',
  'governed_by':     'governance',
  'constrained_by':  'governance',
  'proposed_by':     'governance',
  'approved_by':     'governance',
  // Legacy mappings
  'owns':              'ownership',
  'assigned_to':       'assignment',
  'contributes_to':    'capability',
  'has_skill':         'capability',
  'compatible_with':   'capability',
  'provides':          'contract',
  'bound_by':          'contract',
  'participates_in':   'workflow',
  'governs':           'governance',
  'produces_artifact': 'artifact',
  'consumes_artifact': 'artifact',
}

export const EDGE_TYPE_LABELS: Record<string, string> = {
  'contains':        'Contains',
  'belongs_to':      'Belongs to',
  'reports_to':      'Reports to',
  'led_by':          'Led by',
  'accountable_for': 'Accountable for',
  'supervises':      'Supervises',
  'requests_from':   'Requests from',
  'delegates_to':    'Delegates to',
  'reviews':         'Reviews',
  'approves':        'Approves',
  'hands_off_to':    'Hands off to',
  'escalates_to':    'Escalates to',
  'produces':        'Produces',
  'consumes':        'Consumes',
  'informs':         'Informs',
  'triggers':        'Triggers',
  'governed_by':     'Governed by',
  'constrained_by':  'Constrained by',
  'proposed_by':     'Proposed by',
  'approved_by':     'Approved by',
  // Legacy
  'owns':              'Owns',
  'assigned_to':       'Assigned to',
  'contributes_to':    'Contributes to',
  'has_skill':         'Has skill',
  'compatible_with':   'Compatible with',
  'provides':          'Provides',
  'bound_by':          'Bound by',
  'participates_in':   'Participates in',
  'governs':           'Governs',
  'produces_artifact': 'Produces artifact',
  'consumes_artifact': 'Consumes artifact',
}

export const EDGE_CATEGORY_LABELS: Record<string, string> = {
  structural:     'Structural',
  responsibility: 'Responsibility',
  collaboration:  'Collaboration',
  flow:           'Flow',
  governance:     'Governance',
  // Legacy
  hierarchical: 'Hierarchical',
  ownership:    'Ownership',
  assignment:   'Assignment',
  capability:   'Capability',
  contract:     'Contract',
  workflow:     'Workflow',
  artifact:     'Artifact',
}

export interface EdgeStyleDef {
  stroke: string
  strokeWidth: number
  strokeDasharray: string
  animated: boolean
  zIndex: number
}

export const EDGE_CATEGORY_STYLES: Record<string, EdgeStyleDef> = {
  structural: {
    stroke: 'slate-400',
    strokeWidth: 2,
    strokeDasharray: 'none',
    animated: false,
    zIndex: 0,
  },
  responsibility: {
    stroke: 'blue-500',
    strokeWidth: 1.5,
    strokeDasharray: 'none',
    animated: false,
    zIndex: 1,
  },
  collaboration: {
    stroke: 'amber-500',
    strokeWidth: 1.5,
    strokeDasharray: '8 4',
    animated: false,
    zIndex: 2,
  },
  flow: {
    stroke: 'emerald-500',
    strokeWidth: 1.5,
    strokeDasharray: '4 2',
    animated: false,
    zIndex: 2,
  },
  governance: {
    stroke: 'purple-400',
    strokeWidth: 1,
    strokeDasharray: '4 4',
    animated: false,
    zIndex: 1,
  },
}

/** Edges that are auto-generated, not manually drawn */
export const NON_CREATABLE_EDGES: readonly EdgeType[] = [
  'contains',
  'belongs_to',
  'proposed_by',
  'approved_by',
]

/** v3 container node types that can hold children */
export const CONTAINER_NODE_TYPES: readonly NodeType[] = [
  'company', 'department', 'team',
]

/** v3 node types that are drillable (double-click to navigate into) */
export const DRILLABLE_NODE_TYPES: readonly NodeType[] = [
  'company', 'department', 'team', 'coordinator-agent', 'specialist-agent',
]

// --- Generic Scope Model (CAV-011 + LCP-012 v3) ---

export type ScopeType =
  | 'company'
  | 'department'
  | 'team'              // v3 — drill into team
  | 'agent-detail'      // v3 — drill into agent
  // Legacy (kept for backend bridge)
  | 'workflow'
  | 'workflow-stage'

export interface ScopeDescriptor {
  scopeType: ScopeType
  entityId: string | null
  zoomLevel: ZoomLevel
}

export interface ScopeDefinition {
  scopeType: ScopeType
  rootNodeType: NodeType
  zoomLevel: ZoomLevel
  requiresEntityId: boolean
  defaultLayers: LayerId[]
  defaultOverlays: OverlayId[]
  drillableChildScopes: ScopeType[]
  parentScopeTypes: ScopeType[]
  label: string
}

export const SCOPE_REGISTRY: Record<ScopeType, ScopeDefinition> = {
  company: {
    scopeType: 'company',
    rootNodeType: 'company',
    zoomLevel: 'L1',
    requiresEntityId: false,
    defaultLayers: ['organization'],
    defaultOverlays: ['organization'],
    drillableChildScopes: ['department'],
    parentScopeTypes: [],
    label: 'Organization',
  },
  department: {
    scopeType: 'department',
    rootNodeType: 'department',
    zoomLevel: 'L2',
    requiresEntityId: true,
    defaultLayers: ['organization', 'capabilities'],
    defaultOverlays: ['organization', 'work'],
    drillableChildScopes: ['department', 'team'],
    parentScopeTypes: ['company', 'department'],
    label: 'Department',
  },
  team: {
    scopeType: 'team',
    rootNodeType: 'team',
    zoomLevel: 'L3',
    requiresEntityId: true,
    defaultLayers: ['organization', 'workflows'],
    defaultOverlays: ['organization', 'work'],
    drillableChildScopes: ['agent-detail'],
    parentScopeTypes: ['department'],
    label: 'Team',
  },
  'agent-detail': {
    scopeType: 'agent-detail',
    rootNodeType: 'coordinator-agent',
    zoomLevel: 'L4',
    requiresEntityId: true,
    defaultLayers: ['organization', 'workflows', 'artifacts'],
    defaultOverlays: ['organization', 'work', 'deliverables'],
    drillableChildScopes: [],
    parentScopeTypes: ['team', 'department'],
    label: 'Agent Detail',
  },
  // Legacy scopes (kept for backend bridge)
  workflow: {
    scopeType: 'workflow',
    rootNodeType: 'workflow',
    zoomLevel: 'L3',
    requiresEntityId: true,
    defaultLayers: ['workflows'],
    defaultOverlays: ['organization', 'work'],
    drillableChildScopes: ['workflow-stage'],
    parentScopeTypes: ['department', 'company'],
    label: 'Workflow',
  },
  'workflow-stage': {
    scopeType: 'workflow-stage',
    rootNodeType: 'workflow-stage',
    zoomLevel: 'L4',
    requiresEntityId: true,
    defaultLayers: ['workflows'],
    defaultOverlays: ['organization', 'work', 'deliverables'],
    drillableChildScopes: [],
    parentScopeTypes: ['workflow'],
    label: 'Stage',
  },
}

export function getScopeDefinition(scopeType: ScopeType): ScopeDefinition {
  return SCOPE_REGISTRY[scopeType]
}

export function isDrillableScopeType(nodeType: NodeType): boolean {
  return (DRILLABLE_NODE_TYPES as readonly string[]).includes(nodeType)
    || Object.values(SCOPE_REGISTRY).some(def => def.rootNodeType === nodeType)
}

export function getZoomLevelForScope(scopeType: ScopeType): ZoomLevel {
  return SCOPE_REGISTRY[scopeType].zoomLevel
}

export function scopeTypeFromZoomLevel(level: ZoomLevel): ScopeType {
  switch (level) {
    case 'L1': return 'company'
    case 'L2': return 'department'
    case 'L3': return 'team'
    case 'L4': return 'agent-detail'
  }
}
export type NodeStatus = 'normal' | 'warning' | 'error' | 'dimmed' | 'active' | 'proposed' | 'retired'
export type EdgeStyle = 'solid' | 'dashed' | 'dotted'

export interface CanvasPosition {
  x: number
  y: number
}

export interface VisualNodeDto {
  id: string
  nodeType: NodeType
  entityId: string
  label: string
  sublabel: string | null
  position: CanvasPosition | null
  collapsed: boolean
  status: NodeStatus
  layerIds: LayerId[]
  /** v3 overlay assignment (LCP-012) — computed from nodeType */
  overlayId?: OverlayId
  parentId: string | null
}

export interface VisualEdgeDto {
  id: string
  edgeType: EdgeType
  sourceId: string
  targetId: string
  label: string | null
  style: EdgeStyle
  layerIds: LayerId[]
  /** v3 edge category (LCP-012) — computed from edgeType */
  category?: EdgeCategory
}

export interface GraphScope {
  level: ZoomLevel
  entityId: string | null
  entityType: NodeType | null
}

export interface BreadcrumbEntry {
  label: string
  nodeType: NodeType
  entityId: string
  zoomLevel: ZoomLevel
}

export interface VisualGraphDto {
  projectId: string
  scopeType: ScopeType
  scope: GraphScope
  zoomLevel: ZoomLevel
  nodes: VisualNodeDto[]
  edges: VisualEdgeDto[]
  activeLayers: LayerId[]
  breadcrumb: BreadcrumbEntry[]
}

export interface ConnectionRule {
  edgeType: EdgeType
  sourceTypes: NodeType[]
  targetTypes: NodeType[]
  category: EdgeCategory
  style: EdgeStyle
}

export interface LayerDefinition {
  id: LayerId
  label: string
  nodeTypes: NodeType[]
  edgeTypes: EdgeType[]
}

/** @deprecated Legacy connection rules — use CONNECTION_RULES_V3 for new code */
export const CONNECTION_RULES: ConnectionRule[] = [
  { edgeType: 'reports_to', sourceTypes: ['department'], targetTypes: ['department'], category: 'hierarchical', style: 'solid' },
  { edgeType: 'owns', sourceTypes: ['department'], targetTypes: ['capability'], category: 'ownership', style: 'solid' },
  { edgeType: 'owns', sourceTypes: ['department'], targetTypes: ['workflow'], category: 'ownership', style: 'solid' },
  { edgeType: 'assigned_to', sourceTypes: ['agent-archetype'], targetTypes: ['role'], category: 'assignment', style: 'dashed' },
  { edgeType: 'contributes_to', sourceTypes: ['role'], targetTypes: ['capability'], category: 'capability', style: 'dotted' },
  { edgeType: 'has_skill', sourceTypes: ['agent-archetype'], targetTypes: ['skill'], category: 'capability', style: 'dotted' },
  { edgeType: 'compatible_with', sourceTypes: ['skill'], targetTypes: ['role'], category: 'capability', style: 'dotted' },
  { edgeType: 'provides', sourceTypes: ['department', 'capability'], targetTypes: ['contract'], category: 'contract', style: 'solid' },
  { edgeType: 'consumes', sourceTypes: ['department', 'capability'], targetTypes: ['contract'], category: 'contract', style: 'solid' },
  { edgeType: 'bound_by', sourceTypes: ['workflow'], targetTypes: ['contract'], category: 'contract', style: 'dashed' },
  { edgeType: 'participates_in', sourceTypes: ['role', 'department'], targetTypes: ['workflow'], category: 'workflow', style: 'dotted' },
  { edgeType: 'hands_off_to', sourceTypes: ['workflow-stage'], targetTypes: ['workflow-stage'], category: 'workflow', style: 'solid' },
  { edgeType: 'governs', sourceTypes: ['policy'], targetTypes: ['department', 'company'], category: 'governance', style: 'dashed' },
  { edgeType: 'produces_artifact', sourceTypes: ['department', 'capability'], targetTypes: ['artifact'], category: 'artifact', style: 'solid' },
  { edgeType: 'consumes_artifact', sourceTypes: ['department', 'capability'], targetTypes: ['artifact'], category: 'artifact', style: 'dashed' },
]

/** v3 connection rules (LCP-012) — UO + agents centered model */
export const CONNECTION_RULES_V3: ConnectionRule[] = [
  // Structural
  { edgeType: 'contains',       sourceTypes: ['company', 'department', 'team'], targetTypes: ['department', 'team', 'coordinator-agent', 'specialist-agent'], category: 'structural', style: 'solid' },
  { edgeType: 'belongs_to',     sourceTypes: ['department', 'team', 'coordinator-agent', 'specialist-agent'], targetTypes: ['company', 'department', 'team'], category: 'structural', style: 'solid' },
  { edgeType: 'reports_to',     sourceTypes: ['department', 'team'], targetTypes: ['company', 'department'], category: 'structural', style: 'solid' },
  // Responsibility
  { edgeType: 'led_by',          sourceTypes: ['company', 'department', 'team'], targetTypes: ['coordinator-agent'], category: 'responsibility', style: 'solid' },
  { edgeType: 'accountable_for', sourceTypes: ['coordinator-agent'], targetTypes: ['company', 'department', 'team', 'workflow'], category: 'responsibility', style: 'solid' },
  { edgeType: 'supervises',      sourceTypes: ['coordinator-agent'], targetTypes: ['specialist-agent', 'coordinator-agent'], category: 'responsibility', style: 'solid' },
  // Collaboration
  { edgeType: 'requests_from',   sourceTypes: ['coordinator-agent', 'specialist-agent', 'company', 'department', 'team'], targetTypes: ['coordinator-agent', 'specialist-agent', 'company', 'department', 'team'], category: 'collaboration', style: 'dashed' },
  { edgeType: 'delegates_to',    sourceTypes: ['coordinator-agent', 'specialist-agent'], targetTypes: ['coordinator-agent', 'specialist-agent'], category: 'collaboration', style: 'dashed' },
  { edgeType: 'reviews',         sourceTypes: ['coordinator-agent', 'specialist-agent'], targetTypes: ['artifact', 'handoff'], category: 'collaboration', style: 'dashed' },
  { edgeType: 'approves',        sourceTypes: ['coordinator-agent'], targetTypes: ['proposal', 'decision'], category: 'collaboration', style: 'dashed' },
  { edgeType: 'hands_off_to',    sourceTypes: ['workflow-stage', 'coordinator-agent', 'specialist-agent'], targetTypes: ['workflow-stage', 'coordinator-agent', 'specialist-agent'], category: 'collaboration', style: 'dashed' },
  { edgeType: 'escalates_to',    sourceTypes: ['coordinator-agent', 'specialist-agent'], targetTypes: ['coordinator-agent'], category: 'collaboration', style: 'dashed' },
  // Flow
  { edgeType: 'produces',  sourceTypes: ['coordinator-agent', 'specialist-agent', 'company', 'department', 'team', 'workflow-stage'], targetTypes: ['artifact'], category: 'flow', style: 'dotted' },
  { edgeType: 'consumes',  sourceTypes: ['coordinator-agent', 'specialist-agent', 'company', 'department', 'team', 'workflow-stage'], targetTypes: ['artifact'], category: 'flow', style: 'dotted' },
  { edgeType: 'informs',   sourceTypes: ['coordinator-agent', 'specialist-agent', 'external-source', 'event-trigger'], targetTypes: ['coordinator-agent', 'specialist-agent', 'company', 'department', 'team'], category: 'flow', style: 'dotted' },
  { edgeType: 'triggers',  sourceTypes: ['event-trigger', 'objective', 'external-source'], targetTypes: ['workflow'], category: 'flow', style: 'dotted' },
  // Governance
  { edgeType: 'governed_by',    sourceTypes: ['company', 'department', 'team', 'coordinator-agent', 'specialist-agent', 'workflow', 'handoff', 'artifact'], targetTypes: ['policy'], category: 'governance', style: 'dashed' },
  { edgeType: 'constrained_by', sourceTypes: ['company', 'department', 'team', 'coordinator-agent', 'specialist-agent', 'workflow', 'handoff'], targetTypes: ['policy', 'contract'], category: 'governance', style: 'dashed' },
  { edgeType: 'proposed_by',    sourceTypes: ['proposal'], targetTypes: ['coordinator-agent', 'specialist-agent'], category: 'governance', style: 'dashed' },
  { edgeType: 'approved_by',    sourceTypes: ['decision', 'proposal'], targetTypes: ['coordinator-agent'], category: 'governance', style: 'dashed' },
]

export const LAYER_DEFINITIONS: LayerDefinition[] = [
  {
    id: 'organization',
    label: 'Organization',
    nodeTypes: ['company', 'department', 'role', 'agent-archetype', 'agent-assignment'],
    edgeTypes: ['reports_to', 'assigned_to'],
  },
  {
    id: 'capabilities',
    label: 'Capabilities',
    nodeTypes: ['capability', 'skill'],
    edgeTypes: ['owns', 'contributes_to', 'has_skill', 'compatible_with'],
  },
  {
    id: 'workflows',
    label: 'Workflows',
    nodeTypes: ['workflow', 'workflow-stage'],
    edgeTypes: ['owns', 'participates_in', 'hands_off_to'],
  },
  {
    id: 'contracts',
    label: 'Contracts',
    nodeTypes: ['contract'],
    edgeTypes: ['provides', 'consumes', 'bound_by'],
  },
  {
    id: 'governance',
    label: 'Governance',
    nodeTypes: ['policy'],
    edgeTypes: ['governs'],
  },
  {
    id: 'artifacts',
    label: 'Artifacts',
    nodeTypes: ['artifact'],
    edgeTypes: ['produces_artifact', 'consumes_artifact'],
  },
  {
    id: 'operations',
    label: 'Operations',
    nodeTypes: [],
    edgeTypes: [],
  },
]

// --- Visual Diff Types ---

export type VisualDiffStatus = 'added' | 'removed' | 'modified' | 'unchanged'

export interface VisualNodeDiffDto extends VisualNodeDto {
  diffStatus: VisualDiffStatus
  /** Field-level changes when diffStatus is 'modified'. Keys: changed field names, values: { before, after }. */
  changes?: Record<string, { before: unknown; after: unknown }>
}

export interface VisualEdgeDiffDto extends VisualEdgeDto {
  diffStatus: VisualDiffStatus
}

export interface VisualDiffSummary {
  nodesAdded: number
  nodesRemoved: number
  nodesModified: number
  nodesUnchanged: number
  edgesAdded: number
  edgesRemoved: number
  edgesModified: number
  edgesUnchanged: number
}

export interface VisualGraphDiffDto {
  projectId: string
  scopeType: ScopeType
  scope: GraphScope
  zoomLevel: ZoomLevel
  baseReleaseId: string
  compareReleaseId: string
  nodes: VisualNodeDiffDto[]
  edges: VisualEdgeDiffDto[]
  activeLayers: LayerId[]
  breadcrumb: BreadcrumbEntry[]
  summary: VisualDiffSummary
}

export const DEFAULT_LAYERS_PER_LEVEL: Record<ZoomLevel, LayerId[]> = {
  L1: ['organization'],
  L2: ['organization', 'capabilities'],
  L3: ['workflows'],
  L4: ['workflows'],
}

// --- Overlay Model (LCP-010 + LCP-012 v3) ---
// Overlays replace layers as the user-facing concept.
// Organization is always active; the other 4 are toggleable perspectives.
// OverlayId is defined in live-company-types.ts and re-exported above.

export interface OverlayDefinition {
  id: OverlayId
  label: string
  description: string
  /** Constituent LayerIds — bridge to existing layer-based plumbing */
  layerIds: LayerId[]
  /** Whether this overlay is always active (cannot be toggled off) */
  locked: boolean
  /** v3: node types visible when this overlay is active */
  nodeTypes: NodeType[]
  /** v3: edge types visible when this overlay is active */
  edgeTypes: EdgeType[]
}

export const OVERLAY_DEFINITIONS: OverlayDefinition[] = [
  {
    id: 'organization',
    label: 'Organization',
    description: 'Company structure: units, agents, hierarchy',
    layerIds: ['organization'],
    locked: true,
    nodeTypes: ['company', 'department', 'team', 'coordinator-agent', 'specialist-agent'],
    edgeTypes: ['contains', 'belongs_to', 'reports_to', 'led_by', 'accountable_for', 'supervises'],
  },
  {
    id: 'work',
    label: 'Work',
    description: 'Workflows, collaboration, handoffs',
    layerIds: ['workflows'],
    locked: false,
    nodeTypes: ['workflow', 'workflow-stage', 'handoff', 'objective', 'event-trigger', 'external-source'],
    edgeTypes: ['requests_from', 'delegates_to', 'reviews', 'approves', 'hands_off_to', 'escalates_to', 'triggers', 'informs'],
  },
  {
    id: 'deliverables',
    label: 'Deliverables',
    description: 'Artifacts, documents, outputs',
    layerIds: ['artifacts'],
    locked: false,
    nodeTypes: ['artifact'],
    edgeTypes: ['produces', 'consumes'],
  },
  {
    id: 'rules',
    label: 'Rules',
    description: 'Contracts, policies, governance',
    layerIds: ['contracts', 'governance'],
    locked: false,
    nodeTypes: ['contract', 'policy', 'proposal', 'decision'],
    edgeTypes: ['governed_by', 'constrained_by', 'proposed_by', 'approved_by'],
  },
  {
    id: 'live-status',
    label: 'Live Status',
    description: 'Runtime activity, errors, queue state',
    layerIds: ['operations'],
    locked: false,
    nodeTypes: [],
    edgeTypes: [],
  },
]

export function overlayToLayers(overlayId: OverlayId): LayerId[] {
  const def = OVERLAY_DEFINITIONS.find(d => d.id === overlayId)
  return def ? def.layerIds : []
}

export function overlaysToLayers(overlayIds: OverlayId[]): LayerId[] {
  const layers = new Set<LayerId>()
  for (const oid of overlayIds) {
    for (const lid of overlayToLayers(oid)) {
      layers.add(lid)
    }
  }
  return [...layers]
}

export function isOverlayActive(activeLayers: LayerId[], overlayId: OverlayId): boolean {
  const requiredLayers = overlayToLayers(overlayId)
  return requiredLayers.length > 0 && requiredLayers.every(l => activeLayers.includes(l))
}

export function layersToOverlays(activeLayers: LayerId[]): OverlayId[] {
  return OVERLAY_DEFINITIONS
    .filter(def => def.layerIds.every(l => activeLayers.includes(l)))
    .map(def => def.id)
}

export const DEFAULT_OVERLAYS_PER_LEVEL: Record<ZoomLevel, OverlayId[]> = {
  L1: ['organization'],
  L2: ['organization', 'work'],
  L3: ['organization', 'work'],
  L4: ['organization', 'work', 'deliverables'],
}

/** Get the overlay a node type belongs to (v3) */
export function getNodeOverlay(nodeType: NodeType): OverlayId | null {
  for (const def of OVERLAY_DEFINITIONS) {
    if ((def.nodeTypes as string[]).includes(nodeType)) return def.id
  }
  return null
}

/** Filter nodes by active overlays (v3) */
export function filterNodesByOverlays(
  nodes: VisualNodeDto[],
  activeOverlays: OverlayId[],
): VisualNodeDto[] {
  const visibleTypes = new Set<string>()
  for (const oid of activeOverlays) {
    const def = OVERLAY_DEFINITIONS.find(d => d.id === oid)
    if (def) for (const nt of def.nodeTypes) visibleTypes.add(nt)
  }
  return nodes.filter(n => visibleTypes.has(n.nodeType))
}

/** Filter edges by active overlays + visible nodes (v3) */
export function filterEdgesByOverlays(
  edges: VisualEdgeDto[],
  visibleNodeIds: Set<string>,
  activeOverlays: OverlayId[],
): VisualEdgeDto[] {
  const visibleEdgeTypes = new Set<string>()
  for (const oid of activeOverlays) {
    const def = OVERLAY_DEFINITIONS.find(d => d.id === oid)
    if (def) for (const et of def.edgeTypes) visibleEdgeTypes.add(et)
  }
  return edges.filter(e =>
    visibleNodeIds.has(e.sourceId)
    && visibleNodeIds.has(e.targetId)
    && visibleEdgeTypes.has(e.edgeType)
  )
}

// --- Saved Views ---

export interface ViewStateDto {
  activeLayers: LayerId[]
  nodeTypeFilter: NodeType[] | null
  statusFilter: NodeStatus[] | null
  activePreset?: ViewPresetId | null
}

export interface SavedViewDto {
  id: string
  projectId: string
  name: string
  state: ViewStateDto
  createdAt: string
  updatedAt: string
}

export interface CreateSavedViewDto {
  name: string
  state: ViewStateDto
}

export interface UpdateSavedViewDto {
  name?: string
  state?: ViewStateDto
}

// --- Chat Types ---

export type ChatMessageRole = 'user' | 'assistant' | 'system'

export interface ChatEntityRef {
  entityId: string
  entityType: NodeType
  label: string
  scopeType?: ScopeType
}

export type ChatActionType =
  | 'navigate'
  | 'create-entity'
  | 'edit-entity'
  | 'add-relation'
  | 'run-validation'

export interface ChatActionSuggestion {
  type: ChatActionType
  label: string
  payload: Record<string, string>
}

export interface ChatMessageDto {
  id: string
  threadId: string
  role: ChatMessageRole
  content: string
  entityRefs: ChatEntityRef[]
  actions: ChatActionSuggestion[]
  createdAt: string
}

export interface ChatThreadDto {
  id: string
  projectId: string
  scopeType: ScopeType
  entityId: string | null
  title: string
  messageCount: number
  lastMessageAt: string | null
  createdAt: string
}

export interface CreateChatMessageDto {
  content: string
  entityRefs?: ChatEntityRef[]
}

// --- View Presets ---

export type ViewPresetId =
  | 'organization'
  | 'work'
  | 'deliverables'
  | 'rules'
  | 'live-status'
  // Legacy presets (kept for backend bridge)
  | 'capabilities'
  | 'workflows'
  | 'contracts'
  | 'artifact-flow'
  | 'governance'
  | 'operations'

export interface ViewPresetDefinition {
  id: ViewPresetId
  label: string
  description: string
  icon: string
  layers: LayerId[]
  /** v3: overlay IDs to activate for this preset */
  overlays?: OverlayId[]
  emphasisNodeTypes: NodeType[] | null
  emphasisEdgeTypes: EdgeType[] | null
  availableAtScopes: ScopeType[]
  requiresLayer?: LayerId
}

// --- Permission Types (CAV-020) ---

export type PlatformRole = 'platform:owner' | 'platform:member'

export type ProjectRole =
  | 'project:admin'
  | 'project:editor'
  | 'project:commenter'
  | 'project:viewer'

export interface PermissionManifest {
  platformRole: PlatformRole | null
  projectRole: ProjectRole | null
  permissions: string[]
}

const VIEWER_PERMISSIONS = [
  'project:view',
  'canvas:drilldown', 'canvas:select', 'canvas:zoom', 'canvas:layers:toggle',
  'chat:read',
  'release:diff:view',
  'admin:view', 'admin:audit:view', 'admin:validation:view',
  'operations:view',
] as const

const COMMENTER_PERMISSIONS = [
  'chat:write:company', 'chat:write:department', 'chat:write:node',
  'chat:delete:own',
  'comment:create', 'comment:edit:own', 'comment:delete:own', 'comment:resolve:own',
] as const

const EDITOR_PERMISSIONS = [
  'canvas:node:create', 'canvas:node:edit', 'canvas:node:delete', 'canvas:node:move',
  'canvas:edge:create', 'canvas:edge:edit', 'canvas:edge:delete',
  'canvas:layout:auto', 'canvas:layout:save',
  'model:company:edit',
  'model:department:create', 'model:department:edit', 'model:department:delete',
  'model:role:create', 'model:role:edit', 'model:role:delete',
  'model:capability:create', 'model:capability:edit', 'model:capability:delete',
  'model:workflow:create', 'model:workflow:edit', 'model:workflow:delete',
  'model:contract:create', 'model:contract:edit', 'model:contract:delete',
  'model:policy:create', 'model:policy:edit', 'model:policy:delete',
  'model:agent-archetype:create', 'model:agent-archetype:edit', 'model:agent-archetype:delete',
  'model:agent-assignment:create', 'model:agent-assignment:edit', 'model:agent-assignment:delete',
  'model:skill:create', 'model:skill:edit', 'model:skill:delete',
  'release:create', 'release:edit',
  'admin:validation:run',
  'comment:resolve:any', 'comment:delete:any',
  'review:create', 'review:update',
  'lock:acquire', 'lock:release:own',
  'operations:run:create', 'operations:run:advance',
  'operations:incident:create', 'operations:incident:update',
  'operations:compliance:set',
] as const

const ADMIN_PERMISSIONS = [
  'project:members:manage', 'project:settings:edit', 'project:delete',
  'release:publish', 'release:delete',
  'chat:delete:any', 'chat:export',
  'lock:release:any',
] as const

export const ROLE_PERMISSIONS: Record<ProjectRole, readonly string[]> = {
  'project:viewer': [...VIEWER_PERMISSIONS],
  'project:commenter': [...VIEWER_PERMISSIONS, ...COMMENTER_PERMISSIONS],
  'project:editor': [...VIEWER_PERMISSIONS, ...COMMENTER_PERMISSIONS, ...EDITOR_PERMISSIONS],
  'project:admin': [...VIEWER_PERMISSIONS, ...COMMENTER_PERMISSIONS, ...EDITOR_PERMISSIONS, ...ADMIN_PERMISSIONS],
}

export function resolvePermissions(projectRole: ProjectRole): string[] {
  return [...ROLE_PERMISSIONS[projectRole]]
}

export function hasPermission(manifest: PermissionManifest, permission: string): boolean {
  return manifest.permissions.includes(permission)
}

export function hasAnyPermission(manifest: PermissionManifest, permissions: string[]): boolean {
  return permissions.some(p => manifest.permissions.includes(p))
}

export function buildManifest(
  projectRole: ProjectRole,
  platformRole: PlatformRole | null = null,
): PermissionManifest {
  return {
    platformRole,
    projectRole,
    permissions: resolvePermissions(projectRole),
  }
}

export const VIEW_PRESET_REGISTRY: Record<ViewPresetId, ViewPresetDefinition> = {
  // v3 presets (LCP-012)
  organization: {
    id: 'organization',
    label: 'Organization',
    description: 'Company structure: units, agents, hierarchy',
    icon: 'Building2',
    layers: ['organization'],
    overlays: ['organization'],
    emphasisNodeTypes: ['company', 'department', 'team', 'coordinator-agent', 'specialist-agent'],
    emphasisEdgeTypes: ['contains', 'belongs_to', 'reports_to', 'led_by', 'supervises'],
    availableAtScopes: ['company', 'department', 'team'],
  },
  work: {
    id: 'work',
    label: 'Work',
    description: 'Workflows, collaboration, handoffs',
    icon: 'Workflow',
    layers: ['organization', 'workflows'],
    overlays: ['organization', 'work'],
    emphasisNodeTypes: ['workflow', 'workflow-stage', 'handoff', 'objective', 'event-trigger'],
    emphasisEdgeTypes: ['requests_from', 'delegates_to', 'hands_off_to', 'reviews', 'triggers'],
    availableAtScopes: ['company', 'department', 'team'],
  },
  deliverables: {
    id: 'deliverables',
    label: 'Deliverables',
    description: 'Artifacts, documents, outputs',
    icon: 'Package',
    layers: ['organization', 'artifacts'],
    overlays: ['organization', 'deliverables'],
    emphasisNodeTypes: ['artifact', 'coordinator-agent', 'specialist-agent'],
    emphasisEdgeTypes: ['produces', 'consumes'],
    availableAtScopes: ['company', 'department', 'team', 'agent-detail'],
  },
  rules: {
    id: 'rules',
    label: 'Rules',
    description: 'Contracts, policies, governance',
    icon: 'Shield',
    layers: ['organization', 'contracts', 'governance'],
    overlays: ['organization', 'rules'],
    emphasisNodeTypes: ['contract', 'policy', 'proposal', 'decision'],
    emphasisEdgeTypes: ['governed_by', 'constrained_by', 'approved_by'],
    availableAtScopes: ['company', 'department', 'team'],
  },
  'live-status': {
    id: 'live-status',
    label: 'Live Status',
    description: 'Runtime activity, errors, queue state',
    icon: 'Activity',
    layers: ['organization', 'workflows', 'operations'],
    overlays: ['organization', 'live-status'],
    emphasisNodeTypes: null,
    emphasisEdgeTypes: null,
    availableAtScopes: ['company', 'department', 'team'],
  },
  // Legacy presets (kept for backward compat)
  capabilities: {
    id: 'capabilities',
    label: 'Capabilities',
    description: 'Capabilities, skills, ownership, and contribution',
    icon: 'Puzzle',
    layers: ['organization', 'capabilities'],
    emphasisNodeTypes: ['department', 'capability', 'skill', 'role'],
    emphasisEdgeTypes: ['owns', 'contributes_to', 'has_skill', 'compatible_with'],
    availableAtScopes: ['company', 'department'],
  },
  workflows: {
    id: 'workflows',
    label: 'Workflows',
    description: 'Processes, stages, participants, and handoffs',
    icon: 'Workflow',
    layers: ['organization', 'workflows'],
    emphasisNodeTypes: ['workflow', 'workflow-stage', 'department', 'role'],
    emphasisEdgeTypes: ['owns', 'participates_in', 'hands_off_to'],
    availableAtScopes: ['company', 'department', 'workflow', 'workflow-stage'],
  },
  contracts: {
    id: 'contracts',
    label: 'Contracts',
    description: 'Agreements, providers, consumers, and bindings',
    icon: 'FileSignature',
    layers: ['organization', 'capabilities', 'contracts'],
    emphasisNodeTypes: ['department', 'capability', 'contract', 'workflow'],
    emphasisEdgeTypes: ['provides', 'consumes', 'bound_by'],
    availableAtScopes: ['company', 'department', 'workflow'],
  },
  'artifact-flow': {
    id: 'artifact-flow',
    label: 'Artifact Flow',
    description: 'Documents, deliverables, and data flowing through the company',
    icon: 'FileBox',
    layers: ['artifacts', 'workflows'],
    emphasisNodeTypes: ['artifact', 'workflow', 'workflow-stage', 'department', 'capability'],
    emphasisEdgeTypes: ['produces_artifact', 'consumes_artifact'],
    availableAtScopes: ['company', 'department', 'workflow', 'workflow-stage'],
    requiresLayer: 'artifacts',
  },
  governance: {
    id: 'governance',
    label: 'Governance',
    description: 'Policies, rules, constraints, and approval gates',
    icon: 'Shield',
    layers: ['organization', 'governance'],
    emphasisNodeTypes: ['policy', 'department', 'company'],
    emphasisEdgeTypes: ['governs'],
    availableAtScopes: ['company', 'department'],
  },
  operations: {
    id: 'operations',
    label: 'Operations',
    description: 'Runtime state: active runs, incidents, compliance, and queue depths',
    icon: 'Activity',
    layers: ['workflows', 'contracts', 'operations'],
    emphasisNodeTypes: ['workflow', 'workflow-stage', 'contract', 'department'],
    emphasisEdgeTypes: ['participates_in', 'hands_off_to', 'bound_by'],
    availableAtScopes: ['company', 'department', 'workflow'],
    requiresLayer: 'operations',
  },
}

// --- Collaboration Types (CAV-021) ---

// Comments

export type CommentTargetType = 'node' | 'edge' | 'scope'

export interface CommentDto {
  id: string
  projectId: string
  targetType: CommentTargetType
  targetId: string | null
  scopeType: ScopeType
  authorId: string
  authorName: string
  content: string
  resolved: boolean
  parentId: string | null
  replyCount: number
  createdAt: string
  updatedAt: string
}

export interface CreateCommentDto {
  targetType: CommentTargetType
  targetId?: string | null
  scopeType: ScopeType
  authorId: string
  authorName: string
  content: string
  parentId?: string | null
}

export interface UpdateCommentDto {
  content?: string
  resolved?: boolean
}

// Review Markers

export type ReviewStatus = 'pending' | 'approved' | 'needs-changes'

export interface ReviewMarkerDto {
  id: string
  projectId: string
  entityId: string
  nodeType: NodeType
  status: ReviewStatus
  reviewerId: string
  reviewerName: string
  feedback: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateReviewMarkerDto {
  entityId: string
  nodeType: NodeType
  status: ReviewStatus
  reviewerId: string
  reviewerName: string
  feedback?: string | null
}

export interface UpdateReviewMarkerDto {
  status?: ReviewStatus
  feedback?: string | null
}

// Entity Locks

export interface EntityLockDto {
  id: string
  projectId: string
  entityId: string
  nodeType: NodeType
  lockedBy: string
  lockedByName: string
  lockedAt: string
  expiresAt: string
}

export interface AcquireLockDto {
  entityId: string
  nodeType: NodeType
  lockedBy: string
  lockedByName: string
  durationMs?: number
}

// Collaboration summary for canvas node enrichment
export interface CollaborationSummary {
  entityId: string
  commentCount: number
  unresolvedCommentCount: number
  reviewStatus: ReviewStatus | null
  isLocked: boolean
  lockedBy: string | null
}

// --- Operations Types (CAV-019) ---

export type OperationStatus = 'idle' | 'running' | 'blocked' | 'failed' | 'completed'

export type WorkflowRunStatus = 'running' | 'completed' | 'failed' | 'cancelled'

export interface WorkflowRunDto {
  id: string
  projectId: string
  workflowId: string
  status: WorkflowRunStatus
  currentStageIndex: number | null
  startedAt: string
  completedAt: string | null
  failureReason: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateWorkflowRunDto {
  workflowId: string
}

export interface UpdateWorkflowRunDto {
  status?: WorkflowRunStatus
  currentStageIndex?: number | null
  failureReason?: string | null
}

export type StageExecutionStatus = 'pending' | 'running' | 'blocked' | 'completed' | 'failed' | 'skipped'

export interface StageExecutionDto {
  id: string
  runId: string
  workflowId: string
  stageName: string
  stageIndex: number
  status: StageExecutionStatus
  assigneeId: string | null
  blockReason: string | null
  startedAt: string | null
  completedAt: string | null
}

export type IncidentSeverity = 'critical' | 'major' | 'minor'
export type IncidentStatus = 'open' | 'acknowledged' | 'resolved'

export interface IncidentDto {
  id: string
  projectId: string
  entityType: NodeType
  entityId: string
  severity: IncidentSeverity
  status: IncidentStatus
  title: string
  description: string
  reportedAt: string
  resolvedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateIncidentDto {
  entityType: NodeType
  entityId: string
  severity: IncidentSeverity
  title: string
  description: string
}

export interface UpdateIncidentDto {
  severity?: IncidentSeverity
  status?: IncidentStatus
  description?: string
}

export type ComplianceStatus = 'compliant' | 'at-risk' | 'violated'

export interface ContractComplianceDto {
  id: string
  projectId: string
  contractId: string
  status: ComplianceStatus
  reason: string | null
  lastCheckedAt: string
  createdAt: string
  updatedAt: string
}

export interface CreateContractComplianceDto {
  contractId: string
  status: ComplianceStatus
  reason?: string | null
}

export interface UpdateContractComplianceDto {
  status?: ComplianceStatus
  reason?: string | null
}

export interface QueueDepthDto {
  workflowId: string
  stageName: string
  stageIndex: number
  pendingCount: number
  runningCount: number
  blockedCount: number
}

export type OperationBadgeType =
  | 'active-run'
  | 'blocked-stage'
  | 'failed-run'
  | 'incident'
  | 'queue-depth'
  | 'compliance-ok'
  | 'compliance-risk'
  | 'compliance-violated'

export interface OperationBadge {
  type: OperationBadgeType
  label: string
  severity: 'info' | 'warning' | 'critical'
}

export interface EntityOperationStatusDto {
  entityId: string
  entityType: NodeType
  visualNodeId: string
  operationStatus: OperationStatus
  activeRunCount: number
  incidentCount: number
  queueDepth: number
  complianceStatus: ComplianceStatus | null
  badges: OperationBadge[]
}

export interface OperationsSummary {
  totalActiveRuns: number
  totalBlockedStages: number
  totalFailedRuns: number
  totalOpenIncidents: number
  totalComplianceViolations: number
}

export interface OperationsStatusDto {
  projectId: string
  scopeType: ScopeType
  entityId: string | null
  entities: EntityOperationStatusDto[]
  summary: OperationsSummary
  fetchedAt: string
}
