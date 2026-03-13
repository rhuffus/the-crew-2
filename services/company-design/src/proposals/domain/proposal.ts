import { AggregateRoot } from '@the-crew/domain-core'

export type ProposalType =
  | 'create-department'
  | 'create-team'
  | 'create-specialist'
  | 'split-team'
  | 'merge-teams'
  | 'retire-unit'
  | 'revise-contract'
  | 'revise-workflow'
  | 'revise-policy'
  | 'update-constitution'

export type ProposalStatus =
  | 'draft'
  | 'proposed'
  | 'under-review'
  | 'approved'
  | 'rejected'
  | 'implemented'
  | 'superseded'

export const STRUCTURAL_PROPOSAL_TYPES: readonly ProposalType[] = [
  'create-department',
  'create-team',
  'create-specialist',
  'split-team',
  'merge-teams',
  'retire-unit',
]

export interface ProposalProps {
  projectId: string
  proposalType: ProposalType
  title: string
  description: string
  motivation: string
  problemDetected: string
  expectedBenefit: string
  estimatedCost: string
  contextToAssign: string
  affectedContractIds: string[]
  affectedWorkflowIds: string[]
  requiredApproval: string // ApproverLevel
  status: ProposalStatus
  proposedByAgentId: string
  reviewedByUserId: string | null
  approvedByUserId: string | null
  rejectionReason: string | null
  implementedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

const VALID_TRANSITIONS: Record<ProposalStatus, ProposalStatus[]> = {
  draft: ['proposed', 'superseded'],
  proposed: ['under-review', 'approved', 'rejected', 'superseded'],
  'under-review': ['approved', 'rejected', 'superseded'],
  approved: ['implemented', 'superseded'],
  rejected: ['superseded'],
  implemented: ['superseded'],
  superseded: [],
}

export class Proposal extends AggregateRoot<string> {
  private _projectId: string
  private _proposalType: ProposalType
  private _title: string
  private _description: string
  private _motivation: string
  private _problemDetected: string
  private _expectedBenefit: string
  private _estimatedCost: string
  private _contextToAssign: string
  private _affectedContractIds: string[]
  private _affectedWorkflowIds: string[]
  private _requiredApproval: string
  private _status: ProposalStatus
  private _proposedByAgentId: string
  private _reviewedByUserId: string | null
  private _approvedByUserId: string | null
  private _rejectionReason: string | null
  private _implementedAt: Date | null
  private _createdAt: Date
  private _updatedAt: Date

  private constructor(id: string, props: ProposalProps) {
    super(id)
    this._projectId = props.projectId
    this._proposalType = props.proposalType
    this._title = props.title
    this._description = props.description
    this._motivation = props.motivation
    this._problemDetected = props.problemDetected
    this._expectedBenefit = props.expectedBenefit
    this._estimatedCost = props.estimatedCost
    this._contextToAssign = props.contextToAssign
    this._affectedContractIds = [...props.affectedContractIds]
    this._affectedWorkflowIds = [...props.affectedWorkflowIds]
    this._requiredApproval = props.requiredApproval
    this._status = props.status
    this._proposedByAgentId = props.proposedByAgentId
    this._reviewedByUserId = props.reviewedByUserId
    this._approvedByUserId = props.approvedByUserId
    this._rejectionReason = props.rejectionReason
    this._implementedAt = props.implementedAt
    this._createdAt = props.createdAt
    this._updatedAt = props.updatedAt
  }

  get projectId() {
    return this._projectId
  }
  get proposalType() {
    return this._proposalType
  }
  get title() {
    return this._title
  }
  get description() {
    return this._description
  }
  get motivation() {
    return this._motivation
  }
  get problemDetected() {
    return this._problemDetected
  }
  get expectedBenefit() {
    return this._expectedBenefit
  }
  get estimatedCost() {
    return this._estimatedCost
  }
  get contextToAssign() {
    return this._contextToAssign
  }
  get affectedContractIds(): readonly string[] {
    return [...this._affectedContractIds]
  }
  get affectedWorkflowIds(): readonly string[] {
    return [...this._affectedWorkflowIds]
  }
  get requiredApproval() {
    return this._requiredApproval
  }
  get status() {
    return this._status
  }
  get proposedByAgentId() {
    return this._proposedByAgentId
  }
  get reviewedByUserId() {
    return this._reviewedByUserId
  }
  get approvedByUserId() {
    return this._approvedByUserId
  }
  get rejectionReason() {
    return this._rejectionReason
  }
  get implementedAt() {
    return this._implementedAt
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
    proposalType: ProposalType
    title: string
    description: string
    motivation: string
    problemDetected: string
    expectedBenefit: string
    estimatedCost?: string
    contextToAssign?: string
    affectedContractIds?: string[]
    affectedWorkflowIds?: string[]
    proposedByAgentId: string
    requiredApproval?: string
  }): Proposal {
    if (!props.title.trim()) {
      throw new Error('Proposal title cannot be empty')
    }
    if (!props.proposedByAgentId.trim()) {
      throw new Error('Proposal must have a proposedByAgentId')
    }
    const now = new Date()
    const proposal = new Proposal(props.id, {
      projectId: props.projectId,
      proposalType: props.proposalType,
      title: props.title.trim(),
      description: props.description,
      motivation: props.motivation,
      problemDetected: props.problemDetected,
      expectedBenefit: props.expectedBenefit,
      estimatedCost: props.estimatedCost ?? '',
      contextToAssign: props.contextToAssign ?? '',
      affectedContractIds: props.affectedContractIds ?? [],
      affectedWorkflowIds: props.affectedWorkflowIds ?? [],
      requiredApproval: props.requiredApproval ?? 'founder',
      status: 'draft',
      proposedByAgentId: props.proposedByAgentId,
      reviewedByUserId: null,
      approvedByUserId: null,
      rejectionReason: null,
      implementedAt: null,
      createdAt: now,
      updatedAt: now,
    })
    proposal.addDomainEvent({
      eventType: 'ProposalCreated',
      occurredOn: now,
      aggregateId: props.id,
      payload: {
        projectId: props.projectId,
        proposalType: props.proposalType,
        title: props.title,
        proposedByAgentId: props.proposedByAgentId,
      },
    })
    return proposal
  }

