import { Injectable } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'
import type {
  ProjectSummary,
  CreateProjectDto,
  UpdateProjectDto,
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
}
