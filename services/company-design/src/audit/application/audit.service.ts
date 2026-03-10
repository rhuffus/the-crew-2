import { Inject, Injectable } from '@nestjs/common'
import type { AuditAction, AuditEntryDto } from '@the-crew/shared-types'
import { AuditEntry } from '../domain/audit-entry'
import { AUDIT_REPOSITORY, type AuditRepository } from '../domain/audit-repository'
import { AuditMapper } from './audit.mapper'

export interface RecordAuditInput {
  projectId: string
  entityType: string
  entityId: string
  entityName: string
  action: AuditAction
  changes?: Record<string, unknown> | null
}

@Injectable()
export class AuditService {
  constructor(
    @Inject(AUDIT_REPOSITORY) private readonly repo: AuditRepository,
  ) {}

  async record(input: RecordAuditInput): Promise<AuditEntryDto> {
    const entry = AuditEntry.create({
      id: crypto.randomUUID(),
      projectId: input.projectId,
      entityType: input.entityType,
      entityId: input.entityId,
      entityName: input.entityName,
      action: input.action,
      changes: input.changes ?? null,
      timestamp: new Date(),
    })
    await this.repo.save(entry)
    return AuditMapper.toDto(entry)
  }

  async listByProject(projectId: string): Promise<AuditEntryDto[]> {
    const entries = await this.repo.findByProjectId(projectId)
    return entries.map(AuditMapper.toDto)
  }

  async listByEntity(projectId: string, entityType: string, entityId: string): Promise<AuditEntryDto[]> {
    const entries = await this.repo.findByEntity(projectId, entityType, entityId)
    return entries.map(AuditMapper.toDto)
  }
}
