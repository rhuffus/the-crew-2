import { Entity } from '@the-crew/domain-core'
import { randomUUID } from 'crypto'
import type { NodeType, IncidentSeverity, IncidentStatus, CreateIncidentDto, UpdateIncidentDto } from '@the-crew/shared-types'

export interface IncidentProps {
  id: string
  projectId: string
  entityType: NodeType
  entityId: string
  severity: IncidentSeverity
  status: IncidentStatus
  title: string
  description: string
  reportedAt: Date
  resolvedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export class Incident extends Entity<string> {
  readonly projectId: string
  readonly entityType: NodeType
  readonly entityId: string
  private _severity: IncidentSeverity
  private _status: IncidentStatus
  readonly title: string
  private _description: string
  readonly reportedAt: Date
  private _resolvedAt: Date | null
  readonly createdAt: Date
  private _updatedAt: Date

  private constructor(props: IncidentProps) {
    super(props.id)
    this.projectId = props.projectId
    this.entityType = props.entityType
    this.entityId = props.entityId
    this._severity = props.severity
    this._status = props.status
    this.title = props.title
    this._description = props.description
    this.reportedAt = props.reportedAt
    this._resolvedAt = props.resolvedAt
    this.createdAt = props.createdAt
    this._updatedAt = props.updatedAt
  }

  static create(projectId: string, dto: CreateIncidentDto): Incident {
    const now = new Date()
    return new Incident({
      id: randomUUID(),
      projectId,
      entityType: dto.entityType,
      entityId: dto.entityId,
      severity: dto.severity,
      status: 'open',
      title: dto.title,
      description: dto.description,
      reportedAt: now,
      resolvedAt: null,
      createdAt: now,
      updatedAt: now,
    })
  }

  static reconstitute(props: IncidentProps): Incident {
    return new Incident(props)
  }

  get severity(): IncidentSeverity { return this._severity }
  get status(): IncidentStatus { return this._status }
  get description(): string { return this._description }
  get resolvedAt(): Date | null { return this._resolvedAt }
  get updatedAt(): Date { return this._updatedAt }

  update(dto: UpdateIncidentDto): void {
    if (dto.severity !== undefined) this._severity = dto.severity
    if (dto.status !== undefined) this._status = dto.status
    if (dto.description !== undefined) this._description = dto.description
    this._updatedAt = new Date()
  }

  resolve(): void {
    this._status = 'resolved'
    this._resolvedAt = new Date()
    this._updatedAt = new Date()
  }
}
