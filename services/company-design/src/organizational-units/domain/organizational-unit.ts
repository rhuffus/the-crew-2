import { AggregateRoot } from '@the-crew/domain-core'

export type UoType = 'company' | 'department' | 'team'
export type UoStatus = 'active' | 'proposed' | 'retired'

export interface OrganizationalUnitProps {
  projectId: string
  name: string
  description: string
  uoType: UoType
  mandate: string
  purpose: string
  parentUoId: string | null
  coordinatorAgentId: string | null
  functions: string[]
  status: UoStatus
  createdAt: Date
  updatedAt: Date
}

export class OrganizationalUnit extends AggregateRoot<string> {
  private _projectId: string
  private _name: string
  private _description: string
  private _uoType: UoType
  private _mandate: string
  private _purpose: string
  private _parentUoId: string | null
  private _coordinatorAgentId: string | null
  private _functions: string[]
  private _status: UoStatus
  private _createdAt: Date
  private _updatedAt: Date

  private constructor(id: string, props: OrganizationalUnitProps) {
    super(id)
    this._projectId = props.projectId
    this._name = props.name
    this._description = props.description
    this._uoType = props.uoType
    this._mandate = props.mandate
    this._purpose = props.purpose
    this._parentUoId = props.parentUoId
    this._coordinatorAgentId = props.coordinatorAgentId
    this._functions = [...props.functions]
    this._status = props.status
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
  get uoType() {
    return this._uoType
  }
  get mandate() {
    return this._mandate
  }
  get purpose() {
    return this._purpose
  }
  get parentUoId() {
    return this._parentUoId
  }
  get coordinatorAgentId() {
    return this._coordinatorAgentId
  }
  get functions(): string[] {
    return [...this._functions]
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
    name: string
    description: string
    uoType: UoType
    mandate: string
    purpose?: string
    parentUoId?: string | null
    coordinatorAgentId?: string | null
    functions?: string[]
    status?: UoStatus
  }): OrganizationalUnit {
    if (!props.name.trim()) {
      throw new Error('OrganizationalUnit name cannot be empty')
    }
    if (!props.mandate.trim()) {
      throw new Error('OrganizationalUnit mandate cannot be empty')
    }
    if (props.uoType === 'company' && props.parentUoId) {
      throw new Error('Company-type unit cannot have a parent')
    }
    const now = new Date()
    const unit = new OrganizationalUnit(props.id, {
      projectId: props.projectId,
      name: props.name.trim(),
      description: props.description,
      uoType: props.uoType,
      mandate: props.mandate.trim(),
      purpose: props.purpose ?? '',
      parentUoId: props.parentUoId ?? null,
      coordinatorAgentId: props.coordinatorAgentId ?? null,
      functions: props.functions ?? [],
      status: props.status ?? 'active',
      createdAt: now,
      updatedAt: now,
    })
    unit.addDomainEvent({
      eventType: 'OrganizationalUnitCreated',
      occurredOn: now,
      aggregateId: props.id,
      payload: { projectId: props.projectId, name: props.name, uoType: props.uoType },
    })
    return unit
  }

  static reconstitute(id: string, props: OrganizationalUnitProps): OrganizationalUnit {
    return new OrganizationalUnit(id, props)
  }

  update(props: {
    name?: string
    description?: string
    mandate?: string
    purpose?: string
    parentUoId?: string | null
    coordinatorAgentId?: string | null
    functions?: string[]
    status?: UoStatus
  }): void {
    if (props.name !== undefined) {
      if (!props.name.trim()) {
        throw new Error('OrganizationalUnit name cannot be empty')
      }
      this._name = props.name.trim()
    }
    if (props.description !== undefined) {
      this._description = props.description
    }
    if (props.mandate !== undefined) {
      if (!props.mandate.trim()) {
        throw new Error('OrganizationalUnit mandate cannot be empty')
      }
      this._mandate = props.mandate.trim()
    }
    if (props.purpose !== undefined) {
      this._purpose = props.purpose
    }
    if (props.parentUoId !== undefined) {
      if (props.parentUoId === this.id) {
        throw new Error('OrganizationalUnit cannot be its own parent')
      }
      if (this._uoType === 'company' && props.parentUoId) {
        throw new Error('Company-type unit cannot have a parent')
      }
      this._parentUoId = props.parentUoId
    }
    if (props.coordinatorAgentId !== undefined) {
      this._coordinatorAgentId = props.coordinatorAgentId
    }
    if (props.functions !== undefined) {
      this._functions = [...props.functions]
    }
    if (props.status !== undefined) {
      this._status = props.status
    }
    this._updatedAt = new Date()
    this.addDomainEvent({
      eventType: 'OrganizationalUnitUpdated',
      occurredOn: this._updatedAt,
      aggregateId: this.id,
      payload: { name: this._name },
    })
  }
}
