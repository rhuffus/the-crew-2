import { Entity } from '@the-crew/domain-core'
import { randomUUID } from 'crypto'
import type { ChatMessageRole, ChatEntityRef, ChatActionSuggestion } from '@the-crew/shared-types'

export interface ChatMessageProps {
  id: string
  threadId: string
  role: ChatMessageRole
  content: string
  entityRefs: ChatEntityRef[]
  actions: ChatActionSuggestion[]
  createdAt: Date
}

export class ChatMessage extends Entity<string> {
  readonly threadId: string
  readonly role: ChatMessageRole
  readonly content: string
  readonly entityRefs: ChatEntityRef[]
  readonly actions: ChatActionSuggestion[]
  readonly createdAt: Date

  private constructor(props: ChatMessageProps) {
    super(props.id)
    this.threadId = props.threadId
    this.role = props.role
    this.content = props.content
    this.entityRefs = [...props.entityRefs]
    this.actions = [...props.actions]
    this.createdAt = props.createdAt
  }

  static create(
    threadId: string,
    role: ChatMessageRole,
    content: string,
    entityRefs: ChatEntityRef[] = [],
    actions: ChatActionSuggestion[] = [],
  ): ChatMessage {
    if (!content.trim()) {
      throw new Error('Message content cannot be empty')
    }
    return new ChatMessage({
      id: randomUUID(),
      threadId,
      role,
      content,
      entityRefs,
      actions,
      createdAt: new Date(),
    })
  }

  static reconstitute(props: ChatMessageProps): ChatMessage {
    return new ChatMessage(props)
  }
}
