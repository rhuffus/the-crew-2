import { Injectable } from '@nestjs/common'
import type { BootstrapConversationRepository } from '../domain/bootstrap-conversation-repository'
import type { BootstrapConversation } from '../domain/bootstrap-conversation'

@Injectable()
export class InMemoryBootstrapConversationRepository implements BootstrapConversationRepository {
  private readonly store = new Map<string, BootstrapConversation>()

  async findByProjectId(projectId: string): Promise<BootstrapConversation | null> {
    for (const conv of this.store.values()) {
      if (conv.projectId === projectId) return conv
    }
    return null
  }

  async findById(id: string): Promise<BootstrapConversation | null> {
    return this.store.get(id) ?? null
  }

  async save(conversation: BootstrapConversation): Promise<void> {
    this.store.set(conversation.id, conversation)
  }
}
