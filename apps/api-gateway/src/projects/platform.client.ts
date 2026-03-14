import { Injectable } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'
import type {
  ProjectSummary,
  CreateProjectDto,
  UpdateProjectDto,
  SubmitAgentTaskDto,
  AgentTaskStatusDto,
  AiProviderConfigDto,
  UpsertAiProviderConfigDto,
  AiProviderValidationDto,
} from '@the-crew/shared-types'

@Injectable()
export class PlatformClient {
  private readonly baseUrl: string

  constructor(private readonly http: HttpService) {
    this.baseUrl = process.env['PLATFORM_SERVICE_URL'] ?? 'http://localhost:4010'
  }

  async listProjects(): Promise<ProjectSummary[]> {
    const { data } = await firstValueFrom(
      this.http.get<ProjectSummary[]>(`${this.baseUrl}/projects`),
    )
    return data
  }

  async getProject(id: string): Promise<ProjectSummary> {
    const { data } = await firstValueFrom(
      this.http.get<ProjectSummary>(`${this.baseUrl}/projects/${id}`),
    )
    return data
  }

  async createProject(dto: CreateProjectDto): Promise<ProjectSummary> {
    const { data } = await firstValueFrom(
      this.http.post<ProjectSummary>(`${this.baseUrl}/projects`, dto),
    )
    return data
  }

  async updateProject(id: string, dto: UpdateProjectDto): Promise<ProjectSummary> {
    const { data } = await firstValueFrom(
      this.http.patch<ProjectSummary>(`${this.baseUrl}/projects/${id}`, dto),
    )
    return data
  }

  // ── Agent Tasks (AIR-017) ─────────────────────────────────────────

  async submitAgentTask(projectId: string, dto: SubmitAgentTaskDto): Promise<AgentTaskStatusDto> {
    const { data } = await firstValueFrom(
      this.http.post<AgentTaskStatusDto>(`${this.baseUrl}/projects/${projectId}/agent-tasks`, dto),
    )
    return data
  }

  async getAgentTaskStatus(projectId: string, workflowId: string): Promise<AgentTaskStatusDto> {
    const { data } = await firstValueFrom(
      this.http.get<AgentTaskStatusDto>(`${this.baseUrl}/projects/${projectId}/agent-tasks/${workflowId}`),
    )
    return data
  }

  // ── AI Provider Config ──────────────────────────────────────────

  async listAiProviderConfigs(): Promise<AiProviderConfigDto[]> {
    const { data } = await firstValueFrom(
      this.http.get<AiProviderConfigDto[]>(`${this.baseUrl}/ai-provider-configs`),
    )
    return data
  }

  async getAiProviderConfig(providerId: string): Promise<AiProviderConfigDto> {
    const { data } = await firstValueFrom(
      this.http.get<AiProviderConfigDto>(`${this.baseUrl}/ai-provider-configs/${providerId}`),
    )
    return data
  }

  async upsertAiProviderConfig(providerId: string, dto: UpsertAiProviderConfigDto): Promise<AiProviderConfigDto> {
    const { data } = await firstValueFrom(
      this.http.put<AiProviderConfigDto>(`${this.baseUrl}/ai-provider-configs/${providerId}`, dto),
    )
    return data
  }

  async deleteAiProviderConfig(providerId: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${this.baseUrl}/ai-provider-configs/${providerId}`),
    )
  }

  async validateAiProviderConfig(providerId: string): Promise<AiProviderValidationDto> {
    const { data } = await firstValueFrom(
      this.http.get<AiProviderValidationDto>(`${this.baseUrl}/ai-provider-configs/${providerId}/validate`),
    )
    return data
  }
}
