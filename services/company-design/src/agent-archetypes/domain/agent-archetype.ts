import { AggregateRoot } from '@the-crew/domain-core'

export interface AgentArchetypeConstraints {
  maxConcurrency: number | null
  allowedDepartmentIds: string[]
}

export interface AgentArchetypeProps {
  projectId: string
  name: string
  description: string
  roleId: string
  departmentId: string
  skillIds: string[]
  constraints: AgentArchetypeConstraints
  createdAt: Date
  updatedAt: Date
}

export class AgentArchetype extends AggregateRoot<string> {
  private _projectId: string
  private _name: string
  private _description: string
  private _roleId: string
  private _departmentId: string
  private _skillIds: string[]
  private _constraints: AgentArchetypeConstraints
  private _createdAt: Date
  private _updatedAt: Date

  private constructor(id: string, props: AgentArchetypeProps) {
    super(id)
    this._projectId = props.projectId
    this._name = props.name
    this._description = props.description
    this._roleId = props.roleId
    this._departmentId = props.departmentId
    this._skillIds = props.skillIds
    this._constraints = props.constraints
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
  get roleId() {
    return this._roleId
  }
  get departmentId() {
    return this._departmentId
  }
  get skillIds(): string[] {
    return [...this._skillIds]
  }
  get constraints(): AgentArchetypeConstraints {
    return {
      maxConcurrency: this._constraints.maxConcurrency,
      allowedDepartmentIds: [...this._constraints.allowedDepartmentIds],
    }
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
    roleId: string
    departmentId: string
    skillIds?: string[]
    constraints?: Partial<AgentArchetypeConstraints>
  }): AgentArchetype {
    if (!props.name.trim()) {
      throw new Error('Agent archetype name cannot be empty')
    }
    if (!props.roleId.trim()) {
      throw new Error('Agent archetype must have a role')
    }
    if (!props.departmentId.trim()) {
      throw new Error('Agent archetype must belong to a department')
    }
    const now = new Date()
    const archetype = new AgentArchetype(props.id, {
      projectId: props.projectId,
      name: props.name.trim(),
      description: props.description,
      roleId: props.roleId,
      departmentId: props.departmentId,
      skillIds: (props.skillIds ?? []).filter(Boolean),
      constraints: {
        maxConcurrency: props.constraints?.maxConcurrency ?? null,
        allowedDepartmentIds: (props.constraints?.allowedDepartmentIds ?? []).filter(Boolean),
      },
      createdAt: now,
      updatedAt: now,
    })
    archetype.addDomainEvent({
      eventType: 'AgentArchetypeCreated',
      occurredOn: now,
      aggregateId: props.id,
      payload: { projectId: props.projectId, name: props.name },
    })
    return archetype
  }

  static reconstitute(id: string, props: AgentArchetypeProps): AgentArchetype {
    return new AgentArchetype(id, props)
  }

  update(props: {
    name?: string
    description?: string
    roleId?: string
    departmentId?: string
    skillIds?: string[]
    constraints?: Partial<AgentArchetypeConstraints>
  }): void {
    if (props.name !== undefined) {
      if (!props.name.trim()) {
        throw new Error('Agent archetype name cannot be empty')
      }
      this._name = props.name.trim()
    }
    if (props.description !== undefined) {
      this._description = props.description
    }
    if (props.roleId !== undefined) {
      if (!props.roleId.trim()) {
        throw new Error('Agent archetype must have a role')
      }
      this._roleId = props.roleId
    }
    if (props.departmentId !== undefined) {
      if (!props.departmentId.trim()) {
        throw new Error('Agent archetype must belong to a department')
      }
      this._departmentId = props.departmentId
    }
    if (props.skillIds !== undefined) {
      this._skillIds = props.skillIds.filter(Boolean)
    }
    if (props.constraints !== undefined) {
      this._constraints = {
        maxConcurrency: props.constraints.maxConcurrency !== undefined
          ? props.constraints.maxConcurrency
          : this._constraints.maxConcurrency,
        allowedDepartmentIds: props.constraints.allowedDepartmentIds !== undefined
          ? props.constraints.allowedDepartmentIds.filter(Boolean)
          : [...this._constraints.allowedDepartmentIds],
      }
    }
    this._updatedAt = new Date()
    this.addDomainEvent({
      eventType: 'AgentArchetypeUpdated',
      occurredOn: this._updatedAt,
      aggregateId: this.id,
      payload: { name: this._name },
    })
  }
}
