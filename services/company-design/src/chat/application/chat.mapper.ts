import type { ChatMessageDto, ChatThreadDto } from '@the-crew/shared-types'
import type { ChatMessage } from '../domain/chat-message'
import type { ChatThread } from '../domain/chat-thread'

export class ChatMapper {
  static threadToDto(thread: ChatThread): ChatThreadDto {
    return {
      id: thread.id,
      projectId: thread.projectId,
      scopeType: thread.scopeType,
      entityId: thread.entityId,
      title: thread.title,
      messageCount: thread.messageCount,
      lastMessageAt: thread.lastMessageAt?.toISOString() ?? null,
      createdAt: thread.createdAt.toISOString(),
    }
  }

  static messageToDto(message: ChatMessage): ChatMessageDto {
    return {
      id: message.id,
      threadId: message.threadId,
      role: message.role,
      content: message.content,
      entityRefs: [...message.entityRefs],
      actions: [...message.actions],
      createdAt: message.createdAt.toISOString(),
    }
  }
}
