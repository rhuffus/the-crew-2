import { AggregateRoot, ValueObject } from '@the-crew/domain-core'

export type WorkflowStatus = 'draft' | 'active' | 'archived'
export type WorkflowParticipantType = 'role' | 'department'

const VALID_STATUSES: WorkflowStatus[] = ['draft', 'active', 'archived']
const VALID_PARTICIPANT_TYPES: WorkflowParticipantType[] = ['role', 'department']

// --- Value Objects ---

export interface WorkflowStageProps {
  name: string
  order: number
  description: string
}

export class WorkflowStage extends ValueObject<WorkflowStageProps> {
  get name() {
    return this.props.name
  }
  get order() {
    return this.props.order
  }
  get description() {
    return this.props.description
  }

  static create(props: WorkflowStageProps): WorkflowStage {
    if (!props.name.trim()) {
      throw new Error('Stage name cannot be empty')
    }
    if (!Number.isInteger(props.order) || props.order < 1) {
      throw new Error('Stage order must be a positive integer')
    }
    return new WorkflowStage({
      name: props.name.trim(),
      order: props.order,
      description: props.description,
    })
  }
}

export interface WorkflowParticipantProps {
  participantId: string
  participantType: WorkflowParticipantType
  responsibility: string
}

export class WorkflowParticipant extends ValueObject<WorkflowParticipantProps> {
  get participantId() {
    return this.props.participantId
  }
  get participantType() {
    return this.props.participantType
  }
  get responsibility() {
    return this.props.responsibility
  }

  static create(props: WorkflowParticipantProps): WorkflowParticipant {
    if (!props.participantId.trim()) {
      throw new Error('Participant ID cannot be empty')
    }
    if (!VALID_PARTICIPANT_TYPES.includes(props.participantType)) {
      throw new Error(`Invalid participant type: ${props.participantType}`)
    }
    if (!props.responsibility.trim()) {
      throw new Error('Participant responsibility cannot be empty')
    }
    return new WorkflowParticipant({
      participantId: props.participantId,
      participantType: props.participantType,
      responsibility: props.responsibility.trim(),
    })
  }
}

// --- Aggregate ---

export interface WorkflowProps {
  projectId: string
  name: string
  description: string
  ownerDepartmentId: string | null
  status: WorkflowStatus
  triggerDescription: string
  stages: WorkflowStage[]
  participants: WorkflowParticipant[]
  contractIds: string[]
  createdAt: Date
  updatedAt: Date
}

export class Workflow extends AggregateRoot<string> {
  private _projectId: string
  private _name: string
  private _description: string
  private _ownerDepartmentId: string | null
  private _status: WorkflowStatus
  private _triggerDescription: string
  private _stages: WorkflowStage[]
  private _participants: WorkflowParticipant[]
  private _contractIds: string[]
  private _createdAt: Date
  private _updatedAt: Date

  private constructor(id: string, props: WorkflowProps) {
    super(id)
    this._projectId = props.projectId
    this._name = props.name
    this._description = props.description
    this._ownerDepartmentId = props.ownerDepartmentId
    this._status = props.status
    this._triggerDescription = props.triggerDescription
    this._stages = [...props.stages]
    this._participants = [...props.participants]
    this._contractIds = [...props.contractIds]
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
  get status() {
    return this._status
  }
  get triggerDescription() {
    return this._triggerDescription
  }
  get stages(): readonly WorkflowStage[] {
    return [...this._stages]
  }
  get participants(): readonly WorkflowParticipant[] {
    return [...this._participants]
  }
  get contractIds(): readonly string[] {
    return [...this._contractIds]
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
    triggerDescription?: string
    stages?: WorkflowStageProps[]
    participants?: WorkflowParticipantProps[]
    contractIds?: string[]
  }): Workflow {
    if (!props.name.trim()) {
      throw new Error('Workflow name cannot be empty')
    }

    const stages = (props.stages ?? []).map(WorkflowStage.create)
    validateStageOrders(stages)

    const participants = (props.participants ?? []).map(WorkflowParticipant.create)
    validateParticipantUniqueness(participants)

    const contractIds = dedup(props.contractIds ?? [])

    const now = new Date()
    const workflow = new Workflow(props.id, {
      projectId: props.projectId,
      name: props.name.trim(),
      description: props.description,
      ownerDepartmentId: props.ownerDepartmentId ?? null,
      status: 'draft',
      triggerDescription: props.triggerDescription ?? '',
      stages,
      participants,
      contractIds,
      createdAt: now,
      updatedAt: now,
    })
    workflow.addDomainEvent({
      eventType: 'WorkflowCreated',
      occurredOn: now,
      aggregateId: props.id,
      payload: { projectId: props.projectId, name: props.name },
    })
    return workflow
  }

  static reconstitute(id: string, props: WorkflowProps): Workflow {
    return new Workflow(id, props)
  }

  update(props: {
    name?: string
    description?: string
    ownerDepartmentId?: string | null
    status?: WorkflowStatus
    triggerDescription?: string
    stages?: WorkflowStageProps[]
    participants?: WorkflowParticipantProps[]
    contractIds?: string[]
  }): void {
    if (props.name !== undefined) {
      if (!props.name.trim()) {
        throw new Error('Workflow name cannot be empty')
      }
      this._name = props.name.trim()
    }
    if (props.description !== undefined) {
      this._description = props.description
    }
    if (props.ownerDepartmentId !== undefined) {
      this._ownerDepartmentId = props.ownerDepartmentId
    }
    if (props.triggerDescription !== undefined) {
      this._triggerDescription = props.triggerDescription
    }
    if (props.stages !== undefined) {
      const stages = props.stages.map(WorkflowStage.create)
      validateStageOrders(stages)
      this._stages = stages
    }
    if (props.participants !== undefined) {
      const participants = props.participants.map(WorkflowParticipant.create)
      validateParticipantUniqueness(participants)
      this._participants = participants
    }
    if (props.contractIds !== undefined) {
      this._contractIds = dedup(props.contractIds)
    }

    // Status transition
    if (props.status !== undefined) {
      this._transitionStatus(props.status)
    }

    this._updatedAt = new Date()
    this.addDomainEvent({
      eventType: 'WorkflowUpdated',
      occurredOn: this._updatedAt,
      aggregateId: this.id,
      payload: { name: this._name },
    })
  }

  private _transitionStatus(newStatus: WorkflowStatus): void {
    if (!VALID_STATUSES.includes(newStatus)) {
      throw new Error(`Invalid workflow status: ${newStatus}`)
    }
    if (this._status === newStatus) return

    if (this._status === 'archived') {
      throw new Error('Cannot transition from archived status')
    }
    if (newStatus === 'active' && this._stages.length === 0) {
      throw new Error('Cannot activate a workflow with no stages')
    }
    this._status = newStatus
  }
}

// --- Helpers ---

function validateStageOrders(stages: WorkflowStage[]): void {
  const orders = stages.map((s) => s.order)
  if (new Set(orders).size !== orders.length) {
    throw new Error('Stage orders must be unique')
  }
}

function validateParticipantUniqueness(participants: WorkflowParticipant[]): void {
  const keys = participants.map((p) => `${p.participantType}:${p.participantId}`)
  if (new Set(keys).size !== keys.length) {
    throw new Error('Duplicate participant detected')
  }
}

function dedup(ids: string[]): string[] {
  return [...new Set(ids.filter(Boolean))]
}
