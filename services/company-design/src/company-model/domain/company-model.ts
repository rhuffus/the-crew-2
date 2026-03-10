import { AggregateRoot } from '@the-crew/domain-core'

export interface CompanyModelProps {
  purpose: string
  type: string
  scope: string
  principles: string[]
  updatedAt: Date
}

export class CompanyModel extends AggregateRoot<string> {
  private _purpose: string
  private _type: string
  private _scope: string
  private _principles: string[]
  private _updatedAt: Date

  private constructor(projectId: string, props: CompanyModelProps) {
    super(projectId)
    this._purpose = props.purpose
    this._type = props.type
    this._scope = props.scope
    this._principles = [...props.principles]
    this._updatedAt = props.updatedAt
  }

  get projectId() {
    return this.id
  }
  get purpose() {
    return this._purpose
  }
  get type() {
    return this._type
  }
  get scope() {
    return this._scope
  }
  get principles(): readonly string[] {
    return [...this._principles]
  }
  get updatedAt() {
    return this._updatedAt
  }

  static createEmpty(projectId: string): CompanyModel {
    const model = new CompanyModel(projectId, {
      purpose: '',
      type: '',
      scope: '',
      principles: [],
      updatedAt: new Date(),
    })
    model.addDomainEvent({
      eventType: 'CompanyModelCreated',
      occurredOn: model._updatedAt,
      aggregateId: projectId,
      payload: {},
    })
    return model
  }

  static reconstitute(projectId: string, props: CompanyModelProps): CompanyModel {
    return new CompanyModel(projectId, props)
  }

  update(props: {
    purpose?: string
    type?: string
    scope?: string
    principles?: string[]
  }): void {
    if (props.purpose !== undefined) {
      this._purpose = props.purpose.trim()
    }
    if (props.type !== undefined) {
      this._type = props.type.trim()
    }
    if (props.scope !== undefined) {
      this._scope = props.scope.trim()
    }
    if (props.principles !== undefined) {
      this._principles = props.principles.map((p) => p.trim()).filter(Boolean)
    }
    this._updatedAt = new Date()
    this.addDomainEvent({
      eventType: 'CompanyModelUpdated',
      occurredOn: this._updatedAt,
      aggregateId: this.id,
      payload: {
        purpose: this._purpose,
        type: this._type,
        scope: this._scope,
        principles: this._principles,
      },
    })
  }
}
