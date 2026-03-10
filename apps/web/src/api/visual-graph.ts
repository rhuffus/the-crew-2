import type { VisualGraphDto, VisualGraphDiffDto, ZoomLevel, LayerId } from '@the-crew/shared-types'
import { apiClient } from '@/lib/api-client'

export interface VisualGraphParams {
  projectId: string
  level?: ZoomLevel
  entityId?: string
  layers?: LayerId[]
}

export interface VisualDiffParams {
  projectId: string
  baseReleaseId: string
  compareReleaseId: string
  level?: ZoomLevel
  entityId?: string
  layers?: LayerId[]
}

export const visualGraphApi = {
  getVisualGraph({ projectId, level, entityId, layers }: VisualGraphParams): Promise<VisualGraphDto> {
    const params = new URLSearchParams()
    if (level) params.set('level', level)
    if (entityId) params.set('entityId', entityId)
    if (layers?.length) params.set('layers', layers.join(','))
    const qs = params.toString()
    return apiClient.get<VisualGraphDto>(
      `/projects/${projectId}/visual-graph${qs ? `?${qs}` : ''}`,
    )
  },

  getVisualDiff({ projectId, baseReleaseId, compareReleaseId, level, entityId, layers }: VisualDiffParams): Promise<VisualGraphDiffDto> {
    const params = new URLSearchParams()
    params.set('base', baseReleaseId)
    params.set('compare', compareReleaseId)
    if (level) params.set('level', level)
    if (entityId) params.set('entityId', entityId)
    if (layers?.length) params.set('layers', layers.join(','))
    const qs = params.toString()
    return apiClient.get<VisualGraphDiffDto>(
      `/projects/${projectId}/visual-graph/diff?${qs}`,
    )
  },
}
