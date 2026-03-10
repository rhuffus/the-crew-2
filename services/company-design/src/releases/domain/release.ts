import { AggregateRoot } from '@the-crew/domain-core'
import type { ReleaseSnapshotDto, ValidationIssue } from '@the-crew/shared-types'

export type ReleaseStatus = 'draft' | 'published'

export interface ReleaseProps {
  projectId: string
  version: string
  status: ReleaseStatus
  notes: string
  snapshot: ReleaseSnapshotDto | null
  validationIssues: ValidationIssue[]
  createdAt: Date
  updatedAt: Date
  publishedAt: Date | null
}

export class Release extends AggregateRoot<string> {
  private _projectId: string
  private _version: string
  private _status: ReleaseStatus
  private _notes: string
  private _snapshot: ReleaseSnapshotDto | null
  private _validationIssues: ValidationIssue[]
  private _createdAt: Date
  private _updatedAt: Date
  private _publishedAt: Date | null

  private constructor(id: string, props: ReleaseProps) {
    super(id)
    this._projectId = props.projectId
    this._version = props.version
    this._status = props.status
    this._notes = props.notes
    this._snapshot = props.snapshot
    this._validationIssues = props.validationIssues
    this._createdAt = props.createdAt
    this._updatedAt = props.updatedAt
    this._publishedAt = props.publishedAt
  }

  get projectId() {
    return this._projectId
  }
  get version() {
    return this._version
  }
  get status() {
    return this._status
  }
  get notes() {
    return this._notes
  }
  get snapshot() {
    return this._snapshot
  }
  get validationIssues() {
    return this._validationIssues
  }
  get createdAt() {
    return this._createdAt
  }
  get updatedAt() {
    return this._updatedAt
  }
  get publishedAt() {
    return this._publishedAt
  }

  static create(props: {
    id: string
    projectId: string
    version: string
    notes?: string
  }): Release {
    if (!props.version.trim()) {
      throw new Error('Release version cannot be empty')
    }

    const now = new Date()
    const release = new Release(props.id, {
      projectId: props.projectId,
      version: props.version.trim(),
      status: 'draft',
      notes: props.notes?.trim() ?? '',
      snapshot: null,
      validationIssues: [],
      createdAt: now,
      updatedAt: now,
      publishedAt: null,
    })
    release.addDomainEvent({
      eventType: 'ReleaseCreated',
      occurredOn: now,
      aggregateId: props.id,
      payload: { projectId: props.projectId, version: props.version },
    })
    return release
  }

  static reconstitute(id: string, props: ReleaseProps): Release {
    return new Release(id, props)
  }

  update(props: { version?: string; notes?: string }): void {
    if (this._status === 'published') {
      throw new Error('Cannot update a published release')
    }
    if (props.version !== undefined) {
      if (!props.version.trim()) {
        throw new Error('Release version cannot be empty')
      }
      this._version = props.version.trim()
    }
    if (props.notes !== undefined) {
      this._notes = props.notes.trim()
    }
    this._updatedAt = new Date()
    this.addDomainEvent({
      eventType: 'ReleaseUpdated',
      occurredOn: this._updatedAt,
      aggregateId: this.id,
      payload: { version: this._version },
    })
  }

  publish(snapshot: ReleaseSnapshotDto, validationIssues: ValidationIssue[]): void {
    if (this._status === 'published') {
      throw new Error('Release is already published')
    }
    const errors = validationIssues.filter((i) => i.severity === 'error')
    if (errors.length > 0) {
      throw new Error(
        `Cannot publish release with ${errors.length} validation error(s): ${errors.map((e) => e.message).join('; ')}`,
      )
    }
    const now = new Date()
    this._status = 'published'
    this._snapshot = snapshot
    this._validationIssues = validationIssues
    this._publishedAt = now
    this._updatedAt = now
    this.addDomainEvent({
      eventType: 'ReleasePublished',
      occurredOn: now,
      aggregateId: this.id,
      payload: { projectId: this._projectId, version: this._version },
    })
  }
}
