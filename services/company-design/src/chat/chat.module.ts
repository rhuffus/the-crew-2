import { Module } from '@nestjs/common'
import { ChatController } from './application/chat.controller'
import { ChatService } from './application/chat.service'
import { InMemoryChatRepository } from './infra/in-memory-chat.repository'
import { CHAT_REPOSITORY } from './domain/chat-repository'

@Module({
  controllers: [ChatController],
  providers: [
    ChatService,
    { provide: CHAT_REPOSITORY, useClass: InMemoryChatRepository },
  ],
  exports: [ChatService],
})
export class ChatModule {}
