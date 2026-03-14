import { describe, it, expect, beforeEach } from 'vitest'
import { randomUUID } from 'crypto'
import { GrowthEngineAppService } from '../application/growth-engine.app-service'
import { InMemoryProposalRepository } from '../../proposals/infra/in-memory-proposal.repository'
import { InMemoryOrganizationalUnitRepository } from '../../organizational-units/infra/in-memory-organizational-unit.repository'
import { InMemoryLcpAgentRepository } from '../../lcp-agents/infra/in-memory-lcp-agent.repository'
import { InMemoryProjectSeedRepository } from '../../project-seed/infra/in-memory-project-seed.repository'
import { InMemoryCompanyConstitutionRepository } from '../../constitution/infra/in-memory-company-constitution.repository'
import { Proposal } from '../../proposals/domain/proposal'
import { OrganizationalUnit } from '../../organizational-units/domain/organizational-unit'
import { ProjectSeed } from '../../project-seed/domain/project-seed'
import { CompanyConstitution } from '../../constitution/domain/company-constitution'

describe('GrowthEngineAppService.implementProposal', () => {
  let service: GrowthEngineAppService
  let proposalRepo: InMemoryProposalRepository
  let uoRepo: InMemoryOrganizationalUnitRepository
  let agentRepo: InMemoryLcpAgentRepository
  let seedRepo: InMemoryProjectSeedRepository
  let constitutionRepo: InMemoryCompanyConstitutionRepository

  const projectId = 'proj-001'
  const companyUoId = 'company-uo-001'

  beforeEach(async () => {
    proposalRepo = new InMemoryProposalRepository()
    uoRepo = new InMemoryOrganizationalUnitRepository()
    agentRepo = new InMemoryLcpAgentRepository()
    seedRepo = new InMemoryProjectSeedRepository()
    constitutionRepo = new InMemoryCompanyConstitutionRepository()

    service = new GrowthEngineAppService(
      proposalRepo,
      constitutionRepo,
      uoRepo,
      seedRepo,
      agentRepo,
    )

    // Set up project seed in seed phase
    const seed = ProjectSeed.create(projectId, {
      name: 'Acme Corp',
      description: 'Test company',
      mission: 'Build the best widgets',
      companyType: 'tech-startup',
    })
    await seedRepo.save(seed)

    // Set up a default constitution
    const now = new Date()
    const constitution = CompanyConstitution.create(projectId, {
      operationalPrinciples: ['Build quality products'],
      autonomyLimits: {
        maxDepth: 4,
        maxFanOut: 10,
        maxAgentsPerTeam: 8,
        coordinatorToSpecialistRatio: 0.25,
      },
      budgetConfig: {
        globalBudget: null,
        perUoBudget: null,
        perAgentBudget: null,
        alertThresholds: [80],
      },
      approvalCriteria: [
        { scope: 'create-department', requiredApprover: 'founder', requiresJustification: false },
        { scope: 'create-team', requiredApprover: 'founder', requiresJustification: false },
        { scope: 'create-specialist', requiredApprover: 'founder', requiresJustification: false },
      ],
      namingConventions: [],
      expansionRules: [
        { targetType: 'department', conditions: ['Strategic need exists'], requiresBudget: false, requiresOwner: false },
        { targetType: 'team', conditions: ['Workload justifies'], requiresBudget: false, requiresOwner: false },
        { targetType: 'specialist', conditions: ['Role needed'], requiresBudget: false, requiresOwner: false },
      ],
      contextMinimizationPolicy: 'need-to-know',
      qualityRules: [],
      deliveryRules: [],
      createdAt: now,
      updatedAt: now,
    })
    await constitutionRepo.save(constitution)

    // Set up company UO
    const company = OrganizationalUnit.create({
      id: companyUoId,
      projectId,
      name: 'Acme Corp',
      description: 'Root company',
      uoType: 'company',
      mandate: 'Root organizational unit',
    })
    await uoRepo.save(company)
  })

  async function createApprovedProposal(
    type: 'create-department' | 'create-team' | 'create-specialist',
    title: string,
    contextToAssign = '',
  ): Promise<Proposal> {
    const proposal = Proposal.create({
      id: randomUUID(),
      projectId,
      proposalType: type,
      title,
      description: `Description for ${title}`,
      motivation: 'Company needs this structure',
      problemDetected: 'Missing capability',
      expectedBenefit: 'Improved operations',
      contextToAssign,
      proposedByAgentId: 'ceo-agent-001',
    })
    proposal.submit()
    proposal.approve('founder')
    await proposalRepo.save(proposal)
    return proposal
  }

  it('should create department UO and coordinator from create-department proposal', async () => {
    const proposal = await createApprovedProposal('create-department', 'Create Department: Engineering')

    const result = await service.implementProposal(proposal.id)

    expect(result.createdUnitId).toBeTruthy()
    expect(result.createdAgentId).toBeTruthy()
    expect(result.proposal.status).toBe('implemented')

    const unit = await uoRepo.findById(result.createdUnitId!)
    expect(unit).toBeTruthy()
    expect(unit!.name).toBe('Engineering')
    expect(unit!.uoType).toBe('department')
    expect(unit!.parentUoId).toBe(companyUoId)
    expect(unit!.coordinatorAgentId).toBe(result.createdAgentId)

    const agent = await agentRepo.findById(result.createdAgentId!)
    expect(agent).toBeTruthy()
    expect(agent!.agentType).toBe('coordinator')
    expect(agent!.role).toBe('Department Executive')
    expect(agent!.uoId).toBe(result.createdUnitId)
  })

  it('should advance phase from seed to formation on first department', async () => {
    const proposal = await createApprovedProposal('create-department', 'Create Department: Engineering')

    const result = await service.implementProposal(proposal.id)

    expect(result.newPhase).toBe('formation')
    const seed = await seedRepo.findByProjectId(projectId)
    expect(seed!.maturityPhase).toBe('formation')
  })

  it('should not re-advance phase if departments already exist', async () => {
    // Create first department manually
    const existingDept = OrganizationalUnit.create({
      id: randomUUID(),
      projectId,
      name: 'Existing Dept',
      description: 'Already exists',
      uoType: 'department',
      mandate: 'Already operational',
      parentUoId: companyUoId,
    })
    await uoRepo.save(existingDept)

    // Advance seed manually
    const seed = await seedRepo.findByProjectId(projectId)
    seed!.advancePhase('formation')
    await seedRepo.save(seed!)

    const proposal = await createApprovedProposal('create-department', 'Create Department: Product')
    const result = await service.implementProposal(proposal.id)

    expect(result.newPhase).toBeNull()
  })

  it('should create team under a department', async () => {
    // First create a department
    const dept = OrganizationalUnit.create({
      id: randomUUID(),
      projectId,
      name: 'Engineering',
      description: 'Eng dept',
      uoType: 'department',
      mandate: 'Build product',
      parentUoId: companyUoId,
    })
    await uoRepo.save(dept)

    const seed = await seedRepo.findByProjectId(projectId)
    seed!.advancePhase('formation')
    await seedRepo.save(seed!)

    const proposal = await createApprovedProposal(
      'create-team',
      'Create Team: Backend',
      `parentUoId:${dept.id}`,
    )

    const result = await service.implementProposal(proposal.id)

    expect(result.createdUnitId).toBeTruthy()
    expect(result.createdAgentId).toBeTruthy()

    const team = await uoRepo.findById(result.createdUnitId!)
    expect(team!.uoType).toBe('team')
    expect(team!.parentUoId).toBe(dept.id)
    expect(team!.coordinatorAgentId).toBe(result.createdAgentId)

    const agent = await agentRepo.findById(result.createdAgentId!)
    expect(agent!.role).toBe('Team Lead')
  })

  it('should advance phase from formation to structured on first team', async () => {
    const dept = OrganizationalUnit.create({
      id: randomUUID(),
      projectId,
      name: 'Engineering',
      description: 'Eng dept',
      uoType: 'department',
      mandate: 'Build product',
      parentUoId: companyUoId,
    })
    await uoRepo.save(dept)

    const seed = await seedRepo.findByProjectId(projectId)
    seed!.advancePhase('formation')
    await seedRepo.save(seed!)

    const proposal = await createApprovedProposal(
      'create-team',
      'Create Team: Backend',
      `parentUoId:${dept.id}`,
    )

    const result = await service.implementProposal(proposal.id)
    expect(result.newPhase).toBe('structured')
  })

  it('should create specialist agent under a team', async () => {
    const dept = OrganizationalUnit.create({
      id: randomUUID(),
      projectId,
      name: 'Engineering',
      description: 'Eng dept',
      uoType: 'department',
      mandate: 'Build product',
      parentUoId: companyUoId,
    })
    await uoRepo.save(dept)

    const team = OrganizationalUnit.create({
      id: randomUUID(),
      projectId,
      name: 'Backend Team',
      description: 'Backend',
      uoType: 'team',
      mandate: 'Backend development',
      parentUoId: dept.id,
    })
    await uoRepo.save(team)

    const proposal = await createApprovedProposal(
      'create-specialist',
      'Create Specialist: API Developer',
      `parentUoId:${team.id}`,
    )

    const result = await service.implementProposal(proposal.id)

    expect(result.createdUnitId).toBeNull()
    expect(result.createdAgentId).toBeTruthy()

    const agent = await agentRepo.findById(result.createdAgentId!)
    expect(agent!.agentType).toBe('specialist')
    expect(agent!.uoId).toBe(team.id)
  })

  it('should reject implementation of non-approved proposals', async () => {
    const proposal = Proposal.create({
      id: randomUUID(),
      projectId,
      proposalType: 'create-department',
      title: 'Create Department: Eng',
      description: 'test',
      motivation: 'need it',
      problemDetected: 'gap',
      expectedBenefit: 'improvement',
      proposedByAgentId: 'ceo-001',
    })
    proposal.submit()
    await proposalRepo.save(proposal)

    await expect(service.implementProposal(proposal.id)).rejects.toThrow(
      'Proposal must be approved before implementation',
    )
  })

  it('should throw for non-existent proposal', async () => {
    await expect(service.implementProposal('non-existent')).rejects.toThrow('not found')
  })
})
