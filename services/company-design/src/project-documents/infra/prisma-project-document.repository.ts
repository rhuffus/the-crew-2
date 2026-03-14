import { Injectable } from '@nestjs/common'
import { CompanyDesignPrismaService } from '../../prisma/company-design-prisma.service'
import type { ProjectDocumentRepository } from '../domain/project-document-repository'
import { ProjectDocument } from '../domain/project-document'
import type { DocumentStatus, DocumentSourceType } from '../domain/project-document'

@Injectable()
export class PrismaProjectDocumentRepository implements ProjectDocumentRepository {
  constructor(private readonly prisma: CompanyDesignPrismaService) {}

  async findById(id: string): Promise<ProjectDocument | null> {
    const row = await this.prisma.projectDocument.findUnique({ where: { id } })
    return row ? this.toDomain(row) : null
  }

  async findByProjectId(projectId: string): Promise<ProjectDocument[]> {
    const rows = await this.prisma.projectDocument.findMany({ where: { projectId } })
    return rows.map((row) => this.toDomain(row))
  }

  async findBySlug(projectId: string, slug: string): Promise<ProjectDocument | null> {
    const row = await this.prisma.projectDocument.findFirst({
      where: { projectId, slug },
    })
    return row ? this.toDomain(row) : null
  }

  async save(doc: ProjectDocument): Promise<void> {
    const data = {
      projectId: doc.projectId,
      slug: doc.slug,
      title: doc.title,
      bodyMarkdown: doc.bodyMarkdown,
      status: doc.status,
      linkedEntityIds: doc.linkedEntityIds as string[],
      lastUpdatedBy: doc.lastUpdatedBy,
      sourceType: doc.sourceType,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }
    await this.prisma.projectDocument.upsert({
      where: { id: doc.id },
      create: { id: doc.id, ...data },
      update: data,
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.projectDocument.delete({ where: { id } })
  }

  private toDomain(row: {
    id: string
    projectId: string
    slug: string
    title: string
    bodyMarkdown: string
    status: string
    linkedEntityIds: string[]
    lastUpdatedBy: string
    sourceType: string
    createdAt: Date
    updatedAt: Date
  }): ProjectDocument {
    return ProjectDocument.reconstitute(row.id, {
      projectId: row.projectId,
      slug: row.slug,
      title: row.title,
      bodyMarkdown: row.bodyMarkdown,
      status: row.status as DocumentStatus,
      linkedEntityIds: [...row.linkedEntityIds],
      lastUpdatedBy: row.lastUpdatedBy,
      sourceType: row.sourceType as DocumentSourceType,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }
}
