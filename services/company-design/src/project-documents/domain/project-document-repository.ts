import type { Repository } from '@the-crew/domain-core'
import type { ProjectDocument } from './project-document'

export interface ProjectDocumentRepository extends Repository<ProjectDocument, string> {
  findByProjectId(projectId: string): Promise<ProjectDocument[]>
  findBySlug(projectId: string, slug: string): Promise<ProjectDocument | null>
}

export const PROJECT_DOCUMENT_REPOSITORY = Symbol('PROJECT_DOCUMENT_REPOSITORY')
