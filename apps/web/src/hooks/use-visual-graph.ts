import { useQuery } from '@tanstack/react-query'
import type { ZoomLevel, LayerId } from '@the-crew/shared-types'
import { visualGraphApi } from '@/api/visual-graph'

export function useVisualGraph(
  projectId: string,
  level: ZoomLevel = 'L1',
  entityId?: string,
  layers?: LayerId[],
) {
  return useQuery({
    queryKey: ['visual-graph', projectId, level, entityId, layers],
    queryFn: () =>
      visualGraphApi.getVisualGraph({ projectId, level, entityId, layers }),
  })
}
