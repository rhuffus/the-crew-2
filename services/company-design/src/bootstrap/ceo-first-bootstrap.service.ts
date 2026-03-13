import { Inject, Injectable, Logger } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { ProjectSeed } from '../project-seed/domain/project-seed'
import {
  PROJECT_SEED_REPOSITORY,
  type ProjectSeedRepository,
} from '../project-seed/domain/project-seed-repository'
import { CompanyConstitution } from '../constitution/domain/company-constitution'
import {
  COMPANY_CONSTITUTION_REPOSITORY,
  type CompanyConstitutionRepository,
} from '../constitution/domain/company-constitution-repository'
import { OrganizationalUnit } from '../organizational-units/domain/organizational-unit'
import {
  ORGANIZATIONAL_UNIT_REPOSITORY,
  type OrganizationalUnitRepository,
} from '../organizational-units/domain/organizational-unit-repository'
import { LcpAgent } from '../lcp-agents/domain/lcp-agent'
import {
  LCP_AGENT_REPOSITORY,
  type LcpAgentRepository,
} from '../lcp-agents/domain/lcp-agent-repository'
import {
  DEFAULT_PREFERENCES,
  DEFAULT_AI_BUDGET,
  DEFAULT_AUTONOMY_LIMITS,
  DEFAULT_BUDGET_CONFIG,
  DEFAULT_APPROVAL_CRITERIA,
  DEFAULT_EXPANSION_RULES,
} from './bootstrap-defaults'

export interface BootstrapInput {
  projectId: string
  name: string
  mission: string
  companyType: string
  vision?: string
  growthPace?: 'conservative' | 'moderate' | 'aggressive'
  approvalLevel?: 'all-changes' | 'structural-only' | 'budget-only' | 'none'
}

export interface BootstrapResult {
  projectSeedId: string
  constitutionId: string
  companyUoId: string
  ceoAgentId: string
  maturityPhase: 'seed'
  nextStep: 'bootstrap-conversation'
}

@Injectable()
export class CeoFirstBootstrapService {
  private readonly logger = new Logger(CeoFirstBootstrapService.name)

  constructor(
    @Inject(PROJECT_SEED_REPOSITORY) private readonly seedRepo: ProjectSeedRepository,
    @Inject(COMPANY_CONSTITUTION_REPOSITORY) private readonly constitutionRepo: CompanyConstitutionRepository,
    @Inject(ORGANIZATIONAL_UNIT_REPOSITORY) private readonly uoRepo: OrganizationalUnitRepository,
    @Inject(LCP_AGENT_REPOSITORY) private readonly agentRepo: LcpAgentRepository,
  ) {}

  async bootstrap(input: BootstrapInput): Promise<BootstrapResult> {
    // Idempotent: if seed exists, return existing IDs
    const existing = await this.seedRepo.findByProjectId(input.projectId)
    if (existing) {
      this.logger.log(`Project ${input.projectId} already bootstrapped, returning existing IDs`)
      return this.buildResultFromExisting(input.projectId)
    }

    this.logger.log(`Bootstrapping CEO-first project: ${input.name}`)

    // 1. Create ProjectSeed
    const founderPreferences = {
      ...DEFAULT_PREFERENCES,
      ...(input.growthPace ? { growthPace: input.growthPace } : {}),
      ...(input.approvalLevel ? { approvalLevel: input.approvalLevel } : {}),
    }

    const seed = ProjectSeed.create(input.projectId, {
      name: input.name,
      mission: input.mission,
      companyType: input.companyType,
      vision: input.vision,
      aiBudget: DEFAULT_AI_BUDGET,
      founderPreferences,
    })
    await this.seedRepo.save(seed)

    // 2. Create CompanyConstitution
    const constitution = CompanyConstitution.create(input.projectId, {
      operationalPrinciples: [input.mission],
      autonomyLimits: DEFAULT_AUTONOMY_LIMITS,
      budgetConfig: DEFAULT_BUDGET_CONFIG,
      approvalCriteria: DEFAULT_APPROVAL_CRITERIA,
      namingConventions: [],
      expansionRules: DEFAULT_EXPANSION_RULES,
      contextMinimizationPolicy: '',
      qualityRules: [],
      deliveryRules: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    await this.constitutionRepo.save(constitution)

    // 3. Create Company UO
    const companyUoId = randomUUID()
    const companyUo = OrganizationalUnit.create({
      id: companyUoId,
      projectId: input.projectId,
      name: input.name,
      description: input.mission,
      uoType: 'company',
      mandate: input.mission,
      purpose: input.mission,
    })
    await this.uoRepo.save(companyUo)

    // 4. Create CEO Agent
    const ceoAgentId = randomUUID()
    const ceoAgent = LcpAgent.create({
      id: ceoAgentId,
      projectId: input.projectId,
      name: 'CEO',
      agentType: 'coordinator',
      uoId: companyUoId,
      role: 'Chief Executive Officer',
      responsibilities: [
        'Refine company vision',
        'Propose organizational structure',
        'Define strategic objectives',
        'Govern company growth',
      ],
      skills: [
        { name: 'Strategic Planning', description: 'Long-term company strategy', category: 'leadership' },
        { name: 'Organization Design', description: 'Structural decisions', category: 'leadership' },
        { name: 'Stakeholder Communication', description: 'Founder interaction', category: 'communication' },
      ],
    })
    await this.agentRepo.save(ceoAgent)

    this.logger.log(`Bootstrap complete: seed=${input.projectId}, company=${companyUoId}, ceo=${ceoAgentId}`)

    return {
      projectSeedId: input.projectId,
      constitutionId: input.projectId,
      companyUoId,
      ceoAgentId,
      maturityPhase: 'seed',
      nextStep: 'bootstrap-conversation',
    }
  }

  async getStatus(projectId: string): Promise<{
    bootstrapped: boolean
    maturityPhase: string | null
    ceoAgentId: string | null
    companyUoId: string | null
  }> {
    const seed = await this.seedRepo.findByProjectId(projectId)
    if (!seed) {
      return { bootstrapped: false, maturityPhase: null, ceoAgentId: null, companyUoId: null }
    }

    const uos = await this.uoRepo.findByProjectId(projectId)
    const companyUo = uos.find((u) => u.uoType === 'company')

    const agents = await this.agentRepo.findByProjectId(projectId)
    const ceo = agents.find((a) => a.role === 'Chief Executive Officer')

    return {
      bootstrapped: true,
      maturityPhase: seed.maturityPhase,
      ceoAgentId: ceo?.id ?? null,
      companyUoId: companyUo?.id ?? null,
    }
  }

  private async buildResultFromExisting(projectId: string): Promise<BootstrapResult> {
    const uos = await this.uoRepo.findByProjectId(projectId)
    const companyUo = uos.find((u) => u.uoType === 'company')

    const agents = await this.agentRepo.findByProjectId(projectId)
    const ceo = agents.find((a) => a.role === 'Chief Executive Officer')

    if (!companyUo) {
      this.logger.warn(`buildResultFromExisting: no company UO found for project ${projectId}`)
    }
    if (!ceo) {
      this.logger.warn(`buildResultFromExisting: no CEO agent found for project ${projectId}`)
    }

    return {
      projectSeedId: projectId,
      constitutionId: projectId,
      companyUoId: companyUo?.id ?? '',
      ceoAgentId: ceo?.id ?? '',
      maturityPhase: 'seed',
      nextStep: 'bootstrap-conversation',
    }
  }
}
