import { Module } from '@nestjs/common'
import { ClaudeRunnerService } from './application/claude-runner.service'
import { ClaudeRunnerController } from './claude-runner.controller'
import { CLAUDE_RUNNER_PORT } from './domain/claude-runner.port'
import { DockerClaudeRunnerAdapter } from './infra/docker-claude-runner.adapter'
import { AiProviderConfigModule } from '../ai-provider-config/ai-provider-config.module'

/**
 * Claude runner module — uses Docker adapter for sandboxed execution.
 * Note: The bootstrap CEO conversation now runs Claude CLI directly
 * in the temporal-worker (no longer proxied through this service).
 * This module is kept for future sandboxed task execution needs.
 */
@Module({
  imports: [AiProviderConfigModule],
  controllers: [ClaudeRunnerController],
  providers: [
    ClaudeRunnerService,
    {
      provide: CLAUDE_RUNNER_PORT,
      useClass: DockerClaudeRunnerAdapter,
    },
  ],
  exports: [ClaudeRunnerService, CLAUDE_RUNNER_PORT],
})
export class ClaudeRunnerModule {}
