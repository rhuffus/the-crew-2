import { apiClient } from './api-client'
import type {
  BootstrapConversationDto,
  SendBootstrapMessageResponseDto,
  ProposeGrowthResponseDto,
  ApproveGrowthProposalResponseDto,
  RejectGrowthProposalResponseDto,
} from '@the-crew/shared-types'

export const bootstrapConversationApi = {
  startConversation(projectId: string): Promise<BootstrapConversationDto> {
    return apiClient.post(`/projects/${projectId}/bootstrap-conversation/start`, {})
  },

  sendMessage(projectId: string, content: string): Promise<SendBootstrapMessageResponseDto> {
    return apiClient.post(`/projects/${projectId}/bootstrap-conversation/messages`, { content })
  },

  getStatus(projectId: string): Promise<BootstrapConversationDto> {
    return apiClient.get(`/projects/${projectId}/bootstrap-conversation/status`)
  },

  proposeGrowth(projectId: string): Promise<ProposeGrowthResponseDto> {
    return apiClient.post(`/projects/${projectId}/bootstrap-conversation/propose-growth`, {})
  },

  approveGrowthProposal(projectId: string, proposalId: string): Promise<ApproveGrowthProposalResponseDto> {
    return apiClient.post(`/projects/${projectId}/bootstrap-conversation/proposals/${proposalId}/approve`, {})
  },

  rejectGrowthProposal(projectId: string, proposalId: string, reason: string): Promise<RejectGrowthProposalResponseDto> {
    return apiClient.post(`/projects/${projectId}/bootstrap-conversation/proposals/${proposalId}/reject`, { reason })
  },
}
