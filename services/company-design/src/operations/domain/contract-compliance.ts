import { Entity } from '@the-crew/domain-core'
import { randomUUID } from 'crypto'
import type { ComplianceStatus, CreateContractComplianceDto, UpdateContractComplianceDto } from '@the-crew/shared-types'

export interface ContractComplianceProps {
  id: string
  projectId: string
  contractId: string
  status: ComplianceStatus
  reason: string | null
  lastCheckedAt: Date
  createdAt: Date
  updatedAt: Date
}

export class ContractCompliance extends Entity<string> {
  readonly projectId: string
  readonly contractId: string
  private _status: ComplianceStatus
  private _reason: string | null
  private _lastCheckedAt: Date
  readonly createdAt: Date
  private _updatedAt: Date

  private constructor(props: ContractComplianceProps) {
    super(props.id)
    this.projectId = props.projectId
    this.contractId = props.contractId
    this._status = props.status
    this._reason = props.reason
    this._lastCheckedAt = props.lastCheckedAt
    this.createdAt = props.createdAt
    this._updatedAt = props.updatedAt
  }

  static create(projectId: string, dto: CreateContractComplianceDto): ContractCompliance {
    const now = new Date()
    return new ContractCompliance({
      id: randomUUID(),
      projectId,
      contractId: dto.contractId,
      status: dto.status,
      reason: dto.reason ?? null,
      lastCheckedAt: now,
      createdAt: now,
      updatedAt: now,
    })
  }

  static reconstitute(props: ContractComplianceProps): ContractCompliance {
    return new ContractCompliance(props)
  }

  get status(): ComplianceStatus { return this._status }
  get reason(): string | null { return this._reason }
  get lastCheckedAt(): Date { return this._lastCheckedAt }
  get updatedAt(): Date { return this._updatedAt }

  update(dto: UpdateContractComplianceDto): void {
    if (dto.status !== undefined) this._status = dto.status
    if (dto.reason !== undefined) this._reason = dto.reason
    this._lastCheckedAt = new Date()
    this._updatedAt = new Date()
  }
}
