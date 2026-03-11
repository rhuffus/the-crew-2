import { AggregateRoot } from '@the-crew/domain-core'
import type { ArtifactType, ArtifactStatus, PartyType } from '@the-crew/shared-types'

export interface ArtifactProps {
  projectId: string
  name: string
  description: string
  type: ArtifactType
  status: ArtifactStatus
  producerId: string | null
  producerType: PartyType | null
  consumerIds: string[]
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export class Artifact extends AggregateRoot<string> {
  private _projectId: string
  private _name: string
  private _description: string
  private _type: ArtifactType
  private _status: ArtifactStatus
  private _producerId: string | null
  private _producerType: PartyType | null
  private _consumerIds: string[]
  private _tags: string[]
  private _createdAt: Date
  private _updatedAt: Date

  private constructor(id: string, props: ArtifactProps) {
    super(id)
    this._projectId = props.projectId
    this._name = props.name
    this._description = props.description
    this._type = props.type
    this._status = props.status
    this._producerId = props.producerId
    this._producerType = props.producerType
    this._consumerIds = props.consumerIds
    this._tags = props.tags
    this._createdAt = props.createdAt
    this._updatedAt = props.updatedAt
  }

  get projectId() { return this._projectId }
  get name() { return this._name }
  get description() { return this._description }
  get type() { return this._type }
  get status() { return this._status }
  get producerId() { return this._producerId }
  get producerType() { return this._producerType }
  get consumerIds(): string[] { return [...this._consumerIds] }
  get tags(): string[] { return [...this._tags] }
  get createdAt() { return this._createdAt }
  get updatedAt() { return this._updatedAt }

  static create(props: {
    id: string
    projectId: string
    name: string
    description: string
    type: ArtifactType
    producerId?: string | null
    producerType?: PartyType | null
    consumerIds?: string[]
    tags?: string[]
  }): Artifact {
    if (!props.name.trim()) {
      throw new Error('Artifact name cannot be empty')
    }
    const now = new Date()
    const artifact = new Artifact(props.id, {
      projectId: props.projectId,
      name: props.name.trim(),
      description: props.description,
      type: props.type,
      status: 'draft',
      producerId: props.producerId ?? null,
      producerType: props.producerType ?? null,
      consumerIds: (props.consumerIds ?? []).filter(Boolean),
      tags: (props.tags ?? []).filter(Boolean),
      createdAt: now,
      updatedAt: now,
    })
    artifact.addDomainEvent({
      eventType: 'ArtifactCreated',
      occurredOn: now,
      aggregateId: props.id,
      payload: { projectId: props.projectId, name: props.name },
    })
    return artifact
  }

  static reconstitute(id: string, props: ArtifactProps): Artifact {
    return new Artifact(id, props)
  }

  update(props: {
    name?: string
    description?: string
    type?: ArtifactType
    status?: ArtifactStatus
    producerId?: string | null
    producerType?: PartyType | null
    consumerIds?: string[]
    tags?: string[]
  }): void {
    if (props.name !== undefined) {
      if (!props.name.trim()) {
        throw new Error('Artifact name cannot be empty')
      }
      this._name = props.name.trim()
    }
    if (props.description !== undefined) {
      this._description = props.description
    }
    if (props.type !== undefined) {
      this._type = props.type
    }
    if (props.status !== undefined) {
      this._status = props.status
    }
    if (props.producerId !== undefined) {
      this._producerId = props.producerId
    }
    if (props.producerType !== undefined) {
      this._producerType = props.producerType
    }
    if (props.consumerIds !== undefined) {
      this._consumerIds = props.consumerIds.filter(Boolean)
    }
    if (props.tags !== undefined) {
      this._tags = props.tags.filter(Boolean)
    }
    this._updatedAt = new Date()
    this.addDomainEvent({
      eventType: 'ArtifactUpdated',
      occurredOn: this._updatedAt,
      aggregateId: this.id,
      payload: { name: this._name },
    })
  }
}
