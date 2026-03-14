import { Injectable } from '@nestjs/common'
import type { ProjectDocumentRepository } from '../domain/project-document-repository'
import type { ProjectDocument } from '../domain/project-document'

@Injectable()
export class InMemoryProjectDocumentRepository implements ProjectDocumentRepository {
  private readonly store = new Map<string, ProjectDocument>()

  async findById(id: string): Promise<ProjectDocument | null> {
    return this.store.get(id) ?? null
  }

  async findByProjectId(projectId: string): Promise<ProjectDocument[]> {
    return [...this.store.values()].filter((d) => d.projectId === projectId)
  }

  async findBySlug(projectId: string, slug: string): Promise<ProjectDocument | null> {
    return [...this.store.values()].find(
      (d) => d.projectId === projectId && d.slug === slug,
    ) ?? null
  }

  async save(doc: ProjectDocument): Promise<void> {
    this.store.set(doc.id, doc)
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id)
  }
}
