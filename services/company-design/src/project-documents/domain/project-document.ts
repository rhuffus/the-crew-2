import { AggregateRoot } from '@the-crew/domain-core'

export type DocumentStatus = 'draft' | 'review' | 'approved'
export type DocumentSourceType = 'user' | 'agent' | 'system'

export interface ProjectDocumentProps {
  projectId: string
  slug: string
  title: string
  bodyMarkdown: string
  status: DocumentStatus
  linkedEntityIds: string[]
  lastUpdatedBy: string
  sourceType: DocumentSourceType
  createdAt: Date
  updatedAt: Date
}

export class ProjectDocument extends AggregateRoot<string> {
  private _projectId: string
  private _slug: string
  private _title: string
  private _bodyMarkdown: string
  private _status: DocumentStatus
  private _linkedEntityIds: string[]
  private _lastUpdatedBy: string
  private _sourceType: DocumentSourceType
  private _createdAt: Date
  private _updatedAt: Date

  private constructor(id: string, props: ProjectDocumentProps) {
    super(id)
    this._projectId = props.projectId
    this._slug = props.slug
    this._title = props.title
    this._bodyMarkdown = props.bodyMarkdown
    this._status = props.status
    this._linkedEntityIds = [...props.linkedEntityIds]
    this._lastUpdatedBy = props.lastUpdatedBy
    this._sourceType = props.sourceType
    this._createdAt = props.createdAt
    this._updatedAt = props.updatedAt
  }

  get projectId() { return this._projectId }
  get slug() { return this._slug }
  get title() { return this._title }
  get bodyMarkdown() { return this._bodyMarkdown }
  get status() { return this._status }
  get linkedEntityIds(): string[] { return [...this._linkedEntityIds] }
  get lastUpdatedBy() { return this._lastUpdatedBy }
  get sourceType() { return this._sourceType }
  get createdAt() { return this._createdAt }
  get updatedAt() { return this._updatedAt }

  static create(props: {
    id: string
    projectId: string
    slug: string
    title: string
    bodyMarkdown?: string
    status?: DocumentStatus
    linkedEntityIds?: string[]
    lastUpdatedBy?: string
    sourceType?: DocumentSourceType
  }): ProjectDocument {
    if (!props.title.trim()) {
      throw new Error('ProjectDocument title cannot be empty')
    }
    if (!props.slug.trim()) {
      throw new Error('ProjectDocument slug cannot be empty')
    }

    const now = new Date()
    const doc = new ProjectDocument(props.id, {
      projectId: props.projectId,
      slug: props.slug.trim(),
      title: props.title.trim(),
      bodyMarkdown: props.bodyMarkdown ?? '',
      status: props.status ?? 'draft',
      linkedEntityIds: props.linkedEntityIds ?? [],
      lastUpdatedBy: props.lastUpdatedBy ?? 'system',
      sourceType: props.sourceType ?? 'system',
      createdAt: now,
      updatedAt: now,
    })

    doc.addDomainEvent({
      eventType: 'ProjectDocumentCreated',
      occurredOn: now,
      aggregateId: props.id,
      payload: { projectId: props.projectId, slug: props.slug, title: props.title },
    })

    return doc
  }

  static reconstitute(id: string, props: ProjectDocumentProps): ProjectDocument {
    return new ProjectDocument(id, props)
  }

  update(props: {
    title?: string
    bodyMarkdown?: string
    status?: DocumentStatus
    linkedEntityIds?: string[]
    lastUpdatedBy?: string
    sourceType?: DocumentSourceType
  }): void {
    if (props.title !== undefined) {
      if (!props.title.trim()) {
        throw new Error('ProjectDocument title cannot be empty')
      }
      this._title = props.title.trim()
    }
    if (props.bodyMarkdown !== undefined) {
      this._bodyMarkdown = props.bodyMarkdown
    }
    if (props.status !== undefined) {
      this._status = props.status
    }
    if (props.linkedEntityIds !== undefined) {
      this._linkedEntityIds = [...props.linkedEntityIds]
    }
    if (props.lastUpdatedBy !== undefined) {
      this._lastUpdatedBy = props.lastUpdatedBy
    }
    if (props.sourceType !== undefined) {
      this._sourceType = props.sourceType
    }

    this._updatedAt = new Date()

    this.addDomainEvent({
      eventType: 'ProjectDocumentUpdated',
      occurredOn: this._updatedAt,
      aggregateId: this.id,
      payload: { title: this._title, status: this._status },
    })
  }
}
