import { apiClient } from './api-client'
import type { GrowthPace, ApprovalLevel } from '@the-crew/shared-types'

export interface BootstrapInput {
  name: string
  mission: string
  companyType: string
  vision?: string
  growthPace?: GrowthPace
  approvalLevel?: ApprovalLevel
}

export interface BootstrapResult {
  projectSeedId: string
  constitutionId: string
  companyUoId: string
  ceoAgentId: string
  maturityPhase: 'seed'
  nextStep: 'bootstrap-conversation'
}

export interface BootstrapStatus {
  bootstrapped: boolean
  maturityPhase: string | null
  companyUoId: string | null
  ceoAgentId: string | null
}

export const bootstrapApi = {
  bootstrap(projectId: string, input: BootstrapInput): Promise<BootstrapResult> {
    return apiClient.post(`/projects/${projectId}/bootstrap`, input)
  },

  getStatus(projectId: string): Promise<BootstrapStatus> {
    return apiClient.get(`/projects/${projectId}/bootstrap/status`)
  },
}
