import type { ReleaseDto } from '@the-crew/shared-types'
import type { Release } from '../domain/release'

export class ReleaseMapper {
  static toDto(release: Release): ReleaseDto {
    return {
      id: release.id,
      projectId: release.projectId,
      version: release.version,
      status: release.status,
      notes: release.notes,
      snapshot: release.snapshot,
      validationIssues: release.validationIssues,
      createdAt: release.createdAt.toISOString(),
      updatedAt: release.updatedAt.toISOString(),
      publishedAt: release.publishedAt?.toISOString() ?? null,
    }
  }
}
