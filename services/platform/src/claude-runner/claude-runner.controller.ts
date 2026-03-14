import { Body, Controller, HttpCode, Post } from '@nestjs/common'
import type { ResultEnvelope } from '@the-crew/shared-types'
import { ClaudeRunnerService, type SubmitExecutionRequest } from './application/claude-runner.service'

@Controller('claude-runner')
export class ClaudeRunnerController {
  constructor(private readonly service: ClaudeRunnerService) {}

  @Post('execute')
  @HttpCode(200)
  async execute(@Body() body: SubmitExecutionRequest): Promise<ResultEnvelope> {
    return this.service.submit(body)
  }
}
