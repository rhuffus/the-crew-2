import { AggregateRoot } from '@the-crew/domain-core'

export interface RoleProps {
  projectId: string
  name: string
  description: string
  departmentId: string
  capabilityIds: string[]
  accountability: string
  authority: string
  createdAt: Date
  updatedAt: Date
}

export class Role extends AggregateRoot<string> {
  private _projectId: string
  private _name: string
  private _description: string
  private _departmentId: string
  private _capabilityIds: string[]
  private _accountability: string
  private _authority: string
  private _createdAt: Date
  private _updatedAt: Date

  private constructor(id: string, props: RoleProps) {
    super(id)
    this._projectId = props.projectId
    this._name = props.name
    this._description = props.description
    this._departmentId = props.departmentId
    this._capabilityIds = props.capabilityIds
    this._accountability = props.accountability
    this._authority = props.authority
    this._createdAt = props.createdAt
    this._updatedAt = props.updatedAt
  }

  get projectId() {
    return this._projectId
  }
  get name() {
    return this._name
  }
  get description() {
    return this._description
  }
  get departmentId() {
    return this._departmentId
  }
  get capabilityIds(): string[] {
    return [...this._capabilityIds]
  }
  get accountability() {
    return this._accountability
  }
  get authority() {
    return this._authority
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
    name: string
    description: string
    departmentId: string
    capabilityIds?: string[]
    accountability?: string
    authority?: string
  }): Role {
    if (!props.name.trim()) {
      throw new Error('Role name cannot be empty')
    }
    if (!props.departmentId.trim()) {
      throw new Error('Role must belong to a department')
    }
    const now = new Date()
    const role = new Role(props.id, {
      projectId: props.projectId,
      name: props.name.trim(),
      description: props.description,
      departmentId: props.departmentId,
      capabilityIds: (props.capabilityIds ?? []).filter(Boolean),
      accountability: props.accountability ?? '',
      authority: props.authority ?? '',
      createdAt: now,
      updatedAt: now,
    })
    role.addDomainEvent({
      eventType: 'RoleCreated',
      occurredOn: now,
      aggregateId: props.id,
      payload: { projectId: props.projectId, name: props.name },
    })
    return role
  }

  static reconstitute(id: string, props: RoleProps): Role {
    return new Role(id, props)
  }

  update(props: {
    name?: string
    description?: string
    departmentId?: string
    capabilityIds?: string[]
    accountability?: string
    authority?: string
  }): void {
    if (props.name !== undefined) {
      if (!props.name.trim()) {
        throw new Error('Role name cannot be empty')
      }
      this._name = props.name.trim()
    }
    if (props.description !== undefined) {
      this._description = props.description
    }
    if (props.departmentId !== undefined) {
      if (!props.departmentId.trim()) {
        throw new Error('Role must belong to a department')
      }
      this._departmentId = props.departmentId
    }
    if (props.capabilityIds !== undefined) {
      this._capabilityIds = props.capabilityIds.filter(Boolean)
    }
    if (props.accountability !== undefined) {
      this._accountability = props.accountability
    }
    if (props.authority !== undefined) {
      this._authority = props.authority
    }
    this._updatedAt = new Date()
    this.addDomainEvent({
      eventType: 'RoleUpdated',
      occurredOn: this._updatedAt,
      aggregateId: this.id,
      payload: { name: this._name },
    })
  }
}
