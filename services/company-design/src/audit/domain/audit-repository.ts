import type { AuditEntry } from './audit-entry'

export interface AuditRepository {
  save(entry: AuditEntry): Promise<void>
  findByProjectId(projectId: string): Promise<AuditEntry[]>
  findByEntity(projectId: string, entityType: string, entityId: string): Promise<AuditEntry[]>
}

export const AUDIT_REPOSITORY = Symbol('AUDIT_REPOSITORY')
