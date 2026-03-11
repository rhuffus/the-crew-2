import type {
  ReviewMarkerDto,
  CreateReviewMarkerDto,
  UpdateReviewMarkerDto,
  EntityLockDto,
  AcquireLockDto,
} from '@the-crew/shared-types'
import { apiClient } from '@/lib/api-client'

export const reviewsApi = {
  list(projectId: string): Promise<ReviewMarkerDto[]> {
    return apiClient.get(`/projects/${projectId}/collaboration/reviews`)
  },

  getByEntity(projectId: string, entityId: string): Promise<ReviewMarkerDto | null> {
    return apiClient.get(`/projects/${projectId}/collaboration/reviews/by-entity?entityId=${entityId}`)
  },

  create(projectId: string, dto: CreateReviewMarkerDto): Promise<ReviewMarkerDto> {
    return apiClient.post(`/projects/${projectId}/collaboration/reviews`, dto)
  },

  update(projectId: string, id: string, dto: UpdateReviewMarkerDto): Promise<ReviewMarkerDto> {
    return apiClient.patch(`/projects/${projectId}/collaboration/reviews/${id}`, dto)
  },

  delete(projectId: string, id: string): Promise<void> {
    return apiClient.delete(`/projects/${projectId}/collaboration/reviews/${id}`)
  },
}

export const locksApi = {
  list(projectId: string): Promise<EntityLockDto[]> {
    return apiClient.get(`/projects/${projectId}/collaboration/locks`)
  },

  getByEntity(projectId: string, entityId: string): Promise<EntityLockDto | null> {
    return apiClient.get(`/projects/${projectId}/collaboration/locks/by-entity?entityId=${entityId}`)
  },

  acquire(projectId: string, dto: AcquireLockDto): Promise<EntityLockDto> {
    return apiClient.post(`/projects/${projectId}/collaboration/locks`, dto)
  },

  release(projectId: string, entityId: string): Promise<void> {
    return apiClient.delete(`/projects/${projectId}/collaboration/locks/by-entity?entityId=${entityId}`)
  },
}
