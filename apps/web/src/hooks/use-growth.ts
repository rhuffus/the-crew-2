import { useQuery } from '@tanstack/react-query'
import { growthApi } from '@/lib/growth-api'

export function useOrgHealth(projectId: string) {
  return useQuery({
    queryKey: ['growth', 'health', projectId],
    queryFn: () => growthApi.getHealth(projectId),
    enabled: !!projectId,
  })
}

export function usePhaseCapabilities(projectId: string) {
  return useQuery({
    queryKey: ['growth', 'phase-capabilities', projectId],
    queryFn: () => growthApi.getPhaseCapabilities(projectId),
    enabled: !!projectId,
  })
}
