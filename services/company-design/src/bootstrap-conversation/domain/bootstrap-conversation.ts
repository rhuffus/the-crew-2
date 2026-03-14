import { AggregateRoot } from '@the-crew/domain-core'
import { randomUUID } from 'crypto'
import type { BootstrapConversationStatus } from '@the-crew/shared-types'

export interface BootstrapConversationProps {
  id: string
  projectId: string
  threadId: string
  ceoAgentId: string
  status: BootstrapConversationStatus
  createdAt: Date
  updatedAt: Date
}

const STATUS_ORDER: readonly BootstrapConversationStatus[] = [
  'not-started',
  'collecting-context',
  'drafting-foundation-docs',
  'reviewing-foundation-docs',
  'ready-to-grow',
  'growth-started',
]

export class BootstrapConversation extends AggregateRoot<string> {
  readonly projectId: string
  readonly threadId: string
  readonly ceoAgentId: string
  private _status: BootstrapConversationStatus
  readonly createdAt: Date
  private _updatedAt: Date

  private constructor(props: BootstrapConversationProps) {
    super(props.id)
    this.projectId = props.projectId
    this.threadId = props.threadId
    this.ceoAgentId = props.ceoAgentId
    this._status = props.status
    this.createdAt = props.createdAt
    this._updatedAt = props.updatedAt
  }

  static create(projectId: string, threadId: string, ceoAgentId: string): BootstrapConversation {
    const now = new Date()
    const conv = new BootstrapConversation({
      id: randomUUID(),
      projectId,
      threadId,
      ceoAgentId,
      status: 'not-started',
      createdAt: now,
      updatedAt: now,
    })

    conv.addDomainEvent({
      eventType: 'BootstrapConversationCreated',
      occurredOn: now,
      aggregateId: conv.id,
      payload: { projectId, threadId, ceoAgentId },
    })

    return conv
  }

  static reconstitute(props: BootstrapConversationProps): BootstrapConversation {
    return new BootstrapConversation(props)
  }

  get status(): BootstrapConversationStatus {
    return this._status
  }

  get updatedAt(): Date {
    return this._updatedAt
  }

  advanceTo(target: BootstrapConversationStatus): void {
    const currentIdx = STATUS_ORDER.indexOf(this._status)
    const targetIdx = STATUS_ORDER.indexOf(target)

    if (targetIdx <= currentIdx) {
      throw new Error(
        `Cannot advance from '${this._status}' to '${target}': status must move forward`,
      )
    }

    const from = this._status
    this._status = target
    this._updatedAt = new Date()

    this.addDomainEvent({
      eventType: 'BootstrapConversationAdvanced',
      occurredOn: this._updatedAt,
      aggregateId: this.id,
      payload: { projectId: this.projectId, from, to: target },
    })
  }

  canAdvanceTo(target: BootstrapConversationStatus): boolean {
    const currentIdx = STATUS_ORDER.indexOf(this._status)
    const targetIdx = STATUS_ORDER.indexOf(target)
    return targetIdx > currentIdx
  }
}
