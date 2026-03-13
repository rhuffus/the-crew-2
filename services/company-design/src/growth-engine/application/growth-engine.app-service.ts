import { Inject, Injectable } from '@nestjs/common'
import { Proposal } from '../../proposals/domain/proposal'
import type { ProposalRepository } from '../../proposals/domain/proposal-repository'
import { PROPOSAL_REPOSITORY } from '../../proposals/domain/proposal-repository'
import type { CompanyConstitutionRepository } from '../../constitution/domain/company-constitution-repository'
import { COMPANY_CONSTITUTION_REPOSITORY } from '../../constitution/domain/company-constitution-repository'
import type { OrganizationalUnitRepository } from '../../organizational-units/domain/organizational-unit-repository'
import { ORGANIZATIONAL_UNIT_REPOSITORY } from '../../organizational-units/domain/organizational-unit-repository'
import type { ProjectSeedRepository } from '../../project-seed/domain/project-seed-repository'
import { PROJECT_SEED_REPOSITORY } from '../../project-seed/domain/project-seed-repository'
import { evaluateProposal, type GrowthEngineContext } from '../domain/growth-engine.service'
import type { GrowthEvaluationResult } from '../domain/growth-evaluation'
import { buildHealthReport, type OrgHealthReport } from '../domain/health-checker'
import type { ProposalType, ProposalStatus } from '../../proposals/domain/proposal'
import type { MaturityPhase } from '../domain/phase-capabilities'
import { getPhaseCapabilities, type PhaseCapabilities } from '../domain/phase-capabilities'

@Injectable()
export class GrowthEngineAppService {
  constructor(
    @Inject(PROPOSAL_REPOSITORY)
    private readonly proposalRepo: ProposalRepository,
    @Inject(COMPANY_CONSTITUTION_REPOSITORY)
    private readonly constitutionRepo: CompanyConstitutionRepository,
    @Inject(ORGANIZATIONAL_UNIT_REPOSITORY)
    private readonly uoRepo: OrganizationalUnitRepository,
    @Inject(PROJECT_SEED_REPOSITORY)
    private readonly seedRepo: ProjectSeedRepository,
  ) {}

  async submitProposal(params: {
    id: string
    projectId: string
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
  }): Promise<{ proposal: Proposal; evaluation: GrowthEvaluationResult }> {
    const proposal = Proposal.create(params)
    proposal.submit()

    const context = await this.buildContext(params.projectId)
    const evaluation = evaluateProposal(proposal, context)

    // Set the computed approval level
    proposal.setRequiredApproval(evaluation.requiredApprover)

    if (!evaluation.valid) {
      proposal.reject(
        evaluation.violations
          .filter((v) => v.blocking)
          .map((v) => v.description)
          .join('; '),
      )
    } else if (evaluation.autoApprovable) {
      proposal.approve('system-auto')
    }

    await this.proposalRepo.save(proposal)
    return { proposal, evaluation }
  }

  async approveProposal(
    proposalId: string,
    approvedByUserId: string,
  ): Promise<Proposal> {
    const proposal = await this.proposalRepo.findById(proposalId)
    if (!proposal) throw new Error(`Proposal ${proposalId} not found`)

    proposal.approve(approvedByUserId)
    await this.proposalRepo.save(proposal)
    return proposal
  }

  async rejectProposal(
    proposalId: string,
    reason: string,
  ): Promise<Proposal> {
    const proposal = await this.proposalRepo.findById(proposalId)
    if (!proposal) throw new Error(`Proposal ${proposalId} not found`)

    proposal.reject(reason)
    await this.proposalRepo.save(proposal)
    return proposal
  }

  async getProposal(proposalId: string): Promise<Proposal | null> {
    return this.proposalRepo.findById(proposalId)
  }

  async listProposals(
    projectId: string,
    filters?: { status?: ProposalStatus; proposalType?: ProposalType },
  ): Promise<Proposal[]> {
    return this.proposalRepo.findByProjectId(projectId, filters)
  }

  async evaluateExisting(proposalId: string): Promise<GrowthEvaluationResult> {
    const proposal = await this.proposalRepo.findById(proposalId)
    if (!proposal) throw new Error(`Proposal ${proposalId} not found`)

    const context = await this.buildContext(proposal.projectId)
    return evaluateProposal(proposal, context)
  }

  async getHealthReport(projectId: string): Promise<OrgHealthReport> {
    const seed = await this.seedRepo.findByProjectId(projectId)
    const constitution = await this.constitutionRepo.findByProjectId(projectId)
    const units = await this.uoRepo.findByProjectId(projectId)
    const proposals = await this.proposalRepo.findByProjectId(projectId)

    const pendingCount = proposals.filter(
      (p) => p.status === 'proposed' || p.status === 'under-review',
    ).length

    return buildHealthReport({
      projectId,
      phase: (seed?.maturityPhase ?? 'seed') as MaturityPhase,
      units,
      limits: constitution?.autonomyLimits ?? {
        maxDepth: 4,
        maxFanOut: 10,
        maxAgentsPerTeam: 8,
        coordinatorToSpecialistRatio: 0.25,
      },
      pendingProposalCount: pendingCount,
    })
  }

  async getPhaseCapabilities(projectId: string): Promise<PhaseCapabilities> {
    const seed = await this.seedRepo.findByProjectId(projectId)
    return getPhaseCapabilities((seed?.maturityPhase ?? 'seed') as MaturityPhase)
  }

  private async buildContext(projectId: string): Promise<GrowthEngineContext> {
    const constitution = await this.constitutionRepo.findByProjectId(projectId)
    if (!constitution) throw new Error(`Constitution not found for project ${projectId}`)

    const seed = await this.seedRepo.findByProjectId(projectId)
    const units = await this.uoRepo.findByProjectId(projectId)
    const phase = (seed?.maturityPhase ?? 'seed') as MaturityPhase

    return {
      constitution,
      phase,
      units,
      currentBudgetUsage: null,
    }
  }
}
