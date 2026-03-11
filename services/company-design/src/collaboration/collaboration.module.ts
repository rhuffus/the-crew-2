import { Module } from '@nestjs/common'
import { CollaborationController } from './application/collaboration.controller'
import { CollaborationService } from './application/collaboration.service'
import { InMemoryReviewRepository } from './infra/in-memory-review.repository'
import { InMemoryLockRepository } from './infra/in-memory-lock.repository'
import { REVIEW_REPOSITORY, LOCK_REPOSITORY } from './domain/collaboration-repository'

@Module({
  controllers: [CollaborationController],
  providers: [
    CollaborationService,
    { provide: REVIEW_REPOSITORY, useClass: InMemoryReviewRepository },
    { provide: LOCK_REPOSITORY, useClass: InMemoryLockRepository },
  ],
  exports: [CollaborationService],
})
export class CollaborationModule {}
