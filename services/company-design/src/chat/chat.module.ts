import { Module } from '@nestjs/common'
import { isPersistenceModeDrizzle } from '@the-crew/drizzle-db'
import { ChatController } from './application/chat.controller'
import { ChatService } from './application/chat.service'
import { InMemoryChatRepository } from './infra/in-memory-chat.repository'
import { DrizzleChatRepository } from './infra/drizzle-chat.repository'
import { CHAT_REPOSITORY } from './domain/chat-repository'

@Module({
  controllers: [ChatController],
  providers: [
    ChatService,
    {
      provide: CHAT_REPOSITORY,
      useClass: isPersistenceModeDrizzle()
        ? DrizzleChatRepository
        : InMemoryChatRepository,
    },
  ],
  exports: [ChatService],
})
export class ChatModule {}
