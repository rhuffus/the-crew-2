import { useQuery } from '@tanstack/react-query'
import type { ScopeType, LayerId } from '@the-crew/shared-types'
import { visualGraphApi } from '@/api/visual-graph'

export function useVisualGraph(
  projectId: string,
  scopeType: ScopeType = 'company',
  entityId?: string,
  layers?: LayerId[],
) {
  return useQuery({
    queryKey: ['visual-graph', projectId, scopeType, entityId, layers],
    queryFn: () =>
      visualGraphApi.getVisualGraph({ projectId, scope: scopeType, entityId, layers }),
  })
}
