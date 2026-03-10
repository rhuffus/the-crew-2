import { AggregateRoot } from '@the-crew/domain-core'

export type PolicyScope = 'global' | 'department'
export type PolicyType = 'approval-gate' | 'constraint' | 'rule'
export type PolicyEnforcement = 'mandatory' | 'advisory'
export type PolicyStatus = 'active' | 'inactive'

const VALID_SCOPES: PolicyScope[] = ['global', 'department']
const VALID_TYPES: PolicyType[] = ['approval-gate', 'constraint', 'rule']
const VALID_ENFORCEMENTS: PolicyEnforcement[] = ['mandatory', 'advisory']
const VALID_STATUSES: PolicyStatus[] = ['active', 'inactive']

export interface PolicyProps {
  projectId: string
  name: string
  description: string
  scope: PolicyScope
  departmentId: string | null
  type: PolicyType
  condition: string
  enforcement: PolicyEnforcement
  status: PolicyStatus
  createdAt: Date
  updatedAt: Date
}

export class Policy extends AggregateRoot<string> {
  private _projectId: string
  private _name: string
  private _description: string
  private _scope: PolicyScope
  private _departmentId: string | null
  private _type: PolicyType
  private _condition: string
  private _enforcement: PolicyEnforcement
  private _status: PolicyStatus
  private _createdAt: Date
  private _updatedAt: Date

  private constructor(id: string, props: PolicyProps) {
    super(id)
    this._projectId = props.projectId
    this._name = props.name
    this._description = props.description
    this._scope = props.scope
    this._departmentId = props.departmentId
    this._type = props.type
    this._condition = props.condition
    this._enforcement = props.enforcement
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
  get scope() {
    return this._scope
  }
  get departmentId() {
    return this._departmentId
  }
  get type() {
    return this._type
  }
  get condition() {
    return this._condition
  }
  get enforcement() {
    return this._enforcement
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
    scope: PolicyScope
    departmentId?: string | null
    type: PolicyType
    condition: string
    enforcement: PolicyEnforcement
  }): Policy {
    if (!props.name.trim()) {
      throw new Error('Policy name cannot be empty')
    }
    if (!VALID_SCOPES.includes(props.scope)) {
      throw new Error(`Invalid policy scope: ${props.scope}`)
    }
    if (!VALID_TYPES.includes(props.type)) {
      throw new Error(`Invalid policy type: ${props.type}`)
    }
    if (!VALID_ENFORCEMENTS.includes(props.enforcement)) {
      throw new Error(`Invalid policy enforcement: ${props.enforcement}`)
    }
    if (!props.condition.trim()) {
      throw new Error('Policy condition cannot be empty')
    }
    const departmentId = props.departmentId ?? null
    if (props.scope === 'department' && !departmentId) {
      throw new Error('Department ID is required for department-scoped policies')
    }
    if (props.scope === 'global' && departmentId) {
      throw new Error('Department ID must not be set for global policies')
    }

    const now = new Date()
    const policy = new Policy(props.id, {
      projectId: props.projectId,
      name: props.name.trim(),
      description: props.description,
      scope: props.scope,
      departmentId,
      type: props.type,
      condition: props.condition.trim(),
      enforcement: props.enforcement,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    })
    policy.addDomainEvent({
      eventType: 'PolicyCreated',
      occurredOn: now,
      aggregateId: props.id,
      payload: { projectId: props.projectId, name: props.name, type: props.type },
    })
    return policy
  }

  static reconstitute(id: string, props: PolicyProps): Policy {
    return new Policy(id, props)
  }

  update(props: {
    name?: string
    description?: string
    scope?: PolicyScope
    departmentId?: string | null
    type?: PolicyType
    condition?: string
    enforcement?: PolicyEnforcement
    status?: PolicyStatus
  }): void {
    if (props.name !== undefined) {
      if (!props.name.trim()) {
        throw new Error('Policy name cannot be empty')
      }
      this._name = props.name.trim()
    }
    if (props.description !== undefined) {
      this._description = props.description
    }
    if (props.type !== undefined) {
      if (!VALID_TYPES.includes(props.type)) {
        throw new Error(`Invalid policy type: ${props.type}`)
      }
      this._type = props.type
    }
    if (props.enforcement !== undefined) {
      if (!VALID_ENFORCEMENTS.includes(props.enforcement)) {
        throw new Error(`Invalid policy enforcement: ${props.enforcement}`)
      }
      this._enforcement = props.enforcement
    }
    if (props.condition !== undefined) {
      if (!props.condition.trim()) {
        throw new Error('Policy condition cannot be empty')
      }
      this._condition = props.condition.trim()
    }
    if (props.status !== undefined) {
      if (!VALID_STATUSES.includes(props.status)) {
        throw new Error(`Invalid policy status: ${props.status}`)
      }
      this._status = props.status
    }

    // Scope + departmentId must be validated together
    const newScope = props.scope ?? this._scope
    const newDeptId = props.departmentId !== undefined ? props.departmentId : this._departmentId
    if (props.scope !== undefined) {
      if (!VALID_SCOPES.includes(props.scope)) {
        throw new Error(`Invalid policy scope: ${props.scope}`)
      }
    }
    if (newScope === 'department' && !newDeptId) {
      throw new Error('Department ID is required for department-scoped policies')
    }
    if (newScope === 'global' && newDeptId) {
      throw new Error('Department ID must not be set for global policies')
    }
    this._scope = newScope
    this._departmentId = newDeptId

    this._updatedAt = new Date()
    this.addDomainEvent({
      eventType: 'PolicyUpdated',
      occurredOn: this._updatedAt,
      aggregateId: this.id,
      payload: { name: this._name },
    })
  }
}
