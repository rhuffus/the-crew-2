import type {
  ProjectDocumentDto,
  CreateProjectDocumentDto,
  UpdateProjectDocumentDto,
} from '@the-crew/shared-types'
import { apiClient } from '@/lib/api-client'

export const projectDocumentsApi = {
  list(projectId: string): Promise<ProjectDocumentDto[]> {
    return apiClient.get(`/projects/${projectId}/documents`)
  },

  get(projectId: string, id: string): Promise<ProjectDocumentDto> {
    return apiClient.get(`/projects/${projectId}/documents/${id}`)
  },

  getBySlug(projectId: string, slug: string): Promise<ProjectDocumentDto> {
    return apiClient.get(`/projects/${projectId}/documents/by-slug?slug=${encodeURIComponent(slug)}`)
  },

  create(projectId: string, dto: CreateProjectDocumentDto): Promise<ProjectDocumentDto> {
    return apiClient.post(`/projects/${projectId}/documents`, dto)
  },

  update(projectId: string, id: string, dto: UpdateProjectDocumentDto): Promise<ProjectDocumentDto> {
    return apiClient.patch(`/projects/${projectId}/documents/${id}`, dto)
  },

  remove(projectId: string, id: string): Promise<void> {
    return apiClient.delete(`/projects/${projectId}/documents/${id}`)
  },
}
