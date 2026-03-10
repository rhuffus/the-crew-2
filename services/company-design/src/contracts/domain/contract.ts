import { AggregateRoot } from '@the-crew/domain-core'

export type ContractType = 'SLA' | 'DataContract' | 'InterfaceContract' | 'OperationalAgreement'
export type ContractStatus = 'draft' | 'active' | 'deprecated'
export type PartyType = 'department' | 'capability'

const VALID_TYPES: ContractType[] = ['SLA', 'DataContract', 'InterfaceContract', 'OperationalAgreement']
const VALID_STATUSES: ContractStatus[] = ['draft', 'active', 'deprecated']
const VALID_PARTY_TYPES: PartyType[] = ['department', 'capability']

export interface ContractProps {
  projectId: string
  name: string
  description: string
  type: ContractType
  status: ContractStatus
  providerId: string
  providerType: PartyType
  consumerId: string
  consumerType: PartyType
  acceptanceCriteria: string[]
  createdAt: Date
  updatedAt: Date
}

export class Contract extends AggregateRoot<string> {
  private _projectId: string
  private _name: string
  private _description: string
  private _type: ContractType
  private _status: ContractStatus
  private _providerId: string
  private _providerType: PartyType
  private _consumerId: string
  private _consumerType: PartyType
  private _acceptanceCriteria: string[]
  private _createdAt: Date
  private _updatedAt: Date

  private constructor(id: string, props: ContractProps) {
    super(id)
    this._projectId = props.projectId
    this._name = props.name
    this._description = props.description
    this._type = props.type
    this._status = props.status
    this._providerId = props.providerId
    this._providerType = props.providerType
    this._consumerId = props.consumerId
    this._consumerType = props.consumerType
    this._acceptanceCriteria = [...props.acceptanceCriteria]
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
  get type() {
    return this._type
  }
  get status() {
    return this._status
  }
  get providerId() {
    return this._providerId
  }
  get providerType() {
    return this._providerType
  }
  get consumerId() {
    return this._consumerId
  }
  get consumerType() {
    return this._consumerType
  }
  get acceptanceCriteria(): readonly string[] {
    return [...this._acceptanceCriteria]
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
    type: ContractType
    providerId: string
    providerType: PartyType
    consumerId: string
    consumerType: PartyType
    acceptanceCriteria?: string[]
  }): Contract {
    if (!props.name.trim()) {
      throw new Error('Contract name cannot be empty')
    }
    if (!VALID_TYPES.includes(props.type)) {
      throw new Error(`Invalid contract type: ${props.type}`)
    }
    if (!VALID_PARTY_TYPES.includes(props.providerType)) {
      throw new Error(`Invalid provider type: ${props.providerType}`)
    }
    if (!VALID_PARTY_TYPES.includes(props.consumerType)) {
      throw new Error(`Invalid consumer type: ${props.consumerType}`)
    }
    if (props.providerId === props.consumerId && props.providerType === props.consumerType) {
      throw new Error('Provider and consumer cannot be the same party')
    }
    const now = new Date()
    const contract = new Contract(props.id, {
      projectId: props.projectId,
      name: props.name.trim(),
      description: props.description,
      type: props.type,
      status: 'draft',
      providerId: props.providerId,
      providerType: props.providerType,
      consumerId: props.consumerId,
      consumerType: props.consumerType,
      acceptanceCriteria: (props.acceptanceCriteria ?? []).map((s) => s.trim()).filter(Boolean),
      createdAt: now,
      updatedAt: now,
    })
    contract.addDomainEvent({
      eventType: 'ContractCreated',
      occurredOn: now,
      aggregateId: props.id,
      payload: { projectId: props.projectId, name: props.name, type: props.type },
    })
    return contract
  }

  static reconstitute(id: string, props: ContractProps): Contract {
    return new Contract(id, props)
  }

  update(props: {
    name?: string
    description?: string
    type?: ContractType
    status?: ContractStatus
    providerId?: string
    providerType?: PartyType
    consumerId?: string
    consumerType?: PartyType
    acceptanceCriteria?: string[]
  }): void {
    if (props.name !== undefined) {
      if (!props.name.trim()) {
        throw new Error('Contract name cannot be empty')
      }
      this._name = props.name.trim()
    }
    if (props.description !== undefined) {
      this._description = props.description
    }
    if (props.type !== undefined) {
      if (!VALID_TYPES.includes(props.type)) {
        throw new Error(`Invalid contract type: ${props.type}`)
      }
      this._type = props.type
    }
    if (props.status !== undefined) {
      if (!VALID_STATUSES.includes(props.status)) {
        throw new Error(`Invalid contract status: ${props.status}`)
      }
      this._status = props.status
    }
    if (props.providerType !== undefined) {
      if (!VALID_PARTY_TYPES.includes(props.providerType)) {
        throw new Error(`Invalid provider type: ${props.providerType}`)
      }
      this._providerType = props.providerType
    }
    if (props.consumerType !== undefined) {
      if (!VALID_PARTY_TYPES.includes(props.consumerType)) {
        throw new Error(`Invalid consumer type: ${props.consumerType}`)
      }
      this._consumerType = props.consumerType
    }
    if (props.providerId !== undefined) {
      this._providerId = props.providerId
    }
    if (props.consumerId !== undefined) {
      this._consumerId = props.consumerId
    }
    const pId = props.providerId ?? this._providerId
    const pType = props.providerType ?? this._providerType
    const cId = props.consumerId ?? this._consumerId
    const cType = props.consumerType ?? this._consumerType
    if (pId === cId && pType === cType) {
      throw new Error('Provider and consumer cannot be the same party')
    }
    if (props.acceptanceCriteria !== undefined) {
      this._acceptanceCriteria = props.acceptanceCriteria.map((s) => s.trim()).filter(Boolean)
    }
    this._updatedAt = new Date()
    this.addDomainEvent({
      eventType: 'ContractUpdated',
      occurredOn: this._updatedAt,
      aggregateId: this.id,
      payload: { name: this._name },
    })
  }
}
