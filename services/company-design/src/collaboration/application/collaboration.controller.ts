import { Controller, Get, Post, Patch, Delete, Param, Query, Body, HttpCode } from '@nestjs/common'
import type { CreateReviewMarkerDto, UpdateReviewMarkerDto, AcquireLockDto } from '@the-crew/shared-types'
import { CollaborationService } from './collaboration.service'

@Controller('projects/:projectId/collaboration')
export class CollaborationController {
  constructor(private readonly collaborationService: CollaborationService) {}

  // ── Reviews ──────────────────────────────────────────────────────────

  @Get('reviews')
  listReviews(@Param('projectId') projectId: string) {
    return this.collaborationService.listReviews(projectId)
  }

  @Get('reviews/by-entity')
  getReviewByEntity(
    @Param('projectId') projectId: string,
    @Query('entityId') entityId: string,
  ) {
    return this.collaborationService.getReviewByEntity(projectId, entityId)
  }

  @Post('reviews')
  @HttpCode(201)
  createReview(
    @Param('projectId') projectId: string,
    @Body() dto: CreateReviewMarkerDto,
  ) {
    return this.collaborationService.createReview(projectId, dto)
  }

  @Patch('reviews/:id')
  updateReview(
    @Param('id') id: string,
    @Body() dto: UpdateReviewMarkerDto,
  ) {
    return this.collaborationService.updateReview(id, dto)
  }

  @Delete('reviews/:id')
  @HttpCode(204)
  deleteReview(@Param('id') id: string) {
    return this.collaborationService.deleteReview(id)
  }

  // ── Locks ────────────────────────────────────────────────────────────

  @Get('locks')
  listLocks(@Param('projectId') projectId: string) {
    return this.collaborationService.listLocks(projectId)
  }

  @Get('locks/by-entity')
  getLock(
    @Param('projectId') projectId: string,
    @Query('entityId') entityId: string,
  ) {
    return this.collaborationService.getLock(projectId, entityId)
  }

  @Post('locks')
  @HttpCode(201)
  acquireLock(
    @Param('projectId') projectId: string,
    @Body() dto: AcquireLockDto,
  ) {
    return this.collaborationService.acquireLock(projectId, dto)
  }

  @Delete('locks/by-entity')
  @HttpCode(204)
  releaseLock(
    @Param('projectId') projectId: string,
    @Query('entityId') entityId: string,
  ) {
    return this.collaborationService.releaseLock(projectId, entityId)
  }
}
