import { apiClient } from './api-client'
import type {
  ProposalDto,
  CreateProposalDto,
  GrowthEvaluationResultDto,
  ProposalType,
  ProposalStatus,
} from '@the-crew/shared-types'

export const proposalsApi = {
  submit(projectId: string, dto: CreateProposalDto & { id: string }): Promise<{ proposal: ProposalDto; evaluation: GrowthEvaluationResultDto }> {
    return apiClient.post(`/projects/${projectId}/proposals`, dto)
  },

  list(projectId: string, filters?: { status?: ProposalStatus; proposalType?: ProposalType }): Promise<ProposalDto[]> {
    const qs = new URLSearchParams()
    if (filters?.status) qs.append('status', filters.status)
    if (filters?.proposalType) qs.append('proposalType', filters.proposalType)
    const suffix = qs.toString() ? `?${qs.toString()}` : ''
    return apiClient.get(`/projects/${projectId}/proposals${suffix}`)
  },

  get(projectId: string, proposalId: string): Promise<ProposalDto> {
    return apiClient.get(`/projects/${projectId}/proposals/${proposalId}`)
  },

  evaluate(projectId: string, proposalId: string): Promise<GrowthEvaluationResultDto> {
    return apiClient.get(`/projects/${projectId}/proposals/${proposalId}/evaluate`)
  },

  approve(projectId: string, proposalId: string, approvedByUserId: string): Promise<ProposalDto> {
    return apiClient.post(`/projects/${projectId}/proposals/${proposalId}/approve`, { approvedByUserId })
  },

  reject(projectId: string, proposalId: string, reason: string): Promise<ProposalDto> {
    return apiClient.post(`/projects/${projectId}/proposals/${proposalId}/reject`, { reason })
  },
}
