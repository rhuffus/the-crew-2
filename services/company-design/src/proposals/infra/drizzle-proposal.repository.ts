import { Inject, Injectable } from '@nestjs/common'
import { and, eq } from 'drizzle-orm'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { DRIZZLE_DB } from '@the-crew/drizzle-db'
import type { ProposalRepository } from '../domain/proposal-repository'
import {
  Proposal,
  type ProposalType,
  type ProposalStatus,
} from '../domain/proposal'
import { proposals } from '../../drizzle/schema/proposals'

@Injectable()
export class DrizzleProposalRepository implements ProposalRepository {
  constructor(@Inject(DRIZZLE_DB) private readonly db: PostgresJsDatabase) {}

  async findById(id: string): Promise<Proposal | null> {
    const rows = await this.db
      .select()
      .from(proposals)
      .where(eq(proposals.id, id))
      .limit(1)
    return rows[0] ? this.toDomain(rows[0]) : null
  }

  async findByProjectId(
    projectId: string,
    filters?: { status?: ProposalStatus; proposalType?: ProposalType },
  ): Promise<Proposal[]> {
    const conditions = [eq(proposals.projectId, projectId)]
    if (filters?.status) conditions.push(eq(proposals.status, filters.status))
    if (filters?.proposalType) conditions.push(eq(proposals.proposalType, filters.proposalType))
    const rows = await this.db.select().from(proposals).where(and(...conditions))
    return rows.map((row) => this.toDomain(row))
  }

  async save(proposal: Proposal): Promise<void> {
    const row = this.toRow(proposal)
    await this.db
      .insert(proposals)
      .values(row)
      .onConflictDoUpdate({ target: proposals.id, set: row })
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(proposals).where(eq(proposals.id, id))
  }

  private toDomain(row: typeof proposals.$inferSelect): Proposal {
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
      affectedContractIds: row.affectedContractIds as string[],
      affectedWorkflowIds: row.affectedWorkflowIds as string[],
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

  private toRow(proposal: Proposal): typeof proposals.$inferInsert {
    return {
      id: proposal.id,
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
  }
}
