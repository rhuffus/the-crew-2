import type {
  ProjectSummary,
  CreateProjectDto,
  UpdateProjectDto,
} from '@the-crew/shared-types'
import { apiClient } from '@/lib/api-client'

export const projectsApi = {
  list(): Promise<ProjectSummary[]> {
    return apiClient.get('/projects')
  },

  get(id: string): Promise<ProjectSummary> {
    return apiClient.get(`/projects/${id}`)
  },

  create(dto: CreateProjectDto): Promise<ProjectSummary> {
    return apiClient.post('/projects', dto)
  },

  update(id: string, dto: UpdateProjectDto): Promise<ProjectSummary> {
    return apiClient.patch(`/projects/${id}`, dto)
  },
}
