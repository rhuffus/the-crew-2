import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { ProjectsController } from './projects.controller'
import { AgentTasksProxyController } from './agent-tasks.controller'
import { AiProviderConfigProxyController } from './ai-provider-config.controller'
import { PlatformClient } from './platform.client'

@Module({
  imports: [HttpModule],
  controllers: [ProjectsController, AgentTasksProxyController, AiProviderConfigProxyController],
  providers: [PlatformClient],
})
export class ProjectsModule {}
