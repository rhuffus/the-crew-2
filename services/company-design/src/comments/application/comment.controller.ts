import { Controller, Get, Post, Patch, Delete, Param, Query, Body, HttpCode } from '@nestjs/common'
import type { CreateCommentDto, UpdateCommentDto } from '@the-crew/shared-types'
import { CommentService } from './comment.service'

@Controller('projects/:projectId/comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get()
  list(
    @Param('projectId') projectId: string,
    @Query('targetType') targetType?: string,
    @Query('targetId') targetId?: string,
  ) {
    if (targetType) {
      return this.commentService.listByTarget(projectId, targetType, targetId ?? null)
    }
    return this.commentService.listByProject(projectId)
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.commentService.getById(id)
  }

  @Post()
  @HttpCode(201)
  create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentService.create(projectId, dto)
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCommentDto,
  ) {
    return this.commentService.update(id, dto)
  }

  @Patch(':id/resolve')
  resolve(@Param('id') id: string) {
    return this.commentService.resolve(id)
  }

  @Delete(':id')
  @HttpCode(204)
  delete(@Param('id') id: string) {
    return this.commentService.delete(id)
  }
}
