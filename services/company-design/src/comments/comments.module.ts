import { Module } from '@nestjs/common'
import { CommentController } from './application/comment.controller'
import { CommentService } from './application/comment.service'
import { PrismaCommentRepository } from './infra/prisma-comment.repository'
import { COMMENT_REPOSITORY } from './domain/comment-repository'

@Module({
  controllers: [CommentController],
  providers: [
    CommentService,
    {
      provide: COMMENT_REPOSITORY,
      useClass: PrismaCommentRepository,
    },
  ],
  exports: [CommentService],
})
export class CommentsModule {}
