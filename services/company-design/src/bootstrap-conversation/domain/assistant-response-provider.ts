import type { BootstrapConversationStatus, ChatMessageDto, GrowthProposalSuggestion } from '@the-crew/shared-types'

export const ASSISTANT_RESPONSE_PROVIDER = Symbol('ASSISTANT_RESPONSE_PROVIDER')

export interface AssistantResponseContext {
  projectId: string
  companyName: string
  companyMission: string
  companyType: string
  conversationStatus: BootstrapConversationStatus
  recentMessages: ChatMessageDto[]
}

export interface AssistantResponse {
  content: string
  suggestedNextStatus: BootstrapConversationStatus | null
  growthProposals?: GrowthProposalSuggestion[]
}

export interface AssistantResponseProvider {
  generateKickoff(ctx: AssistantResponseContext): Promise<AssistantResponse>
  generateReply(ctx: AssistantResponseContext, userMessage: string): Promise<AssistantResponse>
}
