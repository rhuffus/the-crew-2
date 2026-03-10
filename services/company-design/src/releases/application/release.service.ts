import { Inject, Injectable, NotFoundException, BadRequestException, Optional } from '@nestjs/common'
import type { CreateReleaseDto, UpdateReleaseDto, ReleaseDto, ReleaseDiffDto } from '@the-crew/shared-types'
import { Release } from '../domain/release'
import {
  RELEASE_REPOSITORY,
  type ReleaseRepository,
} from '../domain/release-repository'
import { ReleaseMapper } from './release.mapper'
import { SnapshotCollector } from './snapshot-collector'
import { ValidationEngine } from '../../validations/application/validation-engine'
import { SnapshotDiffer } from './snapshot-differ'
import { AuditService } from '../../audit/application/audit.service'

@Injectable()
export class ReleaseService {
  constructor(
    @Inject(RELEASE_REPOSITORY) private readonly repo: ReleaseRepository,
    private readonly snapshotCollector: SnapshotCollector,
    private readonly validationEngine: ValidationEngine,
    private readonly snapshotDiffer: SnapshotDiffer,
    @Optional() private readonly auditService?: AuditService,
  ) {}

  async list(projectId: string): Promise<ReleaseDto[]> {
    const releases = await this.repo.findByProjectId(projectId)
    return releases.map(ReleaseMapper.toDto)
  }

  async get(id: string): Promise<ReleaseDto> {
    const release = await this.repo.findById(id)
    if (!release) throw new NotFoundException(`Release ${id} not found`)
    return ReleaseMapper.toDto(release)
  }

  async create(projectId: string, dto: CreateReleaseDto): Promise<ReleaseDto> {
    const id = crypto.randomUUID()
    const release = Release.create({
      id,
      projectId,
      version: dto.version,
      notes: dto.notes,
    })
    await this.repo.save(release)
    const result = ReleaseMapper.toDto(release)
    await this.auditService?.record({
      projectId,
      entityType: 'release',
      entityId: result.id,
      entityName: result.version,
      action: 'created',
    })
    return result
  }

  async update(id: string, dto: UpdateReleaseDto): Promise<ReleaseDto> {
    const release = await this.repo.findById(id)
    if (!release) throw new NotFoundException(`Release ${id} not found`)
    release.update(dto)
    await this.repo.save(release)
    const result = ReleaseMapper.toDto(release)
    await this.auditService?.record({
      projectId: result.projectId,
      entityType: 'release',
      entityId: id,
      entityName: result.version,
      action: 'updated',
      changes: dto as Record<string, unknown>,
    })
    return result
  }

  async publish(id: string): Promise<ReleaseDto> {
    const release = await this.repo.findById(id)
    if (!release) throw new NotFoundException(`Release ${id} not found`)

    const snapshot = await this.snapshotCollector.collect(release.projectId)
    const issues = this.validationEngine.validate(snapshot)

    try {
      release.publish(snapshot, issues)
    } catch (err) {
      throw new BadRequestException((err as Error).message)
    }

    await this.repo.save(release)
    const result = ReleaseMapper.toDto(release)
    await this.auditService?.record({
      projectId: result.projectId,
      entityType: 'release',
      entityId: id,
      entityName: result.version,
      action: 'published',
    })
    return result
  }

  async diff(baseId: string, compareId: string): Promise<ReleaseDiffDto> {
    const base = await this.repo.findById(baseId)
    if (!base) throw new NotFoundException(`Release ${baseId} not found`)

    const compare = await this.repo.findById(compareId)
    if (!compare) throw new NotFoundException(`Release ${compareId} not found`)

    if (base.status !== 'published') {
      throw new BadRequestException(`Release ${baseId} is not published`)
    }
    if (compare.status !== 'published') {
      throw new BadRequestException(`Release ${compareId} is not published`)
    }

    const { changes, summary } = this.snapshotDiffer.diff(base.snapshot!, compare.snapshot!)

    return {
      baseReleaseId: base.id,
      baseVersion: base.version,
      compareReleaseId: compare.id,
      compareVersion: compare.version,
      changes,
      summary,
    }
  }

  async remove(id: string): Promise<void> {
    const release = await this.repo.findById(id)
    if (!release) throw new NotFoundException(`Release ${id} not found`)
    if (release.status === 'published') {
      throw new Error('Cannot delete a published release')
    }
    await this.auditService?.record({
      projectId: release.projectId,
      entityType: 'release',
      entityId: id,
      entityName: release.version,
      action: 'deleted',
    })
    await this.repo.delete(id)
  }
}