  static reconstitute(id: string, props: ProposalProps): Proposal {
    return new Proposal(id, props)
  }

  private transitionTo(newStatus: ProposalStatus): void {
    const allowed = VALID_TRANSITIONS[this._status]
    if (!allowed.includes(newStatus)) {
      throw new Error(`Cannot transition from '${this._status}' to '${newStatus}'`)
    }
    this._status = newStatus
    this._updatedAt = new Date()
  }

  submit(): void {
    this.transitionTo('proposed')
    this.addDomainEvent({
      eventType: 'ProposalSubmitted',
      occurredOn: this._updatedAt,
      aggregateId: this.id,
      payload: {},
    })
  }

  markUnderReview(reviewedByUserId: string): void {
    this.transitionTo('under-review')
    this._reviewedByUserId = reviewedByUserId
    this.addDomainEvent({
      eventType: 'ProposalUnderReview',
      occurredOn: this._updatedAt,
      aggregateId: this.id,
      payload: { reviewedByUserId },
    })
  }

  approve(approvedByUserId: string): void {
    if (this._requiredApproval === 'founder' && !approvedByUserId) {
      throw new Error('Founder approval requires approvedByUserId')
    }
    this.transitionTo('approved')
    this._approvedByUserId = approvedByUserId
    this.addDomainEvent({
      eventType: 'ProposalApproved',
      occurredOn: this._updatedAt,
      aggregateId: this.id,
      payload: { approvedByUserId },
    })
  }

  reject(rejectionReason: string): void {
    this.transitionTo('rejected')
    this._rejectionReason = rejectionReason
    this.addDomainEvent({
      eventType: 'ProposalRejected',
      occurredOn: this._updatedAt,
      aggregateId: this.id,
      payload: { rejectionReason },
    })
  }

  markImplemented(): void {
    this.transitionTo('implemented')
    this._implementedAt = new Date()
    this.addDomainEvent({
      eventType: 'ProposalImplemented',
      occurredOn: this._updatedAt,
      aggregateId: this.id,
      payload: { implementedAt: this._implementedAt.toISOString() },
    })
  }

  supersede(supersededById: string): void {
    this.transitionTo('superseded')
    this.addDomainEvent({
      eventType: 'ProposalSuperseded',
      occurredOn: this._updatedAt,
      aggregateId: this.id,
      payload: { supersededById },
    })
  }

  update(props: {
    title?: string
    description?: string
    motivation?: string
    problemDetected?: string
    expectedBenefit?: string
    estimatedCost?: string
    contextToAssign?: string
    affectedContractIds?: string[]
    affectedWorkflowIds?: string[]
  }): void {
    if (this._status !== 'draft' && this._status !== 'proposed') {
      throw new Error('Can only edit proposals in draft or proposed status')
    }
    if (props.title !== undefined) {
      if (!props.title.trim()) throw new Error('Proposal title cannot be empty')
      this._title = props.title.trim()
    }
    if (props.description !== undefined) this._description = props.description
    if (props.motivation !== undefined) this._motivation = props.motivation
    if (props.problemDetected !== undefined) this._problemDetected = props.problemDetected
    if (props.expectedBenefit !== undefined) this._expectedBenefit = props.expectedBenefit
    if (props.estimatedCost !== undefined) this._estimatedCost = props.estimatedCost
    if (props.contextToAssign !== undefined) this._contextToAssign = props.contextToAssign
    if (props.affectedContractIds !== undefined)
      this._affectedContractIds = [...props.affectedContractIds]
    if (props.affectedWorkflowIds !== undefined)
      this._affectedWorkflowIds = [...props.affectedWorkflowIds]
    this._updatedAt = new Date()
  }

  setRequiredApproval(level: string): void {
    this._requiredApproval = level
    this._updatedAt = new Date()
  }
}
