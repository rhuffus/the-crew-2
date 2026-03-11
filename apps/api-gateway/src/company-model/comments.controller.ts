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
import type { CreateCommentDto, UpdateCommentDto } from '@the-crew/shared-types'
import { CompanyDesignClient } from './company-design.client'

@Controller('projects/:projectId/comments')
export class CommentsController {
  constructor(private readonly companyDesign: CompanyDesignClient) {}

  @Get()
  list(
    @Param('projectId') projectId: string,
    @Query('targetType') targetType?: string,
    @Query('targetId') targetId?: string,
  ) {
    return this.companyDesign.listComments(projectId, targetType, targetId)
  }

  @Get(':id')
  get(@Param('id') id: string, @Param('projectId') projectId: string) {
    return this.companyDesign.getComment(id, projectId)
  }

  @Post()
  @HttpCode(201)
  create(@Param('projectId') projectId: string, @Body() dto: CreateCommentDto) {
    return this.companyDesign.createComment(projectId, dto)
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Param('projectId') projectId: string,
    @Body() dto: UpdateCommentDto,
  ) {
    return this.companyDesign.updateComment(id, projectId, dto)
  }

  @Patch(':id/resolve')
  resolve(@Param('id') id: string, @Param('projectId') projectId: string) {
    return this.companyDesign.resolveComment(id, projectId)
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string, @Param('projectId') projectId: string) {
    return this.companyDesign.deleteComment(id, projectId)
  }
}
