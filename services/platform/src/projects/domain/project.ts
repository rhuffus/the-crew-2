import { AggregateRoot } from '@the-crew/domain-core'

export interface ProjectProps {
  name: string
  description: string
  status: 'active' | 'archived'
  createdAt: Date
  updatedAt: Date
}

export class Project extends AggregateRoot<string> {
  private _name: string
  private _description: string
  private _status: 'active' | 'archived'
  private _createdAt: Date
  private _updatedAt: Date

  private constructor(id: string, props: ProjectProps) {
    super(id)
    this._name = props.name
    this._description = props.description
    this._status = props.status
    this._createdAt = props.createdAt
    this._updatedAt = props.updatedAt
  }

  get name() {
    return this._name
  }
  get description() {
    return this._description
  }
  get status() {
    return this._status
  }
  get createdAt() {
    return this._createdAt
  }
  get updatedAt() {
    return this._updatedAt
  }

  static create(props: { id: string; name: string; description: string }): Project {
    if (!props.name.trim()) {
      throw new Error('Project name cannot be empty')
    }
    const now = new Date()
    const project = new Project(props.id, {
      name: props.name.trim(),
      description: props.description,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    })
    project.addDomainEvent({
      eventType: 'ProjectCreated',
      occurredOn: now,
      aggregateId: props.id,
      payload: { name: props.name },
    })
    return project
  }

  static reconstitute(id: string, props: ProjectProps): Project {
    return new Project(id, props)
  }

  updateMetadata(props: { name?: string; description?: string }): void {
    if (props.name !== undefined) {
      if (!props.name.trim()) {
        throw new Error('Project name cannot be empty')
      }
      this._name = props.name.trim()
    }
    if (props.description !== undefined) {
      this._description = props.description
    }
    this._updatedAt = new Date()
    this.addDomainEvent({
      eventType: 'ProjectUpdated',
      occurredOn: this._updatedAt,
      aggregateId: this.id,
      payload: { name: this._name, description: this._description },
    })
  }

  archive(): void {
    this._status = 'archived'
    this._updatedAt = new Date()
    this.addDomainEvent({
      eventType: 'ProjectArchived',
      occurredOn: this._updatedAt,
      aggregateId: this.id,
      payload: {},
    })
  }
}
