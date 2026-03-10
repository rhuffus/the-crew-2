import { AggregateRoot } from '@the-crew/domain-core'

export type AgentAssignmentStatus = 'active' | 'inactive'

export interface AgentAssignmentProps {
  projectId: string
  archetypeId: string
  name: string
  status: AgentAssignmentStatus
  createdAt: Date
  updatedAt: Date
}

export class AgentAssignment extends AggregateRoot<string> {
  private _projectId: string
  private _archetypeId: string
  private _name: string
  private _status: AgentAssignmentStatus
  private _createdAt: Date
  private _updatedAt: Date

  private constructor(id: string, props: AgentAssignmentProps) {
    super(id)
    this._projectId = props.projectId
    this._archetypeId = props.archetypeId
    this._name = props.name
    this._status = props.status
    this._createdAt = props.createdAt
    this._updatedAt = props.updatedAt
  }

  get projectId() {
    return this._projectId
  }
  get archetypeId() {
    return this._archetypeId
  }
  get name() {
    return this._name
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

  static create(props: {
    id: string
    projectId: string
    archetypeId: string
    name: string
  }): AgentAssignment {
    if (!props.name.trim()) {
      throw new Error('Agent assignment name cannot be empty')
    }
    if (!props.archetypeId.trim()) {
      throw new Error('Agent assignment must reference an archetype')
    }
    const now = new Date()
    const assignment = new AgentAssignment(props.id, {
      projectId: props.projectId,
      archetypeId: props.archetypeId,
      name: props.name.trim(),
      status: 'active',
      createdAt: now,
      updatedAt: now,
    })
    assignment.addDomainEvent({
      eventType: 'AgentAssignmentCreated',
      occurredOn: now,
      aggregateId: props.id,
      payload: { projectId: props.projectId, archetypeId: props.archetypeId, name: props.name },
    })
    return assignment
  }

  static reconstitute(id: string, props: AgentAssignmentProps): AgentAssignment {
    return new AgentAssignment(id, props)
  }

  update(props: {
    name?: string
    status?: AgentAssignmentStatus
  }): void {
    if (props.name !== undefined) {
      if (!props.name.trim()) {
        throw new Error('Agent assignment name cannot be empty')
      }
      this._name = props.name.trim()
    }
    if (props.status !== undefined) {
      this._status = props.status
    }
    this._updatedAt = new Date()
    this.addDomainEvent({
      eventType: 'AgentAssignmentUpdated',
      occurredOn: this._updatedAt,
      aggregateId: this.id,
      payload: { name: this._name, status: this._status },
    })
  }

  deactivate(): void {
    if (this._status === 'inactive') {
      throw new Error('Agent assignment is already inactive')
    }
    this._status = 'inactive'
    this._updatedAt = new Date()
    this.addDomainEvent({
      eventType: 'AgentAssignmentDeactivated',
      occurredOn: this._updatedAt,
      aggregateId: this.id,
      payload: { name: this._name },
    })
  }

  activate(): void {
    if (this._status === 'active') {
      throw new Error('Agent assignment is already active')
    }
    this._status = 'active'
    this._updatedAt = new Date()
    this.addDomainEvent({
      eventType: 'AgentAssignmentActivated',
      occurredOn: this._updatedAt,
      aggregateId: this.id,
      payload: { name: this._name },
    })
  }
}
