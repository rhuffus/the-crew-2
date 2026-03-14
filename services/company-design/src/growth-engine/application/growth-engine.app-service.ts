import { Inject, Injectable, Logger } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { Proposal } from '../../proposals/domain/proposal'
import type { ProposalRepository } from '../../proposals/domain/proposal-repository'
import { PROPOSAL_REPOSITORY } from '../../proposals/domain/proposal-repository'
import type { CompanyConstitutionRepository } from '../../constitution/domain/company-constitution-repository'
import { COMPANY_CONSTITUTION_REPOSITORY } from '../../constitution/domain/company-constitution-repository'
import type { OrganizationalUnitRepository } from '../../organizational-units/domain/organizational-unit-repository'
import { ORGANIZATIONAL_UNIT_REPOSITORY } from '../../organizational-units/domain/organizational-unit-repository'
import { OrganizationalUnit } from '../../organizational-units/domain/organizational-unit'
import type { ProjectSeedRepository } from '../../project-seed/domain/project-seed-repository'
import { PROJECT_SEED_REPOSITORY } from '../../project-seed/domain/project-seed-repository'
import type { LcpAgentRepository } from '../../lcp-agents/domain/lcp-agent-repository'
import { LCP_AGENT_REPOSITORY } from '../../lcp-agents/domain/lcp-agent-repository'
import { LcpAgent } from '../../lcp-agents/domain/lcp-agent'
import { evaluateProposal, type GrowthEngineContext } from '../domain/growth-engine.service'
import type { GrowthEvaluationResult } from '../domain/growth-evaluation'
import { buildHealthReport, type OrgHealthReport } from '../domain/health-checker'
import type { ProposalType, ProposalStatus } from '../../proposals/domain/proposal'
import type { MaturityPhase } from '../domain/phase-capabilities'
import { getPhaseCapabilities, type PhaseCapabilities } from '../domain/phase-capabilities'

export interface ImplementProposalResult {
  proposal: Proposal
  createdUnitId: string | null
  createdAgentId: string | null
  newPhase: MaturityPhase | null
}

@Injectable()
export class GrowthEngineAppService {
  private readonly logger = new Logger(GrowthEngineAppService.name)

