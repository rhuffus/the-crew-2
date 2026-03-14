import type { ProjectDocumentDto } from '@the-crew/shared-types'
import type { ProjectDocument } from '../domain/project-document'

export class ProjectDocumentMapper {
  static toDto(doc: ProjectDocument): ProjectDocumentDto {
    return {
      id: doc.id,
      projectId: doc.projectId,
      slug: doc.slug,
      title: doc.title,
      bodyMarkdown: doc.bodyMarkdown,
      status: doc.status,
      linkedEntityIds: doc.linkedEntityIds,
      lastUpdatedBy: doc.lastUpdatedBy,
      sourceType: doc.sourceType,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    }
  }
}
