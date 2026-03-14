import type { BootstrapConversation } from './bootstrap-conversation'

export const BOOTSTRAP_CONVERSATION_REPOSITORY = Symbol('BOOTSTRAP_CONVERSATION_REPOSITORY')

export interface BootstrapConversationRepository {
  findByProjectId(projectId: string): Promise<BootstrapConversation | null>
  findById(id: string): Promise<BootstrapConversation | null>
  save(conversation: BootstrapConversation): Promise<void>
}
