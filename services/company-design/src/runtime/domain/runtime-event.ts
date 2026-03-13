import { Entity } from '@the-crew/domain-core'
import { randomUUID } from 'crypto'
import type {
  RuntimeEventType,
  EventSeverity,
  CreateRuntimeEventDto,
} from '@the-crew/shared-types'

export interface RuntimeEventProps {
  id: string
  projectId: string
  eventType: RuntimeEventType
  severity: EventSeverity
  title: string
  description: string
  sourceEntityType: string
  sourceEntityId: string
  targetEntityType: string | null
  targetEntityId: string | null
  executionId: string | null
  metadata: Record<string, unknown>
  occurredAt: Date
}

export class RuntimeEvent extends Entity<string> {
  readonly projectId: string
  readonly eventType: RuntimeEventType
  readonly severity: EventSeverity
  readonly title: string
  readonly description: string
  readonly sourceEntityType: string
  readonly sourceEntityId: string
  readonly targetEntityType: string | null
  readonly targetEntityId: string | null
  readonly executionId: string | null
  readonly metadata: Record<string, unknown>
  readonly occurredAt: Date

  private constructor(props: RuntimeEventProps) {
    super(props.id)
    this.projectId = props.projectId
    this.eventType = props.eventType
    this.severity = props.severity
    this.title = props.title
    this.description = props.description
    this.sourceEntityType = props.sourceEntityType
    this.sourceEntityId = props.sourceEntityId
    this.targetEntityType = props.targetEntityType
    this.targetEntityId = props.targetEntityId
    this.executionId = props.executionId
    this.metadata = props.metadata
    this.occurredAt = props.occurredAt
  }

  static create(projectId: string, dto: CreateRuntimeEventDto): RuntimeEvent {
    if (!dto.title) {
      throw new Error('RuntimeEvent title cannot be empty')
    }
    if (!dto.sourceEntityType || !dto.sourceEntityId) {
      throw new Error('RuntimeEvent requires sourceEntityType and sourceEntityId')
    }
    return new RuntimeEvent({
      id: randomUUID(),
      projectId,
      eventType: dto.eventType,
      severity: dto.severity,
      title: dto.title,
      description: dto.description,
      sourceEntityType: dto.sourceEntityType,
      sourceEntityId: dto.sourceEntityId,
      targetEntityType: dto.targetEntityType ?? null,
      targetEntityId: dto.targetEntityId ?? null,
      executionId: dto.executionId ?? null,
      metadata: dto.metadata ?? {},
      occurredAt: new Date(),
    })
  }

  static reconstitute(props: RuntimeEventProps): RuntimeEvent {
    return new RuntimeEvent(props)
  }
}
