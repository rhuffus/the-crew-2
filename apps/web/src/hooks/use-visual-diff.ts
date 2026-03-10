import { useQuery } from '@tanstack/react-query'
import type { ZoomLevel, LayerId } from '@the-crew/shared-types'
import { visualGraphApi } from '@/api/visual-graph'

export function useVisualDiff(
  projectId: string,
  baseReleaseId: string | null,
  compareReleaseId: string | null,
  level?: ZoomLevel,
  entityId?: string,
  layers?: LayerId[],
) {
  return useQuery({
    queryKey: ['visual-diff', projectId, baseReleaseId, compareReleaseId, level, entityId, layers],
    queryFn: () =>
      visualGraphApi.getVisualDiff({
        projectId,
        baseReleaseId: baseReleaseId!,
        compareReleaseId: compareReleaseId!,
        level,
        entityId,
        layers,
      }),
    enabled: !!baseReleaseId && !!compareReleaseId,
  })
}
