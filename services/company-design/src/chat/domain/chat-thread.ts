import { AggregateRoot } from '@the-crew/domain-core'
import { randomUUID } from 'crypto'
import type { ScopeType, ChatMessageRole, ChatEntityRef, ChatActionSuggestion } from '@the-crew/shared-types'
import { ChatMessage } from './chat-message'

export interface ChatThreadProps {
  id: string
  projectId: string
  scopeType: ScopeType
  entityId: string | null
  title: string
  messages: ChatMessage[]
  createdAt: Date
}

export class ChatThread extends AggregateRoot<string> {
  readonly projectId: string
  readonly scopeType: ScopeType
  readonly entityId: string | null
  private _title: string
  private _messages: ChatMessage[]
  readonly createdAt: Date

  private constructor(props: ChatThreadProps) {
    super(props.id)
    this.projectId = props.projectId
    this.scopeType = props.scopeType
    this.entityId = props.entityId
    this._title = props.title
    this._messages = [...props.messages]
    this.createdAt = props.createdAt
  }

  static create(projectId: string, scopeType: ScopeType, entityId: string | null): ChatThread {
    const title = entityId ? `Chat: ${scopeType} ${entityId}` : `Chat: ${scopeType}`
    return new ChatThread({
      id: randomUUID(),
      projectId,
      scopeType,
      entityId,
      title,
      messages: [],
      createdAt: new Date(),
    })
  }

  static reconstitute(props: ChatThreadProps): ChatThread {
    return new ChatThread(props)
  }

  get title(): string {
    return this._title
  }

  updateTitle(title: string): void {
    this._title = title
  }

  get messages(): readonly ChatMessage[] {
    return [...this._messages]
  }

  get messageCount(): number {
    return this._messages.length
  }

  get lastMessageAt(): Date | null {
    if (this._messages.length === 0) return null
    return this._messages[this._messages.length - 1]!.createdAt
  }

  addMessage(
    role: ChatMessageRole,
    content: string,
    entityRefs: ChatEntityRef[] = [],
    actions: ChatActionSuggestion[] = [],
  ): ChatMessage {
    const message = ChatMessage.create(this.id, role, content, entityRefs, actions)
    this._messages.push(message)
    return message
  }
}
