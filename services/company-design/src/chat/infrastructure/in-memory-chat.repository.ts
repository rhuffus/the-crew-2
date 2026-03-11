import { Injectable } from '@nestjs/common'
import type { ScopeType } from '@the-crew/shared-types'
import type { ChatRepository } from '../domain/chat-repository'
import type { ChatThread } from '../domain/chat-thread'

@Injectable()
export class InMemoryChatRepository implements ChatRepository {
  private readonly store = new Map<string, ChatThread>()

  async findByScope(projectId: string, scopeType: ScopeType, entityId: string | null): Promise<ChatThread | null> {
    for (const thread of this.store.values()) {
      if (thread.projectId === projectId && thread.scopeType === scopeType && thread.entityId === entityId) {
        return thread
      }
    }
    return null
  }

  async findById(threadId: string): Promise<ChatThread | null> {
    return this.store.get(threadId) ?? null
  }

  async listByProject(projectId: string): Promise<ChatThread[]> {
    return [...this.store.values()].filter((t) => t.projectId === projectId)
  }

  async save(thread: ChatThread): Promise<void> {
    this.store.set(thread.id, thread)
  }

  async delete(threadId: string): Promise<void> {
    this.store.delete(threadId)
  }
}
