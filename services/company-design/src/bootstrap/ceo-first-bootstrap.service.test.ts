import { describe, it, expect, beforeEach } from 'vitest'
import { CeoFirstBootstrapService, type BootstrapInput } from './ceo-first-bootstrap.service'
import { InMemoryProjectSeedRepository } from '../project-seed/infra/in-memory-project-seed.repository'
import { InMemoryCompanyConstitutionRepository } from '../constitution/infra/in-memory-company-constitution.repository'
import { InMemoryOrganizationalUnitRepository } from '../organizational-units/infra/in-memory-organizational-unit.repository'
import { InMemoryLcpAgentRepository } from '../lcp-agents/infra/in-memory-lcp-agent.repository'

describe('CeoFirstBootstrapService', () => {
  let service: CeoFirstBootstrapService
  let seedRepo: InMemoryProjectSeedRepository
  let constitutionRepo: InMemoryCompanyConstitutionRepository
  let uoRepo: InMemoryOrganizationalUnitRepository
  let agentRepo: InMemoryLcpAgentRepository

  const validInput: BootstrapInput = {
    projectId: 'proj-001',
    name: 'Acme Corp',
    mission: 'Build the best widgets',
    companyType: 'saas-startup',
  }

  beforeEach(() => {
    seedRepo = new InMemoryProjectSeedRepository()
    constitutionRepo = new InMemoryCompanyConstitutionRepository()
    uoRepo = new InMemoryOrganizationalUnitRepository()
    agentRepo = new InMemoryLcpAgentRepository()

    service = new CeoFirstBootstrapService(
      seedRepo,
      constitutionRepo,
      uoRepo,
      agentRepo,
    )
  })

  describe('bootstrap', () => {
    it('should create exactly 4 entities: ProjectSeed, Constitution, Company UO, CEO Agent', async () => {
      const result = await service.bootstrap(validInput)

      const seed = await seedRepo.findByProjectId(validInput.projectId)
      expect(seed).not.toBeNull()

      const constitution = await constitutionRepo.findByProjectId(validInput.projectId)
      expect(constitution).not.toBeNull()

      const uos = await uoRepo.findByProjectId(validInput.projectId)
      expect(uos).toHaveLength(1)
      expect(uos[0]!.uoType).toBe('company')

      const agents = await agentRepo.findByProjectId(validInput.projectId)
      expect(agents).toHaveLength(1)
      expect(agents[0]!.role).toBe('Chief Executive Officer')

      expect(result.projectSeedId).toBe(validInput.projectId)
      expect(result.constitutionId).toBe(validInput.projectId)
      expect(result.companyUoId).toBeTruthy()
      expect(result.ceoAgentId).toBeTruthy()
      expect(result.maturityPhase).toBe('seed')
      expect(result.nextStep).toBe('bootstrap-conversation')
    })

    it('should create no departments, teams, or specialists', async () => {
      await service.bootstrap(validInput)

      const uos = await uoRepo.findByProjectId(validInput.projectId)
      const depts = uos.filter((u) => u.uoType === 'department')
      const teams = uos.filter((u) => u.uoType === 'team')
      expect(depts).toHaveLength(0)
      expect(teams).toHaveLength(0)

      const agents = await agentRepo.findByProjectId(validInput.projectId)
      const specialists = agents.filter((a) => a.agentType === 'specialist')
      expect(specialists).toHaveLength(0)
    })

    it('should set maturity phase to seed', async () => {
      await service.bootstrap(validInput)

      const seed = await seedRepo.findByProjectId(validInput.projectId)
      expect(seed!.maturityPhase).toBe('seed')
    })

    it('should create a ProjectSeed with correct data', async () => {
      await service.bootstrap(validInput)

      const seed = await seedRepo.findByProjectId(validInput.projectId)
      expect(seed!.name).toBe('Acme Corp')
      expect(seed!.mission).toBe('Build the best widgets')
      expect(seed!.companyType).toBe('saas-startup')
      expect(seed!.vision).toBe('')
    })

    it('should pass optional vision through', async () => {
      await service.bootstrap({
        ...validInput,
        vision: 'Dominate the widget market',
      })

      const seed = await seedRepo.findByProjectId(validInput.projectId)
      expect(seed!.vision).toBe('Dominate the widget market')
    })

    it('should create CompanyConstitution with mission as operational principle', async () => {
      await service.bootstrap(validInput)

      const constitution = await constitutionRepo.findByProjectId(validInput.projectId)
      expect(constitution!.operationalPrinciples).toContain('Build the best widgets')
    })

    it('should create CompanyConstitution with default autonomy limits', async () => {
      await service.bootstrap(validInput)

      const constitution = await constitutionRepo.findByProjectId(validInput.projectId)
      expect(constitution!.autonomyLimits.maxDepth).toBe(4)
      expect(constitution!.autonomyLimits.maxFanOut).toBe(10)
      expect(constitution!.autonomyLimits.maxAgentsPerTeam).toBe(8)
      expect(constitution!.autonomyLimits.coordinatorToSpecialistRatio).toBe(0.25)
    })

    it('should create CompanyConstitution with default approval criteria', async () => {
      await service.bootstrap(validInput)

      const constitution = await constitutionRepo.findByProjectId(validInput.projectId)
      expect(constitution!.approvalCriteria.length).toBe(7)

      const deptCriterion = constitution!.approvalCriteria.find((c) => c.scope === 'create-department')
      expect(deptCriterion!.requiredApprover).toBe('founder')
      expect(deptCriterion!.requiresJustification).toBe(true)
    })

    it('should create CompanyConstitution with default expansion rules', async () => {
      await service.bootstrap(validInput)

      const constitution = await constitutionRepo.findByProjectId(validInput.projectId)
      expect(constitution!.expansionRules.length).toBe(3)
      const targetTypes = constitution!.expansionRules.map((r) => r.targetType)
      expect(targetTypes).toContain('department')
      expect(targetTypes).toContain('team')
      expect(targetTypes).toContain('specialist')
    })

    it('should create Company UO with correct data', async () => {
      const result = await service.bootstrap(validInput)

      const uos = await uoRepo.findByProjectId(validInput.projectId)
      const company = uos[0]!
      expect(company.id).toBe(result.companyUoId)
      expect(company.name).toBe('Acme Corp')
      expect(company.uoType).toBe('company')
      expect(company.mandate).toBe('Build the best widgets')
      expect(company.status).toBe('active')
      expect(company.parentUoId).toBeNull()
    })

    it('should create CEO Agent as coordinator', async () => {
      const result = await service.bootstrap(validInput)

      const agents = await agentRepo.findByProjectId(validInput.projectId)
      const ceo = agents[0]!
      expect(ceo.id).toBe(result.ceoAgentId)
      expect(ceo.name).toBe('CEO')
      expect(ceo.agentType).toBe('coordinator')
      expect(ceo.role).toBe('Chief Executive Officer')
      expect(ceo.uoId).toBe(result.companyUoId)
      expect(ceo.status).toBe('active')
    })

    it('should give CEO agent proper responsibilities', async () => {
      await service.bootstrap(validInput)

      const agents = await agentRepo.findByProjectId(validInput.projectId)
      const ceo = agents[0]!
      expect(ceo.responsibilities).toContain('Refine company vision')
      expect(ceo.responsibilities).toContain('Propose organizational structure')
      expect(ceo.responsibilities).toContain('Define strategic objectives')
      expect(ceo.responsibilities).toContain('Govern company growth')
    })

    it('should give CEO agent proper skills', async () => {
      await service.bootstrap(validInput)

      const agents = await agentRepo.findByProjectId(validInput.projectId)
      const ceo = agents[0]!
      expect(ceo.skills).toHaveLength(3)
      const skillNames = ceo.skills.map((s) => s.name)
      expect(skillNames).toContain('Strategic Planning')
      expect(skillNames).toContain('Organization Design')
      expect(skillNames).toContain('Stakeholder Communication')
    })

    it('should respect custom growthPace', async () => {
      await service.bootstrap({ ...validInput, growthPace: 'aggressive' })

      const seed = await seedRepo.findByProjectId(validInput.projectId)
      expect(seed!.founderPreferences.growthPace).toBe('aggressive')
    })

    it('should respect custom approvalLevel', async () => {
      await service.bootstrap({ ...validInput, approvalLevel: 'all-changes' })

      const seed = await seedRepo.findByProjectId(validInput.projectId)
      expect(seed!.founderPreferences.approvalLevel).toBe('all-changes')
    })

    it('should use default preferences when not specified', async () => {
      await service.bootstrap(validInput)

      const seed = await seedRepo.findByProjectId(validInput.projectId)
      expect(seed!.founderPreferences.approvalLevel).toBe('structural-only')
      expect(seed!.founderPreferences.communicationStyle).toBe('detailed')
      expect(seed!.founderPreferences.growthPace).toBe('moderate')
    })

    it('should set default AI budget', async () => {
      await service.bootstrap(validInput)

      const seed = await seedRepo.findByProjectId(validInput.projectId)
      expect(seed!.aiBudget.maxMonthlyTokens).toBeNull()
      expect(seed!.aiBudget.maxConcurrentAgents).toBe(5)
      expect(seed!.aiBudget.costAlertThreshold).toBeNull()
    })
  })

  describe('idempotency', () => {
    it('should return existing IDs when bootstrap is called twice', async () => {
      const first = await service.bootstrap(validInput)
      const second = await service.bootstrap(validInput)

      expect(second.companyUoId).toBe(first.companyUoId)
      expect(second.ceoAgentId).toBe(first.ceoAgentId)
      expect(second.projectSeedId).toBe(first.projectSeedId)
    })

    it('should not create duplicate entities', async () => {
      await service.bootstrap(validInput)
      await service.bootstrap(validInput)

      const uos = await uoRepo.findByProjectId(validInput.projectId)
      expect(uos).toHaveLength(1)

      const agents = await agentRepo.findByProjectId(validInput.projectId)
      expect(agents).toHaveLength(1)
    })
  })

  describe('getStatus', () => {
    it('should return not bootstrapped for new project', async () => {
      const status = await service.getStatus('nonexistent')

      expect(status.bootstrapped).toBe(false)
      expect(status.maturityPhase).toBeNull()
      expect(status.ceoAgentId).toBeNull()
      expect(status.companyUoId).toBeNull()
    })

    it('should return bootstrapped status after bootstrap', async () => {
      const result = await service.bootstrap(validInput)
      const status = await service.getStatus(validInput.projectId)

      expect(status.bootstrapped).toBe(true)
      expect(status.maturityPhase).toBe('seed')
      expect(status.ceoAgentId).toBe(result.ceoAgentId)
      expect(status.companyUoId).toBe(result.companyUoId)
    })
  })

  describe('domain events', () => {
    it('should emit ProjectSeedCreated event', async () => {
      await service.bootstrap(validInput)

      const seed = await seedRepo.findByProjectId(validInput.projectId)
      const events = seed!.domainEvents
      expect(events.some((e) => e.eventType === 'ProjectSeedCreated')).toBe(true)
    })

    it('should emit ConstitutionCreated event', async () => {
      await service.bootstrap(validInput)

      const constitution = await constitutionRepo.findByProjectId(validInput.projectId)
      const events = constitution!.domainEvents
      expect(events.some((e) => e.eventType === 'ConstitutionCreated')).toBe(true)
    })

    it('should emit OrganizationalUnitCreated event', async () => {
      await service.bootstrap(validInput)

      const uos = await uoRepo.findByProjectId(validInput.projectId)
      const events = uos[0]!.domainEvents
      expect(events.some((e) => e.eventType === 'OrganizationalUnitCreated')).toBe(true)
    })

    it('should emit AgentCreated event', async () => {
      await service.bootstrap(validInput)

      const agents = await agentRepo.findByProjectId(validInput.projectId)
      const events = agents[0]!.domainEvents
      expect(events.some((e) => e.eventType === 'AgentCreated')).toBe(true)
    })
  })

  describe('multiple projects', () => {
    it('should bootstrap separate projects independently', async () => {
      const result1 = await service.bootstrap(validInput)
      const result2 = await service.bootstrap({
        projectId: 'proj-002',
        name: 'Beta Inc',
        mission: 'Solve beta problems',
        companyType: 'agency',
      })

      expect(result1.companyUoId).not.toBe(result2.companyUoId)
      expect(result1.ceoAgentId).not.toBe(result2.ceoAgentId)

      const uos1 = await uoRepo.findByProjectId('proj-001')
      const uos2 = await uoRepo.findByProjectId('proj-002')
      expect(uos1).toHaveLength(1)
      expect(uos2).toHaveLength(1)
      expect(uos1[0]!.name).toBe('Acme Corp')
      expect(uos2[0]!.name).toBe('Beta Inc')
    })
  })
})
