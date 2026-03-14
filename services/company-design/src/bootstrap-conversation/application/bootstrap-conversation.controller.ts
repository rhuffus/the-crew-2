import { Controller, Get, Post, Param, Body, HttpCode, NotFoundException } from '@nestjs/common'
import type { SendBootstrapMessageDto } from '@the-crew/shared-types'
import { BootstrapConversationService } from './bootstrap-conversation.service'

@Controller('projects/:projectId/bootstrap-conversation')
export class BootstrapConversationController {
  constructor(private readonly service: BootstrapConversationService) {}

  @Post('start')
  @HttpCode(201)
  startConversation(@Param('projectId') projectId: string) {
    return this.service.startConversation(projectId)
  }

  @Post('messages')
  @HttpCode(201)
  sendMessage(
    @Param('projectId') projectId: string,
    @Body() dto: SendBootstrapMessageDto,
  ) {
    return this.service.sendMessage(projectId, dto.content)
  }

  @Get('status')
  async getStatus(@Param('projectId') projectId: string) {
    const status = await this.service.getStatus(projectId)
    if (!status) {
      throw new NotFoundException(`No bootstrap conversation for project ${projectId}`)
    }
    return status
  }

  @Post('propose-growth')
  @HttpCode(201)
  proposeGrowth(@Param('projectId') projectId: string) {
    return this.service.proposeGrowth(projectId)
  }

  @Post('proposals/:proposalId/approve')
  @HttpCode(200)
  approveGrowthProposal(
    @Param('projectId') projectId: string,
    @Param('proposalId') proposalId: string,
  ) {
    return this.service.approveGrowthProposal(projectId, proposalId)
  }

  @Post('proposals/:proposalId/reject')
  @HttpCode(200)
  rejectGrowthProposal(
    @Param('projectId') projectId: string,
    @Param('proposalId') proposalId: string,
    @Body() dto: { reason?: string },
  ) {
    return this.service.rejectGrowthProposal(projectId, proposalId, dto.reason ?? '')
  }
}
