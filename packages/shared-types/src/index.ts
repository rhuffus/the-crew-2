export { VERTICALER_PROJECT_ID, VERTICALER_PROJECT_NAME, VERTICALER_PROJECT_DESCRIPTION } from './verticaler'

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
  | 'artifact'

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
  | 'produces_artifact'
  | 'consumes_artifact'

export type EdgeCategory =
  | 'hierarchical'
  | 'ownership'
  | 'assignment'
  | 'capability'
  | 'contract'
  | 'workflow'
  | 'governance'
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

// --- Generic Scope Model (CAV-011) ---

export type ScopeType =
  | 'company'
  | 'department'
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
    drillableChildScopes: ['department', 'workflow'],
    parentScopeTypes: [],
    label: 'Organization',
  },
  department: {
    scopeType: 'department',
    rootNodeType: 'department',
    zoomLevel: 'L2',
    requiresEntityId: true,
    defaultLayers: ['organization', 'capabilities'],
    drillableChildScopes: ['department', 'workflow'],
    parentScopeTypes: ['company', 'department'],
    label: 'Department',
  },
  workflow: {
    scopeType: 'workflow',
    rootNodeType: 'workflow',
    zoomLevel: 'L3',
    requiresEntityId: true,
    defaultLayers: ['workflows'],
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
    drillableChildScopes: [],
    parentScopeTypes: ['workflow'],
    label: 'Stage',
  },
}

export function getScopeDefinition(scopeType: ScopeType): ScopeDefinition {
  return SCOPE_REGISTRY[scopeType]
}

export function isDrillableScopeType(nodeType: NodeType): boolean {
  return Object.values(SCOPE_REGISTRY).some(def => def.rootNodeType === nodeType)
}

export function getZoomLevelForScope(scopeType: ScopeType): ZoomLevel {
  return SCOPE_REGISTRY[scopeType].zoomLevel
}

export function scopeTypeFromZoomLevel(level: ZoomLevel): ScopeType {
  switch (level) {
    case 'L1': return 'company'
    case 'L2': return 'department'
    case 'L3': return 'workflow'
    case 'L4': return 'workflow-stage'
  }
}
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
  organization: {
    id: 'organization',
    label: 'Organization',
    description: 'Company structure: departments, roles, agents',
    icon: 'Building2',
    layers: ['organization'],
    emphasisNodeTypes: ['company', 'department', 'role', 'agent-archetype', 'agent-assignment'],
    emphasisEdgeTypes: ['reports_to', 'assigned_to'],
    availableAtScopes: ['company', 'department'],
  },
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
