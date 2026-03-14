import { Controller, Get, Post, Param, Body, HttpCode } from '@nestjs/common'
import type { SendBootstrapMessageDto } from '@the-crew/shared-types'
import { CompanyDesignClient } from './company-design.client'

@Controller('projects/:projectId/bootstrap-conversation')
export class BootstrapConversationProxyController {
  constructor(private readonly companyDesign: CompanyDesignClient) {}

  @Post('start')
  @HttpCode(201)
  startConversation(@Param('projectId') projectId: string) {
    return this.companyDesign.startBootstrapConversation(projectId)
  }

  @Post('messages')
  @HttpCode(201)
  sendMessage(
    @Param('projectId') projectId: string,
    @Body() dto: SendBootstrapMessageDto,
  ) {
    return this.companyDesign.sendBootstrapMessage(projectId, dto)
  }

  @Get('status')
  getStatus(@Param('projectId') projectId: string) {
    return this.companyDesign.getBootstrapConversationStatus(projectId)
  }

  @Post('propose-growth')
  @HttpCode(201)
  proposeGrowth(@Param('projectId') projectId: string) {
    return this.companyDesign.proposeGrowth(projectId)
  }

  @Post('proposals/:proposalId/approve')
  @HttpCode(200)
  approveGrowthProposal(
    @Param('projectId') projectId: string,
    @Param('proposalId') proposalId: string,
  ) {
    return this.companyDesign.approveGrowthProposal(projectId, proposalId)
  }

  @Post('proposals/:proposalId/reject')
  @HttpCode(200)
  rejectGrowthProposal(
    @Param('projectId') projectId: string,
    @Param('proposalId') proposalId: string,
    @Body() dto: { reason?: string },
  ) {
    return this.companyDesign.rejectGrowthProposal(projectId, proposalId, dto.reason ?? '')
  }
}
