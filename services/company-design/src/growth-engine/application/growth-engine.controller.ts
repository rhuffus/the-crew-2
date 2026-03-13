import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { GrowthEngineAppService } from './growth-engine.app-service'
import { toProposalDto } from '../../proposals/application/proposal.mapper'
import type { ProposalType, ProposalStatus } from '../../proposals/domain/proposal'

@Controller('projects/:projectId')
export class GrowthEngineController {
  constructor(private readonly growthEngine: GrowthEngineAppService) {}

  @Post('proposals')
  async submitProposal(
    @Param('projectId') projectId: string,
    @Body()
    body: {
      id: string
      proposalType: ProposalType
      title: string
      description: string
      motivation: string
      problemDetected: string
      expectedBenefit: string
      estimatedCost?: string
      contextToAssign?: string
      affectedContractIds?: string[]
      affectedWorkflowIds?: string[]
      proposedByAgentId: string
    },
  ) {
    const { proposal, evaluation } = await this.growthEngine.submitProposal({
      ...body,
      projectId,
    })
    return { proposal: toProposalDto(proposal), evaluation }
  }

  @Get('proposals')
  async listProposals(
    @Param('projectId') projectId: string,
    @Query('status') status?: ProposalStatus,
    @Query('proposalType') proposalType?: ProposalType,
  ) {
    const proposals = await this.growthEngine.listProposals(projectId, { status, proposalType })
    return proposals.map(toProposalDto)
  }

  @Get('proposals/:proposalId')
  async getProposal(@Param('proposalId') proposalId: string) {
    const proposal = await this.growthEngine.getProposal(proposalId)
    if (!proposal) return { error: 'Not found' }
    return toProposalDto(proposal)
  }

  @Get('proposals/:proposalId/evaluate')
  async evaluateProposal(@Param('proposalId') proposalId: string) {
    return this.growthEngine.evaluateExisting(proposalId)
  }

  @Post('proposals/:proposalId/approve')
  async approveProposal(
    @Param('proposalId') proposalId: string,
    @Body() body: { approvedByUserId: string },
  ) {
    const proposal = await this.growthEngine.approveProposal(proposalId, body.approvedByUserId)
    return toProposalDto(proposal)
  }

  @Post('proposals/:proposalId/reject')
  async rejectProposal(
    @Param('proposalId') proposalId: string,
    @Body() body: { reason: string },
  ) {
    const proposal = await this.growthEngine.rejectProposal(proposalId, body.reason)
    return toProposalDto(proposal)
  }

  @Get('health')
  async getHealth(@Param('projectId') projectId: string) {
    return this.growthEngine.getHealthReport(projectId)
  }

  @Get('phase-capabilities')
  async getPhaseCapabilities(@Param('projectId') projectId: string) {
    return this.growthEngine.getPhaseCapabilities(projectId)
  }
}
