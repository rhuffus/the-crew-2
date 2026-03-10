import { useQuery } from '@tanstack/react-query'
import { auditApi } from '@/api/audit'

function auditKey(projectId: string, entityType?: string, entityId?: string) {
  return ['projects', projectId, 'audit', entityType ?? '', entityId ?? ''] as const
}

export function useAudit(projectId: string, entityType?: string, entityId?: string) {
  return useQuery({
    queryKey: auditKey(projectId, entityType, entityId),
    queryFn: () => auditApi.list(projectId, entityType, entityId),
  })
}
