import { AggregateRoot } from '@the-crew/domain-core'

export interface DepartmentProps {
  projectId: string
  name: string
  description: string
  mandate: string
  parentId: string | null
  createdAt: Date
  updatedAt: Date
}

export class Department extends AggregateRoot<string> {
  private _projectId: string
  private _name: string
  private _description: string
  private _mandate: string
  private _parentId: string | null
  private _createdAt: Date
  private _updatedAt: Date

  private constructor(id: string, props: DepartmentProps) {
    super(id)
    this._projectId = props.projectId
    this._name = props.name
    this._description = props.description
    this._mandate = props.mandate
    this._parentId = props.parentId
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
  get mandate() {
    return this._mandate
  }
  get parentId() {
    return this._parentId
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
    mandate: string
    parentId?: string | null
  }): Department {
    if (!props.name.trim()) {
      throw new Error('Department name cannot be empty')
    }
    const now = new Date()
    const dept = new Department(props.id, {
      projectId: props.projectId,
      name: props.name.trim(),
      description: props.description,
      mandate: props.mandate,
      parentId: props.parentId ?? null,
      createdAt: now,
      updatedAt: now,
    })
    dept.addDomainEvent({
      eventType: 'DepartmentCreated',
      occurredOn: now,
      aggregateId: props.id,
      payload: { projectId: props.projectId, name: props.name },
    })
    return dept
  }

  static reconstitute(id: string, props: DepartmentProps): Department {
    return new Department(id, props)
  }

  update(props: {
    name?: string
    description?: string
    mandate?: string
    parentId?: string | null
  }): void {
    if (props.name !== undefined) {
      if (!props.name.trim()) {
        throw new Error('Department name cannot be empty')
      }
      this._name = props.name.trim()
    }
    if (props.description !== undefined) {
      this._description = props.description
    }
    if (props.mandate !== undefined) {
      this._mandate = props.mandate
    }
    if (props.parentId !== undefined) {
      if (props.parentId === this.id) {
        throw new Error('Department cannot be its own parent')
      }
      this._parentId = props.parentId
    }
    this._updatedAt = new Date()
    this.addDomainEvent({
      eventType: 'DepartmentUpdated',
      occurredOn: this._updatedAt,
      aggregateId: this.id,
      payload: { name: this._name },
    })
  }
}
