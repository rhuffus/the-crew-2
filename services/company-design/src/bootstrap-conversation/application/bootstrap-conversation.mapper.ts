import type { BootstrapConversationDto } from '@the-crew/shared-types'
import type { BootstrapConversation } from '../domain/bootstrap-conversation'

export class BootstrapConversationMapper {
  static toDto(conv: BootstrapConversation): BootstrapConversationDto {
    return {
      id: conv.id,
      projectId: conv.projectId,
      threadId: conv.threadId,
      ceoAgentId: conv.ceoAgentId,
      status: conv.status,
      createdAt: conv.createdAt.toISOString(),
      updatedAt: conv.updatedAt.toISOString(),
    }
  }
}
