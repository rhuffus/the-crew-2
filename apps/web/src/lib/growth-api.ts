import { apiClient } from './api-client'
import type { OrgHealthReportDto, PhaseCapabilitiesDto } from '@the-crew/shared-types'

export const growthApi = {
  getHealth(projectId: string): Promise<OrgHealthReportDto> {
    return apiClient.get(`/projects/${projectId}/growth/health`)
  },

  getPhaseCapabilities(projectId: string): Promise<PhaseCapabilitiesDto> {
    return apiClient.get(`/projects/${projectId}/growth/phase-capabilities`)
  },
}
