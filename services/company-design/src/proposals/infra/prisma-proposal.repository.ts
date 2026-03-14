import { Injectable } from '@nestjs/common'
import { CompanyDesignPrismaService } from '../../prisma/company-design-prisma.service'
import type { ProposalRepository } from '../domain/proposal-repository'
import {
  Proposal,
  type ProposalType,
  type ProposalStatus,
} from '../domain/proposal'

@Injectable()
export class PrismaProposalRepository implements ProposalRepository {
  constructor(private readonly prisma: CompanyDesignPrismaService) {}

  async findById(id: string): Promise<Proposal | null> {
    const row = await this.prisma.proposal.findUnique({ where: { id } })
    return row ? this.toDomain(row) : null
  }

  async findByProjectId(
    projectId: string,
    filters?: { status?: ProposalStatus; proposalType?: ProposalType },
  ): Promise<Proposal[]> {
    const where: Record<string, unknown> = { projectId }
    if (filters?.status) where.status = filters.status
    if (filters?.proposalType) where.proposalType = filters.proposalType
    const rows = await this.prisma.proposal.findMany({ where })
    return rows.map((row) => this.toDomain(row))
  }

  async save(proposal: Proposal): Promise<void> {
    const data = {
      projectId: proposal.projectId,
      proposalType: proposal.proposalType,
      title: proposal.title,
      description: proposal.description,
      motivation: proposal.motivation,
      problemDetected: proposal.problemDetected,
      expectedBenefit: proposal.expectedBenefit,
      estimatedCost: proposal.estimatedCost,
      contextToAssign: proposal.contextToAssign,
      affectedContractIds: proposal.affectedContractIds as string[],
      affectedWorkflowIds: proposal.affectedWorkflowIds as string[],
      requiredApproval: proposal.requiredApproval,
      status: proposal.status,
      proposedByAgentId: proposal.proposedByAgentId,
      reviewedByUserId: proposal.reviewedByUserId,
      approvedByUserId: proposal.approvedByUserId,
      rejectionReason: proposal.rejectionReason,
      implementedAt: proposal.implementedAt,
      createdAt: proposal.createdAt,
      updatedAt: proposal.updatedAt,
    }
    await this.prisma.proposal.upsert({
      where: { id: proposal.id },
      create: { id: proposal.id, ...data },
      update: data,
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.proposal.delete({ where: { id } })
  }

  private toDomain(row: {
    id: string
    projectId: string
    proposalType: string
    title: string
    description: string
    motivation: string
    problemDetected: string
    expectedBenefit: string
    estimatedCost: string
    contextToAssign: string
    affectedContractIds: string[]
    affectedWorkflowIds: string[]
    requiredApproval: string
    status: string
    proposedByAgentId: string
    reviewedByUserId: string | null
    approvedByUserId: string | null
    rejectionReason: string | null
    implementedAt: Date | null
    createdAt: Date
    updatedAt: Date
  }): Proposal {
    return Proposal.reconstitute(row.id, {
      projectId: row.projectId,
      proposalType: row.proposalType as ProposalType,
      title: row.title,
      description: row.description,
      motivation: row.motivation,
      problemDetected: row.problemDetected,
      expectedBenefit: row.expectedBenefit,
      estimatedCost: row.estimatedCost,
      contextToAssign: row.contextToAssign,
      affectedContractIds: [...row.affectedContractIds],
      affectedWorkflowIds: [...row.affectedWorkflowIds],
      requiredApproval: row.requiredApproval,
      status: row.status as ProposalStatus,
      proposedByAgentId: row.proposedByAgentId,
      reviewedByUserId: row.reviewedByUserId,
      approvedByUserId: row.approvedByUserId,
      rejectionReason: row.rejectionReason,
      implementedAt: row.implementedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }
}
