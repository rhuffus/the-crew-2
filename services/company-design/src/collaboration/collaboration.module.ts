import { Module } from '@nestjs/common'
import { CollaborationController } from './application/collaboration.controller'
import { CollaborationService } from './application/collaboration.service'
import { PrismaReviewRepository } from './infra/prisma-review.repository'
import { PrismaLockRepository } from './infra/prisma-lock.repository'
import { REVIEW_REPOSITORY, LOCK_REPOSITORY } from './domain/collaboration-repository'

@Module({
  controllers: [CollaborationController],
  providers: [
    CollaborationService,
    {
      provide: REVIEW_REPOSITORY,
      useClass: PrismaReviewRepository,
    },
    {
      provide: LOCK_REPOSITORY,
      useClass: PrismaLockRepository,
    },
  ],
  exports: [CollaborationService],
})
export class CollaborationModule {}