  constructor(
    @Inject(PROPOSAL_REPOSITORY)
    private readonly proposalRepo: ProposalRepository,
    @Inject(COMPANY_CONSTITUTION_REPOSITORY)
    private readonly constitutionRepo: CompanyConstitutionRepository,
    @Inject(ORGANIZATIONAL_UNIT_REPOSITORY)
    private readonly uoRepo: OrganizationalUnitRepository,
    @Inject(PROJECT_SEED_REPOSITORY)
    private readonly seedRepo: ProjectSeedRepository,
    @Inject(LCP_AGENT_REPOSITORY)
    private readonly agentRepo: LcpAgentRepository,
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

  async implementProposal(proposalId: string): Promise<ImplementProposalResult> {
    const proposal = await this.proposalRepo.findById(proposalId)
    if (!proposal) throw new Error(`Proposal ${proposalId} not found`)
    if (proposal.status !== 'approved') {
      throw new Error(`Proposal must be approved before implementation (current: ${proposal.status})`)
    }

    const projectId = proposal.projectId
    let createdUnitId: string | null = null
    let createdAgentId: string | null = null
    let newPhase: MaturityPhase | null = null

    const units = await this.uoRepo.findByProjectId(projectId)
    const companyUnit = units.find((u) => u.uoType === 'company')

    switch (proposal.proposalType) {
      case 'create-department': {
        const parentId = companyUnit?.id ?? null
        const unit = OrganizationalUnit.create({
          id: randomUUID(),
          projectId,
          name: proposal.title.replace('Create Department: ', '').replace('Create department: ', ''),
          description: proposal.description,
          uoType: 'department',
          mandate: proposal.motivation,
          purpose: proposal.expectedBenefit,
          parentUoId: parentId,
          functions: [],
          status: 'active',
        })
        await this.uoRepo.save(unit)
        createdUnitId = unit.id

        // Create coordinator agent for the department
        const coordinator = LcpAgent.create({
          id: randomUUID(),
          projectId,
          name: `${unit.name} Executive`,
          description: `Department Executive for ${unit.name}`,
          agentType: 'coordinator',
          uoId: unit.id,
          role: 'Department Executive',
          responsibilities: ['Coordinate department operations', 'Propose teams and specialists'],
        })
        await this.agentRepo.save(coordinator)
        createdAgentId = coordinator.id

        // Link coordinator to UO
        unit.update({ coordinatorAgentId: coordinator.id })
        await this.uoRepo.save(unit)

        // Phase transition: seed → formation on first department
        const hasDepartments = units.some((u) => u.uoType === 'department' && u.status === 'active')
        if (!hasDepartments) {
          newPhase = await this.tryAdvancePhase(projectId, 'formation')
        }
        break
      }
      case 'create-team': {
        const parentDeptId = this.extractParentUoId(proposal) ?? units.find((u) => u.uoType === 'department')?.id
        if (!parentDeptId) throw new Error('No parent department found for team creation')

        const unit = OrganizationalUnit.create({
          id: randomUUID(),
          projectId,
          name: proposal.title.replace('Create Team: ', '').replace('Create team: ', ''),
          description: proposal.description,
          uoType: 'team',
          mandate: proposal.motivation,
          purpose: proposal.expectedBenefit,
          parentUoId: parentDeptId,
          functions: [],
          status: 'active',
        })
        await this.uoRepo.save(unit)
        createdUnitId = unit.id

        // Create coordinator agent for the team
        const coordinator = LcpAgent.create({
          id: randomUUID(),
          projectId,
          name: `${unit.name} Lead`,
          description: `Team Lead for ${unit.name}`,
          agentType: 'coordinator',
          uoId: unit.id,
          role: 'Team Lead',
          responsibilities: ['Coordinate team work', 'Assign tasks to specialists'],
        })
        await this.agentRepo.save(coordinator)
        createdAgentId = coordinator.id

        unit.update({ coordinatorAgentId: coordinator.id })
        await this.uoRepo.save(unit)

        // Phase transition: formation → structured on first team
        const hasTeams = units.some((u) => u.uoType === 'team' && u.status === 'active')
        if (!hasTeams) {
          newPhase = await this.tryAdvancePhase(projectId, 'structured')
        }
        break
      }
      case 'create-specialist': {
        const parentId = this.extractParentUoId(proposal)
          ?? units.find((u) => u.uoType === 'team')?.id
          ?? units.find((u) => u.uoType === 'department')?.id
        if (!parentId) throw new Error('No parent UO found for specialist creation')

        const agent = LcpAgent.create({
          id: randomUUID(),
          projectId,
          name: proposal.title.replace('Create Specialist: ', '').replace('Create specialist: ', ''),
          description: proposal.description,
          agentType: 'specialist',
          uoId: parentId,
          role: proposal.contextToAssign || 'Specialist',
          responsibilities: [proposal.expectedBenefit],
        })
        await this.agentRepo.save(agent)
        createdAgentId = agent.id
        break
      }
      default:
        this.logger.warn(`Implementation not yet supported for proposal type: ${proposal.proposalType}`)
    }

    proposal.markImplemented()
    await this.proposalRepo.save(proposal)

    this.logger.log(
      `Proposal ${proposalId} (${proposal.proposalType}) implemented. ` +
      `Unit: ${createdUnitId ?? 'none'}, Agent: ${createdAgentId ?? 'none'}, Phase: ${newPhase ?? 'unchanged'}`,
    )

    return { proposal, createdUnitId, createdAgentId, newPhase }
  }

  private extractParentUoId(proposal: Proposal): string | null {
    // contextToAssign may contain a parent UO ID prefixed with "parentUoId:"
    const match = proposal.contextToAssign.match(/parentUoId:(\S+)/)
    return match?.[1] ?? null
  }

  private async tryAdvancePhase(projectId: string, target: MaturityPhase): Promise<MaturityPhase | null> {
    const seed = await this.seedRepo.findByProjectId(projectId)
    if (!seed) return null

    try {
      seed.advancePhase(target)
      await this.seedRepo.save(seed)
      this.logger.log(`Project ${projectId} advanced to phase: ${target}`)
      return target
    } catch {
      return null
    }
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
