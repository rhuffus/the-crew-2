import { Injectable } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'
import type {
  CompanyModelDto,
  UpdateCompanyModelDto,
  DepartmentDto,
  CreateDepartmentDto,
  UpdateDepartmentDto,
  CapabilityDto,
  CreateCapabilityDto,
  UpdateCapabilityDto,
  ContractDto,
  CreateContractDto,
  UpdateContractDto,
  WorkflowDto,
  CreateWorkflowDto,
  UpdateWorkflowDto,
  PolicyDto,
  CreatePolicyDto,
  UpdatePolicyDto,
  RoleDto,
  CreateRoleDto,
  UpdateRoleDto,
  AgentArchetypeDto,
  CreateAgentArchetypeDto,
  UpdateAgentArchetypeDto,
  AgentAssignmentDto,
  CreateAgentAssignmentDto,
  UpdateAgentAssignmentDto,
  SkillDto,
  CreateSkillDto,
  UpdateSkillDto,
  ReleaseDto,
  CreateReleaseDto,
  UpdateReleaseDto,
  ReleaseDiffDto,
  ValidationResultDto,
  AuditEntryDto,
  VisualGraphDto,
  VisualGraphDiffDto,
  SavedViewDto,
  CreateSavedViewDto,
  UpdateSavedViewDto,
  ChatThreadDto,
  ChatMessageDto,
  CreateChatMessageDto,
  ArtifactDto,
  CreateArtifactDto,
  UpdateArtifactDto,
  CommentDto,
  CreateCommentDto,
  UpdateCommentDto,
  ReviewMarkerDto,
  CreateReviewMarkerDto,
  UpdateReviewMarkerDto,
  EntityLockDto,
  AcquireLockDto,
  OperationsStatusDto,
  WorkflowRunDto,
  CreateWorkflowRunDto,
  UpdateWorkflowRunDto,
  StageExecutionDto,
  IncidentDto,
  CreateIncidentDto,
  UpdateIncidentDto,
  ContractComplianceDto,
  CreateContractComplianceDto,
  UpdateContractComplianceDto,
  StageExecutionStatus,
  RuntimeStatusResponse,
  NodeRuntimeStatusDto,
  RuntimeExecutionDto,
  CreateRuntimeExecutionDto,
  UpdateRuntimeExecutionDto,
  RuntimeEventDto,
  CreateRuntimeEventDto,
  CostSummaryDto,
  OrganizationalUnitDto,
  CreateOrganizationalUnitDto,
  UpdateOrganizationalUnitDto,
  LcpAgentDto,
  CreateLcpAgentDto,
  UpdateLcpAgentDto,
  ProposalDto,
  CreateProposalDto,
  GrowthEvaluationResultDto,
  OrgHealthReportDto,
  PhaseCapabilitiesDto,
  ProposalType,
  ProposalStatus,
  GrowthPace,
  ApprovalLevel,
  BootstrapConversationDto,
  SendBootstrapMessageResponseDto,
  ProjectDocumentDto,
  CreateProjectDocumentDto,
  UpdateProjectDocumentDto,
  ProposeGrowthResponseDto,
  ApproveGrowthProposalResponseDto,
  RejectGrowthProposalResponseDto,
} from '@the-crew/shared-types'

@Injectable()
export class CompanyDesignClient {
  private readonly baseUrl: string

  constructor(private readonly http: HttpService) {
    this.baseUrl = process.env['COMPANY_DESIGN_SERVICE_URL'] ?? 'http://localhost:4020'
  }

  async getCompanyModel(projectId: string): Promise<CompanyModelDto> {
    const { data } = await firstValueFrom(
      this.http.get<CompanyModelDto>(`${this.baseUrl}/projects/${projectId}/company-model`),
    )
    return data
  }

  async updateCompanyModel(
    projectId: string,
    dto: UpdateCompanyModelDto,
  ): Promise<CompanyModelDto> {
    const { data } = await firstValueFrom(
      this.http.put<CompanyModelDto>(
        `${this.baseUrl}/projects/${projectId}/company-model`,
        dto,
      ),
    )
    return data
  }

  // Departments

  async listDepartments(projectId: string): Promise<DepartmentDto[]> {
    const { data } = await firstValueFrom(
      this.http.get<DepartmentDto[]>(`${this.baseUrl}/projects/${projectId}/departments`),
    )
    return data
  }

  async getDepartment(id: string, projectId: string): Promise<DepartmentDto> {
    const { data } = await firstValueFrom(
      this.http.get<DepartmentDto>(`${this.baseUrl}/projects/${projectId}/departments/${id}`),
    )
    return data
  }

  async createDepartment(projectId: string, dto: CreateDepartmentDto): Promise<DepartmentDto> {
    const { data } = await firstValueFrom(
      this.http.post<DepartmentDto>(`${this.baseUrl}/projects/${projectId}/departments`, dto),
    )
    return data
  }

  async updateDepartment(id: string, projectId: string, dto: UpdateDepartmentDto): Promise<DepartmentDto> {
    const { data } = await firstValueFrom(
      this.http.patch<DepartmentDto>(`${this.baseUrl}/projects/${projectId}/departments/${id}`, dto),
    )
    return data
  }

