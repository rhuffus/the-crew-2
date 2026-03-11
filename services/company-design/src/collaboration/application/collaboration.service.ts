import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import type { AcquireLockDto, CreateReviewMarkerDto, UpdateReviewMarkerDto, ReviewMarkerDto, EntityLockDto } from '@the-crew/shared-types'
import { REVIEW_REPOSITORY, LOCK_REPOSITORY, type ReviewRepository, type LockRepository } from '../domain/collaboration-repository'
import { ReviewMarker } from '../domain/review-marker'
import { EntityLock } from '../domain/entity-lock'
import { CollaborationMapper } from './collaboration.mapper'

@Injectable()
export class CollaborationService {
  constructor(
    @Inject(REVIEW_REPOSITORY) private readonly reviewRepo: ReviewRepository,
    @Inject(LOCK_REPOSITORY) private readonly lockRepo: LockRepository,
  ) {}

  // ── Reviews ──────────────────────────────────────────────────────────

  async createReview(projectId: string, dto: CreateReviewMarkerDto): Promise<ReviewMarkerDto> {
    const review = ReviewMarker.create(projectId, dto)
    await this.reviewRepo.save(review)
    return CollaborationMapper.reviewToDto(review)
  }

  async updateReview(id: string, dto: UpdateReviewMarkerDto): Promise<ReviewMarkerDto> {
    const review = await this.reviewRepo.findById(id)
    if (!review) {
      throw new NotFoundException(`Review ${id} not found`)
    }
    review.update(dto)
    await this.reviewRepo.save(review)
    return CollaborationMapper.reviewToDto(review)
  }

  async deleteReview(id: string): Promise<void> {
    const review = await this.reviewRepo.findById(id)
    if (!review) {
      throw new NotFoundException(`Review ${id} not found`)
    }
    await this.reviewRepo.delete(id)
  }

  async getReviewByEntity(projectId: string, entityId: string): Promise<ReviewMarkerDto | null> {
    const review = await this.reviewRepo.findByEntity(projectId, entityId)
    return review ? CollaborationMapper.reviewToDto(review) : null
  }

  async listReviews(projectId: string): Promise<ReviewMarkerDto[]> {
    const reviews = await this.reviewRepo.listByProject(projectId)
    return reviews.map(CollaborationMapper.reviewToDto)
  }

  // ── Locks ────────────────────────────────────────────────────────────

  async acquireLock(projectId: string, dto: AcquireLockDto): Promise<EntityLockDto> {
    const existing = await this.lockRepo.findByEntity(projectId, dto.entityId)
    if (existing) {
      if (existing.isExpired) {
        await this.lockRepo.delete(existing.id)
      } else if (existing.lockedBy !== dto.lockedBy) {
        throw new ConflictException(`Entity ${dto.entityId} is locked by ${existing.lockedByName}`)
      } else {
        // Same user — extend the existing lock
        existing.extend(dto.durationMs ?? 300_000)
        await this.lockRepo.save(existing)
        return CollaborationMapper.lockToDto(existing)
      }
    }
    const lock = EntityLock.create(projectId, dto)
    await this.lockRepo.save(lock)
    return CollaborationMapper.lockToDto(lock)
  }

  async releaseLock(projectId: string, entityId: string): Promise<void> {
    const lock = await this.lockRepo.findByEntity(projectId, entityId)
    if (!lock) {
      throw new NotFoundException(`No lock found for entity ${entityId}`)
    }
    await this.lockRepo.delete(lock.id)
  }

  async listLocks(projectId: string): Promise<EntityLockDto[]> {
    const locks = await this.lockRepo.listByProject(projectId)
    return locks.map(CollaborationMapper.lockToDto)
  }

  async getLock(projectId: string, entityId: string): Promise<EntityLockDto | null> {
    const lock = await this.lockRepo.findByEntity(projectId, entityId)
    return lock ? CollaborationMapper.lockToDto(lock) : null
  }
}
