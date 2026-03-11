import type { PermissionManifest } from '@the-crew/shared-types'
import { apiClient } from '@/lib/api-client'

export const permissionsApi = {
  getManifest(projectId: string): Promise<PermissionManifest> {
    return apiClient.get<PermissionManifest>(`/projects/${projectId}/permissions`)
  },
}
