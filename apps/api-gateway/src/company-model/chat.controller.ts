import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  HttpCode,
} from '@nestjs/common'
import type { CreateChatMessageDto } from '@the-crew/shared-types'
import { CompanyDesignClient } from './company-design.client'

@Controller('projects/:projectId/chat')
export class ChatController {
  constructor(private readonly companyDesign: CompanyDesignClient) {}

  @Get('threads')
  listThreads(@Param('projectId') projectId: string) {
    return this.companyDesign.listChatThreads(projectId)
  }

  @Get('threads/by-scope')
  getThread(
    @Param('projectId') projectId: string,
    @Query('scopeType') scopeType: string,
    @Query('entityId') entityId?: string,
  ) {
    return this.companyDesign.getChatThread(projectId, scopeType, entityId)
  }

  @Get('threads/:threadId/messages')
  listMessages(
    @Param('projectId') projectId: string,
    @Param('threadId') threadId: string,
    @Query('limit') limit?: string,
    @Query('before') before?: string,
  ) {
    return this.companyDesign.listChatMessages(
      threadId,
      projectId,
      limit ? parseInt(limit, 10) : undefined,
      before,
    )
  }

  @Post('threads/:threadId/messages')
  @HttpCode(201)
  sendMessage(
    @Param('projectId') projectId: string,
    @Param('threadId') threadId: string,
    @Body() dto: CreateChatMessageDto,
  ) {
    return this.companyDesign.sendChatMessage(threadId, projectId, dto)
  }

  @Delete('threads/:threadId')
  @HttpCode(204)
  deleteThread(
    @Param('projectId') projectId: string,
    @Param('threadId') threadId: string,
  ) {
    return this.companyDesign.deleteChatThread(threadId, projectId)
  }
}
