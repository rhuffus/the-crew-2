import type { AuditEntryDto } from '@the-crew/shared-types'
import { apiClient } from '@/lib/api-client'

export const auditApi = {
  list(projectId: string, entityType?: string, entityId?: string): Promise<AuditEntryDto[]> {
    const params = new URLSearchParams()
    if (entityType) params.append('entityType', entityType)
    if (entityId) params.append('entityId', entityId)
    const query = params.toString()
    return apiClient.get(`/projects/${projectId}/audit${query ? `?${query}` : ''}`)
  },
}
