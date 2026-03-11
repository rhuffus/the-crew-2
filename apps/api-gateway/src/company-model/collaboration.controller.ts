import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  HttpCode,
} from '@nestjs/common'
import type {
  CreateReviewMarkerDto,
  UpdateReviewMarkerDto,
  AcquireLockDto,
} from '@the-crew/shared-types'
import { CompanyDesignClient } from './company-design.client'

@Controller('projects/:projectId/collaboration')
export class CollaborationController {
  constructor(private readonly companyDesign: CompanyDesignClient) {}

  // Reviews

  @Get('reviews')
  listReviews(@Param('projectId') projectId: string) {
    return this.companyDesign.listReviews(projectId)
  }

  @Get('reviews/by-entity')
  getReviewByEntity(
    @Param('projectId') projectId: string,
    @Query('entityId') entityId: string,
  ) {
    return this.companyDesign.getReviewByEntity(projectId, entityId)
  }

  @Post('reviews')
  @HttpCode(201)
  createReview(
    @Param('projectId') projectId: string,
    @Body() dto: CreateReviewMarkerDto,
  ) {
    return this.companyDesign.createReview(projectId, dto)
  }

  @Patch('reviews/:id')
  updateReview(
    @Param('id') id: string,
    @Param('projectId') projectId: string,
    @Body() dto: UpdateReviewMarkerDto,
  ) {
    return this.companyDesign.updateReview(id, projectId, dto)
  }

  @Delete('reviews/:id')
  @HttpCode(204)
  deleteReview(
    @Param('id') id: string,
    @Param('projectId') projectId: string,
  ) {
    return this.companyDesign.deleteReview(id, projectId)
  }

  // Locks

  @Get('locks')
  listLocks(@Param('projectId') projectId: string) {
    return this.companyDesign.listLocks(projectId)
  }

  @Get('locks/by-entity')
  getLock(
    @Param('projectId') projectId: string,
    @Query('entityId') entityId: string,
  ) {
    return this.companyDesign.getLock(projectId, entityId)
  }

  @Post('locks')
  @HttpCode(201)
  acquireLock(
    @Param('projectId') projectId: string,
    @Body() dto: AcquireLockDto,
  ) {
    return this.companyDesign.acquireLock(projectId, dto)
  }

  @Delete('locks/by-entity')
  @HttpCode(204)
  releaseLock(
    @Param('projectId') projectId: string,
    @Query('entityId') entityId: string,
  ) {
    return this.companyDesign.releaseLock(projectId, entityId)
  }
}
