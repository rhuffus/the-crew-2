import { Entity } from '@the-crew/domain-core'
import { randomUUID } from 'crypto'
import type { NodeType, ReviewStatus, CreateReviewMarkerDto } from '@the-crew/shared-types'

export interface ReviewMarkerProps {
  id: string
  projectId: string
  entityId: string
  nodeType: NodeType
  status: ReviewStatus
  reviewerId: string
  reviewerName: string
  feedback: string | null
  createdAt: Date
  updatedAt: Date
}

export class ReviewMarker extends Entity<string> {
  readonly projectId: string
  readonly entityId: string
  readonly nodeType: NodeType
  private _status: ReviewStatus
  readonly reviewerId: string
  readonly reviewerName: string
  private _feedback: string | null
  readonly createdAt: Date
  private _updatedAt: Date

  private constructor(props: ReviewMarkerProps) {
    super(props.id)
    this.projectId = props.projectId
    this.entityId = props.entityId
    this.nodeType = props.nodeType
    this._status = props.status
    this.reviewerId = props.reviewerId
    this.reviewerName = props.reviewerName
    this._feedback = props.feedback
    this.createdAt = props.createdAt
    this._updatedAt = props.updatedAt
  }

  static create(projectId: string, dto: CreateReviewMarkerDto): ReviewMarker {
    const now = new Date()
    return new ReviewMarker({
      id: randomUUID(),
      projectId,
      entityId: dto.entityId,
      nodeType: dto.nodeType,
      status: dto.status,
      reviewerId: dto.reviewerId,
      reviewerName: dto.reviewerName,
      feedback: dto.feedback ?? null,
      createdAt: now,
      updatedAt: now,
    })
  }

  static reconstitute(props: ReviewMarkerProps): ReviewMarker {
    return new ReviewMarker(props)
  }

  get status(): ReviewStatus {
    return this._status
  }

  get feedback(): string | null {
    return this._feedback
  }

  get updatedAt(): Date {
    return this._updatedAt
  }

  update(dto: { status?: ReviewStatus; feedback?: string | null }): void {
    if (dto.status !== undefined) {
      this._status = dto.status
    }
    if (dto.feedback !== undefined) {
      this._feedback = dto.feedback
    }
    this._updatedAt = new Date()
  }
}