  async deleteDepartment(id: string, projectId: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${this.baseUrl}/projects/${projectId}/departments/${id}`),
    )
  }

  // Capabilities

  async listCapabilities(projectId: string): Promise<CapabilityDto[]> {
    const { data } = await firstValueFrom(
      this.http.get<CapabilityDto[]>(`${this.baseUrl}/projects/${projectId}/capabilities`),
    )
    return data
  }

  async getCapability(id: string, projectId: string): Promise<CapabilityDto> {
    const { data } = await firstValueFrom(
      this.http.get<CapabilityDto>(`${this.baseUrl}/projects/${projectId}/capabilities/${id}`),
    )
    return data
  }

  async createCapability(projectId: string, dto: CreateCapabilityDto): Promise<CapabilityDto> {
    const { data } = await firstValueFrom(
      this.http.post<CapabilityDto>(`${this.baseUrl}/projects/${projectId}/capabilities`, dto),
    )
    return data
  }

  async updateCapability(id: string, projectId: string, dto: UpdateCapabilityDto): Promise<CapabilityDto> {
    const { data } = await firstValueFrom(
      this.http.patch<CapabilityDto>(`${this.baseUrl}/projects/${projectId}/capabilities/${id}`, dto),
    )
    return data
  }

  async deleteCapability(id: string, projectId: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${this.baseUrl}/projects/${projectId}/capabilities/${id}`),
    )
  }

  // Contracts

  async listContracts(projectId: string): Promise<ContractDto[]> {
    const { data } = await firstValueFrom(
      this.http.get<ContractDto[]>(`${this.baseUrl}/projects/${projectId}/contracts`),
    )
    return data
  }

  async getContract(id: string, projectId: string): Promise<ContractDto> {
    const { data } = await firstValueFrom(
      this.http.get<ContractDto>(`${this.baseUrl}/projects/${projectId}/contracts/${id}`),
    )
    return data
  }

  async createContract(projectId: string, dto: CreateContractDto): Promise<ContractDto> {
    const { data } = await firstValueFrom(
      this.http.post<ContractDto>(`${this.baseUrl}/projects/${projectId}/contracts`, dto),
    )
    return data
  }

  async updateContract(id: string, projectId: string, dto: UpdateContractDto): Promise<ContractDto> {
    const { data } = await firstValueFrom(
      this.http.patch<ContractDto>(`${this.baseUrl}/projects/${projectId}/contracts/${id}`, dto),
    )
    return data
  }

  async deleteContract(id: string, projectId: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${this.baseUrl}/projects/${projectId}/contracts/${id}`),
    )
  }

  // Workflows

  async listWorkflows(projectId: string): Promise<WorkflowDto[]> {
    const { data } = await firstValueFrom(
      this.http.get<WorkflowDto[]>(`${this.baseUrl}/projects/${projectId}/workflows`),
    )
    return data
  }

  async getWorkflow(id: string, projectId: string): Promise<WorkflowDto> {
    const { data } = await firstValueFrom(
      this.http.get<WorkflowDto>(`${this.baseUrl}/projects/${projectId}/workflows/${id}`),
    )
    return data
  }

  async createWorkflow(projectId: string, dto: CreateWorkflowDto): Promise<WorkflowDto> {
    const { data } = await firstValueFrom(
      this.http.post<WorkflowDto>(`${this.baseUrl}/projects/${projectId}/workflows`, dto),
    )
    return data
  }

  async updateWorkflow(id: string, projectId: string, dto: UpdateWorkflowDto): Promise<WorkflowDto> {
    const { data } = await firstValueFrom(
      this.http.patch<WorkflowDto>(`${this.baseUrl}/projects/${projectId}/workflows/${id}`, dto),
    )
    return data
  }

  async deleteWorkflow(id: string, projectId: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${this.baseUrl}/projects/${projectId}/workflows/${id}`),
    )
  }

  // Policies

  async listPolicies(projectId: string): Promise<PolicyDto[]> {
    const { data } = await firstValueFrom(
      this.http.get<PolicyDto[]>(`${this.baseUrl}/projects/${projectId}/policies`),
    )
    return data
  }

  async getPolicy(id: string, projectId: string): Promise<PolicyDto> {
    const { data } = await firstValueFrom(
      this.http.get<PolicyDto>(`${this.baseUrl}/projects/${projectId}/policies/${id}`),
    )
    return data
  }

  async createPolicy(projectId: string, dto: CreatePolicyDto): Promise<PolicyDto> {
    const { data } = await firstValueFrom(
      this.http.post<PolicyDto>(`${this.baseUrl}/projects/${projectId}/policies`, dto),
    )
    return data
  }

  async updatePolicy(id: string, projectId: string, dto: UpdatePolicyDto): Promise<PolicyDto> {
    const { data } = await firstValueFrom(
      this.http.patch<PolicyDto>(`${this.baseUrl}/projects/${projectId}/policies/${id}`, dto),
    )
    return data
  }

  async deletePolicy(id: string, projectId: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${this.baseUrl}/projects/${projectId}/policies/${id}`),
    )
  }

  // Roles

  async listRoles(projectId: string): Promise<RoleDto[]> {
    const { data } = await firstValueFrom(
      this.http.get<RoleDto[]>(`${this.baseUrl}/projects/${projectId}/roles`),
    )
    return data
  }

  async getRole(id: string, projectId: string): Promise<RoleDto> {
    const { data } = await firstValueFrom(
      this.http.get<RoleDto>(`${this.baseUrl}/projects/${projectId}/roles/${id}`),
    )
    return data
  }

  async createRole(projectId: string, dto: CreateRoleDto): Promise<RoleDto> {
    const { data } = await firstValueFrom(
      this.http.post<RoleDto>(`${this.baseUrl}/projects/${projectId}/roles`, dto),
    )
    return data
  }

  async updateRole(id: string, projectId: string, dto: UpdateRoleDto): Promise<RoleDto> {
    const { data } = await firstValueFrom(
      this.http.patch<RoleDto>(`${this.baseUrl}/projects/${projectId}/roles/${id}`, dto),
    )
    return data
  }

  async deleteRole(id: string, projectId: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${this.baseUrl}/projects/${projectId}/roles/${id}`),
    )
  }

  // Agent Archetypes

  async listAgentArchetypes(projectId: string): Promise<AgentArchetypeDto[]> {
    const { data } = await firstValueFrom(
      this.http.get<AgentArchetypeDto[]>(`${this.baseUrl}/projects/${projectId}/agent-archetypes`),
    )
    return data
  }

  async getAgentArchetype(id: string, projectId: string): Promise<AgentArchetypeDto> {
    const { data } = await firstValueFrom(
      this.http.get<AgentArchetypeDto>(`${this.baseUrl}/projects/${projectId}/agent-archetypes/${id}`),
    )
    return data
  }

  async createAgentArchetype(projectId: string, dto: CreateAgentArchetypeDto): Promise<AgentArchetypeDto> {
    const { data } = await firstValueFrom(
      this.http.post<AgentArchetypeDto>(`${this.baseUrl}/projects/${projectId}/agent-archetypes`, dto),
    )
    return data
  }

  async updateAgentArchetype(id: string, projectId: string, dto: UpdateAgentArchetypeDto): Promise<AgentArchetypeDto> {
    const { data } = await firstValueFrom(
      this.http.patch<AgentArchetypeDto>(`${this.baseUrl}/projects/${projectId}/agent-archetypes/${id}`, dto),
    )
    return data
  }

  async deleteAgentArchetype(id: string, projectId: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${this.baseUrl}/projects/${projectId}/agent-archetypes/${id}`),
    )
  }

  // Agent Assignments

  async listAgentAssignments(projectId: string): Promise<AgentAssignmentDto[]> {
    const { data } = await firstValueFrom(
      this.http.get<AgentAssignmentDto[]>(`${this.baseUrl}/projects/${projectId}/agent-assignments`),
    )
    return data
  }

  async getAgentAssignment(id: string, projectId: string): Promise<AgentAssignmentDto> {
    const { data } = await firstValueFrom(
      this.http.get<AgentAssignmentDto>(`${this.baseUrl}/projects/${projectId}/agent-assignments/${id}`),
    )
    return data
  }

  async createAgentAssignment(projectId: string, dto: CreateAgentAssignmentDto): Promise<AgentAssignmentDto> {
    const { data } = await firstValueFrom(
      this.http.post<AgentAssignmentDto>(`${this.baseUrl}/projects/${projectId}/agent-assignments`, dto),
    )
    return data
  }

  async updateAgentAssignment(id: string, projectId: string, dto: UpdateAgentAssignmentDto): Promise<AgentAssignmentDto> {
    const { data } = await firstValueFrom(
      this.http.patch<AgentAssignmentDto>(`${this.baseUrl}/projects/${projectId}/agent-assignments/${id}`, dto),
    )
    return data
  }

  async deleteAgentAssignment(id: string, projectId: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${this.baseUrl}/projects/${projectId}/agent-assignments/${id}`),
    )
  }

  // Skills

  async listSkills(projectId: string): Promise<SkillDto[]> {
    const { data } = await firstValueFrom(
      this.http.get<SkillDto[]>(`${this.baseUrl}/projects/${projectId}/skills`),
    )
    return data
  }

  async getSkill(id: string, projectId: string): Promise<SkillDto> {
    const { data } = await firstValueFrom(
      this.http.get<SkillDto>(`${this.baseUrl}/projects/${projectId}/skills/${id}`),
    )
    return data
  }

  async createSkill(projectId: string, dto: CreateSkillDto): Promise<SkillDto> {
    const { data } = await firstValueFrom(
      this.http.post<SkillDto>(`${this.baseUrl}/projects/${projectId}/skills`, dto),
    )
    return data
  }

  async updateSkill(id: string, projectId: string, dto: UpdateSkillDto): Promise<SkillDto> {
    const { data } = await firstValueFrom(
      this.http.patch<SkillDto>(`${this.baseUrl}/projects/${projectId}/skills/${id}`, dto),
    )
    return data
  }

  async deleteSkill(id: string, projectId: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${this.baseUrl}/projects/${projectId}/skills/${id}`),
    )
  }

  // Releases

  async listReleases(projectId: string): Promise<ReleaseDto[]> {
    const { data } = await firstValueFrom(
      this.http.get<ReleaseDto[]>(`${this.baseUrl}/projects/${projectId}/releases`),
    )
    return data
  }

  async getRelease(id: string, projectId: string): Promise<ReleaseDto> {
    const { data } = await firstValueFrom(
      this.http.get<ReleaseDto>(`${this.baseUrl}/projects/${projectId}/releases/${id}`),
    )
    return data
  }

  async createRelease(projectId: string, dto: CreateReleaseDto): Promise<ReleaseDto> {
    const { data } = await firstValueFrom(
      this.http.post<ReleaseDto>(`${this.baseUrl}/projects/${projectId}/releases`, dto),
    )
    return data
  }

  async updateRelease(id: string, projectId: string, dto: UpdateReleaseDto): Promise<ReleaseDto> {
    const { data } = await firstValueFrom(
      this.http.patch<ReleaseDto>(`${this.baseUrl}/projects/${projectId}/releases/${id}`, dto),
    )
    return data
  }

  async publishRelease(id: string, projectId: string): Promise<ReleaseDto> {
    const { data } = await firstValueFrom(
      this.http.post<ReleaseDto>(`${this.baseUrl}/projects/${projectId}/releases/${id}/publish`, {}),
    )
    return data
  }

  async deleteRelease(id: string, projectId: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${this.baseUrl}/projects/${projectId}/releases/${id}`),
    )
  }

  async diffReleases(baseId: string, compareId: string, projectId: string): Promise<ReleaseDiffDto> {
    const { data } = await firstValueFrom(
      this.http.get<ReleaseDiffDto>(`${this.baseUrl}/projects/${projectId}/releases/${baseId}/diff/${compareId}`),
    )
    return data
  }

  // Validations

  async getValidations(projectId: string): Promise<ValidationResultDto> {
    const { data } = await firstValueFrom(
      this.http.get<ValidationResultDto>(`${this.baseUrl}/projects/${projectId}/validations`),
    )
    return data
  }

  // Audit

  // Visual Graph

  async getVisualGraph(
    projectId: string,
    scope?: string,
    level?: string,
    entityId?: string,
    layers?: string,
  ): Promise<VisualGraphDto> {
    const params = new URLSearchParams()
    if (scope) params.append('scope', scope)
    if (level) params.append('level', level)
    if (entityId) params.append('entityId', entityId)
    if (layers) params.append('layers', layers)
    const query = params.toString()
    const url = `${this.baseUrl}/projects/${projectId}/visual-graph${query ? `?${query}` : ''}`
    const { data } = await firstValueFrom(
      this.http.get<VisualGraphDto>(url),
    )
    return data
  }

  async getVisualGraphDiff(
    projectId: string,
    baseReleaseId: string,
    compareReleaseId: string,
    scope?: string,
    level?: string,
    entityId?: string,
    layers?: string,
  ): Promise<VisualGraphDiffDto> {
    const params = new URLSearchParams()
    params.append('base', baseReleaseId)
    params.append('compare', compareReleaseId)
    if (scope) params.append('scope', scope)
    if (level) params.append('level', level)
    if (entityId) params.append('entityId', entityId)
    if (layers) params.append('layers', layers)
    const url = `${this.baseUrl}/projects/${projectId}/visual-graph/diff?${params.toString()}`
    const { data } = await firstValueFrom(
      this.http.get<VisualGraphDiffDto>(url),
    )
    return data
  }

  // Audit

  // Saved Views

  async listSavedViews(projectId: string): Promise<SavedViewDto[]> {
    const { data } = await firstValueFrom(
      this.http.get<SavedViewDto[]>(`${this.baseUrl}/projects/${projectId}/saved-views`),
    )
    return data
  }

  async createSavedView(projectId: string, dto: CreateSavedViewDto): Promise<SavedViewDto> {
    const { data } = await firstValueFrom(
      this.http.post<SavedViewDto>(`${this.baseUrl}/projects/${projectId}/saved-views`, dto),
    )
    return data
  }

  async updateSavedView(id: string, projectId: string, dto: UpdateSavedViewDto): Promise<SavedViewDto> {
    const { data } = await firstValueFrom(
      this.http.patch<SavedViewDto>(`${this.baseUrl}/projects/${projectId}/saved-views/${id}`, dto),
    )
    return data
  }

  async deleteSavedView(id: string, projectId: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${this.baseUrl}/projects/${projectId}/saved-views/${id}`),
    )
  }

  // Chat

  async listChatThreads(projectId: string): Promise<ChatThreadDto[]> {
    const { data } = await firstValueFrom(
      this.http.get<ChatThreadDto[]>(`${this.baseUrl}/projects/${projectId}/chat/threads`),
    )
    return data
  }

  async getChatThread(projectId: string, scopeType: string, entityId?: string): Promise<ChatThreadDto> {
    const params = new URLSearchParams()
    params.append('scopeType', scopeType)
    if (entityId) params.append('entityId', entityId)
    const { data } = await firstValueFrom(
      this.http.get<ChatThreadDto>(`${this.baseUrl}/projects/${projectId}/chat/threads/by-scope?${params.toString()}`),
    )
    return data
  }

  async listChatMessages(threadId: string, projectId: string, limit?: number, before?: string): Promise<ChatMessageDto[]> {
    const params = new URLSearchParams()
    if (limit) params.append('limit', String(limit))
    if (before) params.append('before', before)
    const query = params.toString()
    const url = `${this.baseUrl}/projects/${projectId}/chat/threads/${threadId}/messages${query ? `?${query}` : ''}`
    const { data } = await firstValueFrom(
      this.http.get<ChatMessageDto[]>(url),
    )
    return data
  }

  async sendChatMessage(threadId: string, projectId: string, dto: CreateChatMessageDto): Promise<ChatMessageDto> {
    const { data } = await firstValueFrom(
      this.http.post<ChatMessageDto>(`${this.baseUrl}/projects/${projectId}/chat/threads/${threadId}/messages`, dto),
    )
    return data
  }

  async deleteChatThread(threadId: string, projectId: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${this.baseUrl}/projects/${projectId}/chat/threads/${threadId}`),
    )
  }

  // Artifacts

  async listArtifacts(projectId: string): Promise<ArtifactDto[]> {
    const { data } = await firstValueFrom(
      this.http.get<ArtifactDto[]>(`${this.baseUrl}/projects/${projectId}/artifacts`),
    )
    return data
  }

  async getArtifact(id: string, projectId: string): Promise<ArtifactDto> {
    const { data } = await firstValueFrom(
      this.http.get<ArtifactDto>(`${this.baseUrl}/projects/${projectId}/artifacts/${id}`),
    )
    return data
  }

  async createArtifact(projectId: string, dto: CreateArtifactDto): Promise<ArtifactDto> {
    const { data } = await firstValueFrom(
      this.http.post<ArtifactDto>(`${this.baseUrl}/projects/${projectId}/artifacts`, dto),
    )
    return data
  }

  async updateArtifact(id: string, projectId: string, dto: UpdateArtifactDto): Promise<ArtifactDto> {
    const { data } = await firstValueFrom(
      this.http.patch<ArtifactDto>(`${this.baseUrl}/projects/${projectId}/artifacts/${id}`, dto),
    )
    return data
  }

  async deleteArtifact(id: string, projectId: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${this.baseUrl}/projects/${projectId}/artifacts/${id}`),
    )
  }

  async listAudits(projectId: string, entityType?: string, entityId?: string): Promise<AuditEntryDto[]> {
    const params = new URLSearchParams()
    if (entityType) params.append('entityType', entityType)
    if (entityId) params.append('entityId', entityId)
    const query = params.toString()
    const url = `${this.baseUrl}/projects/${projectId}/audit${query ? `?${query}` : ''}`
    const { data } = await firstValueFrom(
      this.http.get<AuditEntryDto[]>(url),
    )
    return data
  }

  // Comments

  async listComments(projectId: string, targetType?: string, targetId?: string): Promise<CommentDto[]> {
    const params = new URLSearchParams()
    if (targetType) params.append('targetType', targetType)
    if (targetId) params.append('targetId', targetId)
    const query = params.toString()
    const url = `${this.baseUrl}/projects/${projectId}/comments${query ? `?${query}` : ''}`
    const { data } = await firstValueFrom(
      this.http.get<CommentDto[]>(url),
    )
    return data
  }

  async getComment(id: string, projectId: string): Promise<CommentDto> {
    const { data } = await firstValueFrom(
      this.http.get<CommentDto>(`${this.baseUrl}/projects/${projectId}/comments/${id}`),
    )
    return data
  }

  async createComment(projectId: string, dto: CreateCommentDto): Promise<CommentDto> {
    const { data } = await firstValueFrom(
      this.http.post<CommentDto>(`${this.baseUrl}/projects/${projectId}/comments`, dto),
    )
    return data
  }

  async updateComment(id: string, projectId: string, dto: UpdateCommentDto): Promise<CommentDto> {
    const { data } = await firstValueFrom(
      this.http.patch<CommentDto>(`${this.baseUrl}/projects/${projectId}/comments/${id}`, dto),
    )
    return data
  }

  async resolveComment(id: string, projectId: string): Promise<CommentDto> {
    const { data } = await firstValueFrom(
      this.http.patch<CommentDto>(`${this.baseUrl}/projects/${projectId}/comments/${id}/resolve`, {}),
    )
    return data
  }

  async deleteComment(id: string, projectId: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${this.baseUrl}/projects/${projectId}/comments/${id}`),
    )
  }

  // Reviews

  async listReviews(projectId: string): Promise<ReviewMarkerDto[]> {
    const { data } = await firstValueFrom(
      this.http.get<ReviewMarkerDto[]>(`${this.baseUrl}/projects/${projectId}/collaboration/reviews`),
    )
    return data
  }

  async getReviewByEntity(projectId: string, entityId: string): Promise<ReviewMarkerDto[]> {
    const params = new URLSearchParams()
    params.append('entityId', entityId)
    const { data } = await firstValueFrom(
      this.http.get<ReviewMarkerDto[]>(`${this.baseUrl}/projects/${projectId}/collaboration/reviews/by-entity?${params.toString()}`),
    )
    return data
  }

  async createReview(projectId: string, dto: CreateReviewMarkerDto): Promise<ReviewMarkerDto> {
    const { data } = await firstValueFrom(
      this.http.post<ReviewMarkerDto>(`${this.baseUrl}/projects/${projectId}/collaboration/reviews`, dto),
    )
    return data
  }

  async updateReview(id: string, projectId: string, dto: UpdateReviewMarkerDto): Promise<ReviewMarkerDto> {
    const { data } = await firstValueFrom(
      this.http.patch<ReviewMarkerDto>(`${this.baseUrl}/projects/${projectId}/collaboration/reviews/${id}`, dto),
    )
    return data
  }

  async deleteReview(id: string, projectId: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${this.baseUrl}/projects/${projectId}/collaboration/reviews/${id}`),
    )
  }

  // Locks

  async listLocks(projectId: string): Promise<EntityLockDto[]> {
    const { data } = await firstValueFrom(
      this.http.get<EntityLockDto[]>(`${this.baseUrl}/projects/${projectId}/collaboration/locks`),
    )
    return data
  }

  async getLock(projectId: string, entityId: string): Promise<EntityLockDto> {
    const params = new URLSearchParams()
    params.append('entityId', entityId)
    const { data } = await firstValueFrom(
      this.http.get<EntityLockDto>(`${this.baseUrl}/projects/${projectId}/collaboration/locks/by-entity?${params.toString()}`),
    )
    return data
  }

  async acquireLock(projectId: string, dto: AcquireLockDto): Promise<EntityLockDto> {
    const { data } = await firstValueFrom(
      this.http.post<EntityLockDto>(`${this.baseUrl}/projects/${projectId}/collaboration/locks`, dto),
    )
    return data
  }

  async releaseLock(projectId: string, entityId: string): Promise<void> {
    const params = new URLSearchParams()
    params.append('entityId', entityId)
    await firstValueFrom(
      this.http.delete(`${this.baseUrl}/projects/${projectId}/collaboration/locks/by-entity?${params.toString()}`),
    )
  }

  // ── Operations ──────────────────────────────────────────────────────

  async getOperationsStatus(projectId: string, scopeType: string, entityId?: string): Promise<OperationsStatusDto> {
    const params = new URLSearchParams({ scopeType })
    if (entityId) params.append('entityId', entityId)
    const { data } = await firstValueFrom(
      this.http.get<OperationsStatusDto>(`${this.baseUrl}/projects/${projectId}/operations/status?${params.toString()}`),
    )
    return data
  }

  async listWorkflowRuns(projectId: string, workflowId?: string): Promise<WorkflowRunDto[]> {
    const params = workflowId ? `?workflowId=${workflowId}` : ''
    const { data } = await firstValueFrom(
      this.http.get<WorkflowRunDto[]>(`${this.baseUrl}/projects/${projectId}/operations/runs${params}`),
    )
    return data
  }

  async createWorkflowRun(projectId: string, dto: CreateWorkflowRunDto): Promise<WorkflowRunDto> {
    const { data } = await firstValueFrom(
      this.http.post<WorkflowRunDto>(`${this.baseUrl}/projects/${projectId}/operations/runs`, dto),
    )
    return data
  }

  async updateWorkflowRun(projectId: string, runId: string, dto: UpdateWorkflowRunDto): Promise<WorkflowRunDto> {
    const { data } = await firstValueFrom(
      this.http.patch<WorkflowRunDto>(`${this.baseUrl}/projects/${projectId}/operations/runs/${runId}`, dto),
    )
    return data
  }

  async advanceStage(projectId: string, runId: string, stageIndex: number, status: StageExecutionStatus, blockReason?: string | null): Promise<StageExecutionDto> {
    const { data } = await firstValueFrom(
      this.http.post<StageExecutionDto>(
        `${this.baseUrl}/projects/${projectId}/operations/runs/${runId}/stages/${stageIndex}/advance`,
        { status, blockReason },
      ),
    )
    return data
  }

  async listIncidents(projectId: string, entityType?: string, entityId?: string): Promise<IncidentDto[]> {
    const params = new URLSearchParams()
    if (entityType) params.append('entityType', entityType)
    if (entityId) params.append('entityId', entityId)
    const qs = params.toString() ? `?${params.toString()}` : ''
    const { data } = await firstValueFrom(
      this.http.get<IncidentDto[]>(`${this.baseUrl}/projects/${projectId}/operations/incidents${qs}`),
    )
    return data
  }

  async createIncident(projectId: string, dto: CreateIncidentDto): Promise<IncidentDto> {
    const { data } = await firstValueFrom(
      this.http.post<IncidentDto>(`${this.baseUrl}/projects/${projectId}/operations/incidents`, dto),
    )
    return data
  }

  async updateIncident(projectId: string, incidentId: string, dto: UpdateIncidentDto): Promise<IncidentDto> {
    const { data } = await firstValueFrom(
      this.http.patch<IncidentDto>(`${this.baseUrl}/projects/${projectId}/operations/incidents/${incidentId}`, dto),
    )
    return data
  }

  async resolveIncident(projectId: string, incidentId: string): Promise<IncidentDto> {
    const { data } = await firstValueFrom(
      this.http.post<IncidentDto>(`${this.baseUrl}/projects/${projectId}/operations/incidents/${incidentId}/resolve`, {}),
    )
    return data
  }

  async listCompliances(projectId: string): Promise<ContractComplianceDto[]> {
    const { data } = await firstValueFrom(
      this.http.get<ContractComplianceDto[]>(`${this.baseUrl}/projects/${projectId}/operations/compliance`),
    )
    return data
  }

  async setCompliance(projectId: string, dto: CreateContractComplianceDto): Promise<ContractComplianceDto> {
    const { data } = await firstValueFrom(
      this.http.post<ContractComplianceDto>(`${this.baseUrl}/projects/${projectId}/operations/compliance`, dto),
    )
    return data
  }

  async updateCompliance(projectId: string, complianceId: string, dto: UpdateContractComplianceDto): Promise<ContractComplianceDto> {
    const { data } = await firstValueFrom(
      this.http.patch<ContractComplianceDto>(`${this.baseUrl}/projects/${projectId}/operations/compliance/${complianceId}`, dto),
    )
    return data
  }

  // ── Runtime (LCP-015) ─────────────────────────────────────────────

  async getRuntimeStatus(projectId: string): Promise<RuntimeStatusResponse> {
    const { data } = await firstValueFrom(
      this.http.get<RuntimeStatusResponse>(`${this.baseUrl}/projects/${projectId}/runtime/status`),
    )
    return data
  }

  async getRuntimeNodeStatus(projectId: string, entityId: string, entityType?: string): Promise<NodeRuntimeStatusDto> {
    const params = entityType ? `?entityType=${entityType}` : ''
    const { data } = await firstValueFrom(
      this.http.get<NodeRuntimeStatusDto>(`${this.baseUrl}/projects/${projectId}/runtime/status/${entityId}${params}`),
    )
    return data
  }

  async listRuntimeExecutions(projectId: string): Promise<RuntimeExecutionDto[]> {
    const { data } = await firstValueFrom(
      this.http.get<RuntimeExecutionDto[]>(`${this.baseUrl}/projects/${projectId}/runtime/executions`),
    )
    return data
  }

  async getRuntimeExecution(projectId: string, executionId: string): Promise<RuntimeExecutionDto> {
    const { data } = await firstValueFrom(
      this.http.get<RuntimeExecutionDto>(`${this.baseUrl}/projects/${projectId}/runtime/executions/${executionId}`),
    )
    return data
  }

  async createRuntimeExecution(projectId: string, dto: CreateRuntimeExecutionDto): Promise<RuntimeExecutionDto> {
    const { data } = await firstValueFrom(
      this.http.post<RuntimeExecutionDto>(`${this.baseUrl}/projects/${projectId}/runtime/executions`, dto),
    )
    return data
  }

  async updateRuntimeExecution(projectId: string, executionId: string, dto: UpdateRuntimeExecutionDto): Promise<RuntimeExecutionDto> {
    const { data } = await firstValueFrom(
      this.http.patch<RuntimeExecutionDto>(`${this.baseUrl}/projects/${projectId}/runtime/executions/${executionId}`, dto),
    )
    return data
  }

  async listRuntimeEvents(projectId: string, filters?: { limit?: string; offset?: string; executionId?: string; entityId?: string }): Promise<RuntimeEventDto[]> {
    const params = new URLSearchParams()
    if (filters?.limit) params.append('limit', filters.limit)
    if (filters?.offset) params.append('offset', filters.offset)
    if (filters?.executionId) params.append('executionId', filters.executionId)
    if (filters?.entityId) params.append('entityId', filters.entityId)
    const qs = params.toString() ? `?${params.toString()}` : ''
    const { data } = await firstValueFrom(
      this.http.get<RuntimeEventDto[]>(`${this.baseUrl}/projects/${projectId}/runtime/events${qs}`),
    )
    return data
  }

  async createRuntimeEvent(projectId: string, dto: CreateRuntimeEventDto): Promise<RuntimeEventDto> {
    const { data } = await firstValueFrom(
      this.http.post<RuntimeEventDto>(`${this.baseUrl}/projects/${projectId}/runtime/events`, dto),
    )
    return data
  }

  async getRuntimeCostSummary(projectId: string): Promise<CostSummaryDto> {
    const { data } = await firstValueFrom(
      this.http.get<CostSummaryDto>(`${this.baseUrl}/projects/${projectId}/runtime/cost-summary`),
    )
    return data
  }

  // ── Bootstrap (LCP-017) ────────────────────────────────────────────

  async bootstrapProject(projectId: string, body: {
    name: string; mission: string; companyType: string
    vision?: string; growthPace?: GrowthPace; approvalLevel?: ApprovalLevel
  }) {
    const { data } = await firstValueFrom(
      this.http.post(`${this.baseUrl}/projects/${projectId}/bootstrap`, body),
    )
    return data
  }

  async getBootstrapStatus(projectId: string) {
    const { data } = await firstValueFrom(
      this.http.get(`${this.baseUrl}/projects/${projectId}/bootstrap/status`),
    )
    return data
  }

  // ── Proposals (LCP-017) ────────────────────────────────────────────

  async submitProposal(projectId: string, body: CreateProposalDto & { id: string }): Promise<{ proposal: ProposalDto; evaluation: GrowthEvaluationResultDto }> {
    const { data } = await firstValueFrom(
      this.http.post<{ proposal: ProposalDto; evaluation: GrowthEvaluationResultDto }>(`${this.baseUrl}/projects/${projectId}/proposals`, body),
    )
    return data
  }

  async listProposals(projectId: string, filters?: { status?: ProposalStatus; proposalType?: ProposalType }): Promise<ProposalDto[]> {
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.proposalType) params.append('proposalType', filters.proposalType)
    const qs = params.toString() ? `?${params.toString()}` : ''
    const { data } = await firstValueFrom(
      this.http.get<ProposalDto[]>(`${this.baseUrl}/projects/${projectId}/proposals${qs}`),
    )
    return data
  }

  async getProposal(projectId: string, proposalId: string): Promise<ProposalDto> {
    const { data } = await firstValueFrom(
      this.http.get<ProposalDto>(`${this.baseUrl}/projects/${projectId}/proposals/${proposalId}`),
    )
    return data
  }

  async evaluateProposal(projectId: string, proposalId: string): Promise<GrowthEvaluationResultDto> {
    const { data } = await firstValueFrom(
      this.http.get<GrowthEvaluationResultDto>(`${this.baseUrl}/projects/${projectId}/proposals/${proposalId}/evaluate`),
    )
    return data
  }

  async approveProposal(projectId: string, proposalId: string, body: { approvedByUserId: string }): Promise<ProposalDto> {
    const { data } = await firstValueFrom(
      this.http.post<ProposalDto>(`${this.baseUrl}/projects/${projectId}/proposals/${proposalId}/approve`, body),
    )
    return data
  }

  async rejectProposal(projectId: string, proposalId: string, body: { reason: string }): Promise<ProposalDto> {
    const { data } = await firstValueFrom(
      this.http.post<ProposalDto>(`${this.baseUrl}/projects/${projectId}/proposals/${proposalId}/reject`, body),
    )
    return data
  }

  // ── Growth Engine (LCP-017) ────────────────────────────────────────

  async getGrowthHealth(projectId: string): Promise<OrgHealthReportDto> {
    const { data } = await firstValueFrom(
      this.http.get<OrgHealthReportDto>(`${this.baseUrl}/projects/${projectId}/health`),
    )
    return data
  }

  async getPhaseCapabilities(projectId: string): Promise<PhaseCapabilitiesDto> {
    const { data } = await firstValueFrom(
      this.http.get<PhaseCapabilitiesDto>(`${this.baseUrl}/projects/${projectId}/phase-capabilities`),
    )
    return data
  }

  // ── Organizational Units (LCP-018) ─────────────────────────────────

  async listOrganizationalUnits(projectId: string): Promise<OrganizationalUnitDto[]> {
    const { data } = await firstValueFrom(
      this.http.get<OrganizationalUnitDto[]>(`${this.baseUrl}/projects/${projectId}/organizational-units`),
    )
    return data
  }

  async getOrganizationalUnit(projectId: string, id: string): Promise<OrganizationalUnitDto> {
    const { data } = await firstValueFrom(
      this.http.get<OrganizationalUnitDto>(`${this.baseUrl}/projects/${projectId}/organizational-units/${id}`),
    )
    return data
  }

  async createOrganizationalUnit(projectId: string, dto: CreateOrganizationalUnitDto): Promise<OrganizationalUnitDto> {
    const { data } = await firstValueFrom(
      this.http.post<OrganizationalUnitDto>(`${this.baseUrl}/projects/${projectId}/organizational-units`, dto),
    )
    return data
  }

  async updateOrganizationalUnit(projectId: string, id: string, dto: UpdateOrganizationalUnitDto): Promise<OrganizationalUnitDto> {
    const { data } = await firstValueFrom(
      this.http.patch<OrganizationalUnitDto>(`${this.baseUrl}/projects/${projectId}/organizational-units/${id}`, dto),
    )
    return data
  }

  async deleteOrganizationalUnit(projectId: string, id: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${this.baseUrl}/projects/${projectId}/organizational-units/${id}`),
    )
  }

  // ── LCP Agents (LCP-018) ──────────────────────────────────────────

  async listLcpAgents(projectId: string): Promise<LcpAgentDto[]> {
    const { data } = await firstValueFrom(
      this.http.get<LcpAgentDto[]>(`${this.baseUrl}/projects/${projectId}/lcp-agents`),
    )
    return data
  }

  async getLcpAgent(projectId: string, id: string): Promise<LcpAgentDto> {
    const { data } = await firstValueFrom(
      this.http.get<LcpAgentDto>(`${this.baseUrl}/projects/${projectId}/lcp-agents/${id}`),
    )
    return data
  }

  async createLcpAgent(projectId: string, dto: CreateLcpAgentDto): Promise<LcpAgentDto> {
    const { data } = await firstValueFrom(
      this.http.post<LcpAgentDto>(`${this.baseUrl}/projects/${projectId}/lcp-agents`, dto),
    )
    return data
  }

  async updateLcpAgent(projectId: string, id: string, dto: UpdateLcpAgentDto): Promise<LcpAgentDto> {
    const { data } = await firstValueFrom(
      this.http.patch<LcpAgentDto>(`${this.baseUrl}/projects/${projectId}/lcp-agents/${id}`, dto),
    )
    return data
  }

  async deleteLcpAgent(projectId: string, id: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${this.baseUrl}/projects/${projectId}/lcp-agents/${id}`),
    )
  }

  // ── Project Documents (AIR-010) ──────────────────────────────────

  async listProjectDocuments(projectId: string): Promise<ProjectDocumentDto[]> {
    const { data } = await firstValueFrom(
      this.http.get<ProjectDocumentDto[]>(`${this.baseUrl}/projects/${projectId}/documents`),
    )
    return data
  }

  async getProjectDocument(projectId: string, id: string): Promise<ProjectDocumentDto> {
    const { data } = await firstValueFrom(
      this.http.get<ProjectDocumentDto>(`${this.baseUrl}/projects/${projectId}/documents/${id}`),
    )
    return data
  }

  async getProjectDocumentBySlug(projectId: string, slug: string): Promise<ProjectDocumentDto> {
    const { data } = await firstValueFrom(
      this.http.get<ProjectDocumentDto>(`${this.baseUrl}/projects/${projectId}/documents/by-slug?slug=${encodeURIComponent(slug)}`),
    )
    return data
  }

  async createProjectDocument(projectId: string, dto: CreateProjectDocumentDto): Promise<ProjectDocumentDto> {
    const { data } = await firstValueFrom(
      this.http.post<ProjectDocumentDto>(`${this.baseUrl}/projects/${projectId}/documents`, dto),
    )
    return data
  }

  async updateProjectDocument(projectId: string, id: string, dto: UpdateProjectDocumentDto): Promise<ProjectDocumentDto> {
    const { data } = await firstValueFrom(
      this.http.patch<ProjectDocumentDto>(`${this.baseUrl}/projects/${projectId}/documents/${id}`, dto),
    )
    return data
  }

  async deleteProjectDocument(projectId: string, id: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${this.baseUrl}/projects/${projectId}/documents/${id}`),
    )
  }

  // ── Bootstrap Conversation (AIR-009) ──────────────────────────────

  async startBootstrapConversation(projectId: string): Promise<BootstrapConversationDto> {
    const { data } = await firstValueFrom(
      this.http.post<BootstrapConversationDto>(`${this.baseUrl}/projects/${projectId}/bootstrap-conversation/start`, {}),
    )
    return data
  }

  async sendBootstrapMessage(projectId: string, body: { content: string }): Promise<SendBootstrapMessageResponseDto> {
    const { data } = await firstValueFrom(
      this.http.post<SendBootstrapMessageResponseDto>(`${this.baseUrl}/projects/${projectId}/bootstrap-conversation/messages`, body),
    )
    return data
  }

  async getBootstrapConversationStatus(projectId: string): Promise<BootstrapConversationDto> {
    const { data } = await firstValueFrom(
      this.http.get<BootstrapConversationDto>(`${this.baseUrl}/projects/${projectId}/bootstrap-conversation/status`),
    )
    return data
  }

  // ── Growth Proposals (AIR-016) ────────────────────────────────────

  async proposeGrowth(projectId: string): Promise<ProposeGrowthResponseDto> {
    const { data } = await firstValueFrom(
      this.http.post<ProposeGrowthResponseDto>(`${this.baseUrl}/projects/${projectId}/bootstrap-conversation/propose-growth`, {}),
    )
    return data
  }

  async approveGrowthProposal(projectId: string, proposalId: string): Promise<ApproveGrowthProposalResponseDto> {
    const { data } = await firstValueFrom(
      this.http.post<ApproveGrowthProposalResponseDto>(
        `${this.baseUrl}/projects/${projectId}/bootstrap-conversation/proposals/${proposalId}/approve`,
        {},
      ),
    )
    return data
  }

  async rejectGrowthProposal(projectId: string, proposalId: string, reason: string): Promise<RejectGrowthProposalResponseDto> {
    const { data } = await firstValueFrom(
      this.http.post<RejectGrowthProposalResponseDto>(
        `${this.baseUrl}/projects/${projectId}/bootstrap-conversation/proposals/${proposalId}/reject`,
        { reason },
      ),
    )
    return data
  }
}
