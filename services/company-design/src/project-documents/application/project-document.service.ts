import { Inject, Injectable, NotFoundException, ConflictException, Optional } from '@nestjs/common'
import type { CreateProjectDocumentDto, UpdateProjectDocumentDto, ProjectDocumentDto } from '@the-crew/shared-types'
import { ProjectDocument } from '../domain/project-document'
import { PROJECT_DOCUMENT_REPOSITORY, type ProjectDocumentRepository } from '../domain/project-document-repository'
import { ProjectDocumentMapper } from './project-document.mapper'
import { AuditService } from '../../audit/application/audit.service'

@Injectable()
export class ProjectDocumentService {
  constructor(
    @Inject(PROJECT_DOCUMENT_REPOSITORY) private readonly repo: ProjectDocumentRepository,
    @Optional() private readonly auditService?: AuditService,
  ) {}

  async list(projectId: string): Promise<ProjectDocumentDto[]> {
    const docs = await this.repo.findByProjectId(projectId)
    return docs.map(ProjectDocumentMapper.toDto)
  }

  async get(id: string): Promise<ProjectDocumentDto> {
    const doc = await this.repo.findById(id)
    if (!doc) throw new NotFoundException(`ProjectDocument ${id} not found`)
    return ProjectDocumentMapper.toDto(doc)
  }

  async getBySlug(projectId: string, slug: string): Promise<ProjectDocumentDto> {
    const doc = await this.repo.findBySlug(projectId, slug)
    if (!doc) throw new NotFoundException(`ProjectDocument with slug '${slug}' not found`)
    return ProjectDocumentMapper.toDto(doc)
  }

  async create(projectId: string, dto: CreateProjectDocumentDto): Promise<ProjectDocumentDto> {
    const existing = await this.repo.findBySlug(projectId, dto.slug)
    if (existing) {
      throw new ConflictException(`ProjectDocument with slug '${dto.slug}' already exists`)
    }

    const id = crypto.randomUUID()
    const doc = ProjectDocument.create({
      id,
      projectId,
      slug: dto.slug,
      title: dto.title,
      bodyMarkdown: dto.bodyMarkdown,
      status: dto.status,
      linkedEntityIds: dto.linkedEntityIds,
      lastUpdatedBy: dto.lastUpdatedBy,
      sourceType: dto.sourceType,
    })
    await this.repo.save(doc)

    const result = ProjectDocumentMapper.toDto(doc)
    await this.auditService?.record({
      projectId,
      entityType: 'project-document',
      entityId: result.id,
      entityName: result.title,
      action: 'created',
    })
    return result
  }

  async update(id: string, dto: UpdateProjectDocumentDto): Promise<ProjectDocumentDto> {
    const doc = await this.repo.findById(id)
    if (!doc) throw new NotFoundException(`ProjectDocument ${id} not found`)
    doc.update(dto)
    await this.repo.save(doc)

    const result = ProjectDocumentMapper.toDto(doc)
    await this.auditService?.record({
      projectId: result.projectId,
      entityType: 'project-document',
      entityId: id,
      entityName: result.title,
      action: 'updated',
      changes: dto as Record<string, unknown>,
    })
    return result
  }

  async remove(id: string): Promise<void> {
    const doc = await this.repo.findById(id)
    if (!doc) throw new NotFoundException(`ProjectDocument ${id} not found`)
    await this.auditService?.record({
      projectId: doc.projectId,
      entityType: 'project-document',
      entityId: id,
      entityName: doc.title,
      action: 'deleted',
    })
    await this.repo.delete(id)
  }
}
