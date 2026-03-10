import { AggregateRoot } from '@the-crew/domain-core'

export interface CapabilityProps {
  projectId: string
  name: string
  description: string
  ownerDepartmentId: string | null
  inputs: string[]
  outputs: string[]
  createdAt: Date
  updatedAt: Date
}

export class Capability extends AggregateRoot<string> {
  private _projectId: string
  private _name: string
  private _description: string
  private _ownerDepartmentId: string | null
  private _inputs: string[]
  private _outputs: string[]
  private _createdAt: Date
  private _updatedAt: Date

  private constructor(id: string, props: CapabilityProps) {
    super(id)
    this._projectId = props.projectId
    this._name = props.name
    this._description = props.description
    this._ownerDepartmentId = props.ownerDepartmentId
    this._inputs = [...props.inputs]
    this._outputs = [...props.outputs]
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
  get ownerDepartmentId() {
    return this._ownerDepartmentId
  }
  get inputs(): readonly string[] {
    return [...this._inputs]
  }
  get outputs(): readonly string[] {
    return [...this._outputs]
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
    ownerDepartmentId?: string | null
    inputs?: string[]
    outputs?: string[]
  }): Capability {
    if (!props.name.trim()) {
      throw new Error('Capability name cannot be empty')
    }
    const now = new Date()
    const cap = new Capability(props.id, {
      projectId: props.projectId,
      name: props.name.trim(),
      description: props.description,
      ownerDepartmentId: props.ownerDepartmentId ?? null,
      inputs: (props.inputs ?? []).map((s) => s.trim()).filter(Boolean),
      outputs: (props.outputs ?? []).map((s) => s.trim()).filter(Boolean),
      createdAt: now,
      updatedAt: now,
    })
    cap.addDomainEvent({
      eventType: 'CapabilityCreated',
      occurredOn: now,
      aggregateId: props.id,
      payload: { projectId: props.projectId, name: props.name },
    })
    return cap
  }

  static reconstitute(id: string, props: CapabilityProps): Capability {
    return new Capability(id, props)
  }

  update(props: {
    name?: string
    description?: string
    ownerDepartmentId?: string | null
    inputs?: string[]
    outputs?: string[]
  }): void {
    if (props.name !== undefined) {
      if (!props.name.trim()) {
        throw new Error('Capability name cannot be empty')
      }
      this._name = props.name.trim()
    }
    if (props.description !== undefined) {
      this._description = props.description
    }
    if (props.ownerDepartmentId !== undefined) {
      this._ownerDepartmentId = props.ownerDepartmentId
    }
    if (props.inputs !== undefined) {
      this._inputs = props.inputs.map((s) => s.trim()).filter(Boolean)
    }
    if (props.outputs !== undefined) {
      this._outputs = props.outputs.map((s) => s.trim()).filter(Boolean)
    }
    this._updatedAt = new Date()
    this.addDomainEvent({
      eventType: 'CapabilityUpdated',
      occurredOn: this._updatedAt,
      aggregateId: this.id,
      payload: { name: this._name },
    })
  }
}
