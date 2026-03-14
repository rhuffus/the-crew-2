import { Module } from '@nestjs/common'
import { ChatModule } from '../chat/chat.module'
import { BootstrapModule } from '../bootstrap/bootstrap.module'
import { ProjectSeedModule } from '../project-seed/project-seed.module'
import { GrowthEngineModule } from '../growth-engine/growth-engine.module'
import { BootstrapConversationController } from './application/bootstrap-conversation.controller'
import { BootstrapConversationService } from './application/bootstrap-conversation.service'
import { BOOTSTRAP_CONVERSATION_REPOSITORY } from './domain/bootstrap-conversation-repository'
import { ASSISTANT_RESPONSE_PROVIDER } from './domain/assistant-response-provider'
import { PrismaBootstrapConversationRepository } from './infra/prisma-bootstrap-conversation.repository'
import { TemporalAssistantResponseProvider } from './infra/temporal-assistant-response.provider'
import { TemporalClientModule } from '../temporal-client/temporal-client.module'

@Module({
  imports: [ChatModule, BootstrapModule, ProjectSeedModule, GrowthEngineModule, TemporalClientModule],
  controllers: [BootstrapConversationController],
  providers: [
    BootstrapConversationService,
    {
      provide: BOOTSTRAP_CONVERSATION_REPOSITORY,
      useClass: PrismaBootstrapConversationRepository,
    },
    {
      provide: ASSISTANT_RESPONSE_PROVIDER,
      useClass: TemporalAssistantResponseProvider,
    },
  ],
  exports: [BootstrapConversationService],
})
export class BootstrapConversationModule {}
