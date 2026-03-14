import { Module } from '@nestjs/common'
import { PlatformPrismaModule } from './prisma/platform-prisma.module'
import { HealthController } from './health.controller'
import { ProjectsModule } from './projects/projects.module'
import { BootstrapModule } from './bootstrap/bootstrap.module'
import { ClaudeRunnerModule } from './claude-runner/claude-runner.module'
import { AgentTaskModule } from './agent-task/agent-task.module'
import { AiProviderConfigModule } from './ai-provider-config/ai-provider-config.module'

@Module({
  imports: [PlatformPrismaModule, ProjectsModule, BootstrapModule, ClaudeRunnerModule, AgentTaskModule, AiProviderConfigModule],
  controllers: [HealthController],
})
export class AppModule {}
