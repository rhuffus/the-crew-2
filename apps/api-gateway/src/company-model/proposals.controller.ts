import { Controller, Get, Post, Param, Query, Body, HttpCode } from '@nestjs/common'
import type { CreateProposalDto, ProposalType, ProposalStatus } from '@the-crew/shared-types'
import { CompanyDesignClient } from './company-design.client'

@Controller('projects/:projectId/proposals')
export class ProposalsProxyController {
  constructor(private readonly companyDesign: CompanyDesignClient) {}

  @Post()
  @HttpCode(201)
  submitProposal(
    @Param('projectId') projectId: string,
    @Body() body: CreateProposalDto & { id: string },
  ) {
    return this.companyDesign.submitProposal(projectId, body)
  }

  @Get()
  listProposals(
    @Param('projectId') projectId: string,
    @Query('status') status?: ProposalStatus,
    @Query('proposalType') proposalType?: ProposalType,
  ) {
    return this.companyDesign.listProposals(projectId, { status, proposalType })
  }

  @Get(':proposalId')
  getProposal(
    @Param('projectId') projectId: string,
    @Param('proposalId') proposalId: string,
  ) {
    return this.companyDesign.getProposal(projectId, proposalId)
  }

  @Get(':proposalId/evaluate')
  evaluateProposal(
    @Param('projectId') projectId: string,
    @Param('proposalId') proposalId: string,
  ) {
    return this.companyDesign.evaluateProposal(projectId, proposalId)
  }

  @Post(':proposalId/approve')
  approveProposal(
    @Param('projectId') projectId: string,
    @Param('proposalId') proposalId: string,
    @Body() body: { approvedByUserId: string },
  ) {
    return this.companyDesign.approveProposal(projectId, proposalId, body)
  }

  @Post(':proposalId/reject')
  rejectProposal(
    @Param('projectId') projectId: string,
    @Param('proposalId') proposalId: string,
    @Body() body: { reason: string },
  ) {
    return this.companyDesign.rejectProposal(projectId, proposalId, body)
  }
}
