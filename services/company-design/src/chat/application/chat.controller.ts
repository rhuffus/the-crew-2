import { Controller, Get, Post, Delete, Param, Query, Body, HttpCode } from '@nestjs/common'
import type { ScopeType, CreateChatMessageDto } from '@the-crew/shared-types'
import { ChatService } from './chat.service'

@Controller('projects/:projectId/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('threads')
  listThreads(@Param('projectId') projectId: string) {
    return this.chatService.listThreads(projectId)
  }

  @Get('threads/by-scope')
  getOrCreateThread(
    @Param('projectId') projectId: string,
    @Query('scopeType') scopeType: ScopeType,
    @Query('entityId') entityId?: string,
  ) {
    return this.chatService.getOrCreateThread(projectId, scopeType, entityId ?? null)
  }

  @Get('threads/:threadId/messages')
  listMessages(
    @Param('threadId') threadId: string,
    @Query('limit') limit?: string,
    @Query('before') before?: string,
  ) {
    return this.chatService.listMessages(threadId, limit ? parseInt(limit, 10) : undefined, before)
  }

  @Post('threads/:threadId/messages')
  @HttpCode(201)
  sendMessage(
    @Param('threadId') threadId: string,
    @Body() dto: CreateChatMessageDto,
  ) {
    return this.chatService.sendMessage(threadId, dto)
  }

  @Delete('threads/:threadId')
  @HttpCode(204)
  deleteThread(@Param('threadId') threadId: string) {
    return this.chatService.deleteThread(threadId)
  }
}
