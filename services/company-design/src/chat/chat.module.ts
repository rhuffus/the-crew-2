import { Module } from '@nestjs/common'
import { ChatController } from './application/chat.controller'
import { ChatService } from './application/chat.service'
import { PrismaChatRepository } from './infra/prisma-chat.repository'
import { CHAT_REPOSITORY } from './domain/chat-repository'

@Module({
  controllers: [ChatController],
  providers: [
    ChatService,
    {
      provide: CHAT_REPOSITORY,
      useClass: PrismaChatRepository,
    },
  ],
  exports: [ChatService, CHAT_REPOSITORY],
})
export class ChatModule {}
