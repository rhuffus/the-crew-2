import { Module } from '@nestjs/common'
import { isPersistenceModeDrizzle } from '@the-crew/drizzle-db'
import { CommentController } from './application/comment.controller'
import { CommentService } from './application/comment.service'
import { InMemoryCommentRepository } from './infra/in-memory-comment.repository'
import { DrizzleCommentRepository } from './infra/drizzle-comment.repository'
import { COMMENT_REPOSITORY } from './domain/comment-repository'

@Module({
  controllers: [CommentController],
  providers: [
    CommentService,
    {
      provide: COMMENT_REPOSITORY,
      useClass: isPersistenceModeDrizzle()
        ? DrizzleCommentRepository
        : InMemoryCommentRepository,
    },
  ],
  exports: [CommentService],
})
export class CommentsModule {}
