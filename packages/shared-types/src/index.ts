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

export interface CompanyModelDto {
  projectId: string
  purpose: string
  type: string
  scope: string
  principles: string[]
  updatedAt: string
}

export interface UpdateCompanyModelDto {
  purpose?: string
  type?: string
  scope?: string
  principles?: string[]
}

// Departments

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

export type NodeType =
  | 'company'
  | 'department'
  | 'role'
  | 'agent-archetype'
  | 'agent-assignment'
  | 'capability'
  | 'skill'
  | 'workflow'
  | 'workflow-stage'
  | 'contract'
  | 'policy'

export type EdgeType =
  | 'reports_to'
  | 'owns'
  | 'assigned_to'
  | 'contributes_to'
  | 'has_skill'
  | 'compatible_with'
  | 'provides'
  | 'consumes'
  | 'bound_by'
  | 'participates_in'
  | 'hands_off_to'
  | 'governs'

export type EdgeCategory =
  | 'hierarchical'
  | 'ownership'
  | 'assignment'
  | 'capability'
  | 'contract'
  | 'workflow'
  | 'governance'

export type LayerId =
  | 'organization'
  | 'capabilities'
  | 'workflows'
  | 'contracts'
  | 'governance'

export type ZoomLevel = 'L1' | 'L2' | 'L3' | 'L4'
export type NodeStatus = 'normal' | 'warning' | 'error' | 'dimmed'
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
  L4: [],
}
