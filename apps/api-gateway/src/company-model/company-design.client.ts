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
    level?: string,
    entityId?: string,
    layers?: string,
  ): Promise<VisualGraphDto> {
    const params = new URLSearchParams()
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
    level?: string,
    entityId?: string,
    layers?: string,
  ): Promise<VisualGraphDiffDto> {
    const params = new URLSearchParams()
    params.append('base', baseReleaseId)
    params.append('compare', compareReleaseId)
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
}
