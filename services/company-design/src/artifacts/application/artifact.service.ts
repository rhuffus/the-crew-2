import { Inject, Injectable, NotFoundException, Optional } from '@nestjs/common'
import type { CreateArtifactDto, UpdateArtifactDto, ArtifactDto } from '@the-crew/shared-types'
import { Artifact } from '../domain/artifact'
import { ARTIFACT_REPOSITORY, type ArtifactRepository } from '../domain/artifact-repository'
import { ArtifactMapper } from './artifact.mapper'
import { AuditService } from '../../audit/application/audit.service'

@Injectable()
export class ArtifactService {
  constructor(
    @Inject(ARTIFACT_REPOSITORY) private readonly repo: ArtifactRepository,
    @Optional() private readonly auditService?: AuditService,
  ) {}

  async list(projectId: string): Promise<ArtifactDto[]> {
    const artifacts = await this.repo.findByProjectId(projectId)
    return artifacts.map(ArtifactMapper.toDto)
  }

  async get(id: string): Promise<ArtifactDto> {
    const artifact = await this.repo.findById(id)
    if (!artifact) throw new NotFoundException(`Artifact ${id} not found`)
    return ArtifactMapper.toDto(artifact)
  }

  async create(projectId: string, dto: CreateArtifactDto): Promise<ArtifactDto> {
    const id = crypto.randomUUID()
    const artifact = Artifact.create({
      id,
      projectId,
      name: dto.name,
      description: dto.description,
      type: dto.type,
      producerId: dto.producerId,
      producerType: dto.producerType,
      consumerIds: dto.consumerIds,
      tags: dto.tags,
    })
    await this.repo.save(artifact)
    const result = ArtifactMapper.toDto(artifact)
    await this.auditService?.record({
      projectId,
      entityType: 'artifact',
      entityId: result.id,
      entityName: result.name,
      action: 'created',
    })
    return result
  }

  async update(id: string, dto: UpdateArtifactDto): Promise<ArtifactDto> {
    const artifact = await this.repo.findById(id)
    if (!artifact) throw new NotFoundException(`Artifact ${id} not found`)
    artifact.update(dto)
    await this.repo.save(artifact)
    const result = ArtifactMapper.toDto(artifact)
    await this.auditService?.record({
      projectId: result.projectId,
      entityType: 'artifact',
      entityId: id,
      entityName: result.name,
      action: 'updated',
      changes: dto as Record<string, unknown>,
    })
    return result
  }

  async remove(id: string): Promise<void> {
    const artifact = await this.repo.findById(id)
    if (!artifact) throw new NotFoundException(`Artifact ${id} not found`)
    await this.auditService?.record({
      projectId: artifact.projectId,
      entityType: 'artifact',
      entityId: id,
      entityName: artifact.name,
      action: 'deleted',
    })
    await this.repo.delete(id)
  }
}
