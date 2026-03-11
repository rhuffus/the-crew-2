import type { ScopeType } from '@the-crew/shared-types'
import type { ChatThread } from './chat-thread'

export const CHAT_REPOSITORY = Symbol('CHAT_REPOSITORY')

export interface ChatRepository {
  findByScope(projectId: string, scopeType: ScopeType, entityId: string | null): Promise<ChatThread | null>
  findById(threadId: string): Promise<ChatThread | null>
  listByProject(projectId: string): Promise<ChatThread[]>
  save(thread: ChatThread): Promise<void>
  delete(threadId: string): Promise<void>
}
