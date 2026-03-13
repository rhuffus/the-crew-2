import { describe, it, expect, beforeEach } from 'vitest'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { VerticalerDemoSeeder } from './verticaler-demo-seeder'
import { CeoFirstBootstrapService } from './ceo-first-bootstrap.service'
import { RuntimeService } from '../runtime/application/runtime.service'
import { RuntimeStatusProjector } from '../runtime/application/runtime-status.projector'
import { InMemoryProjectSeedRepository } from '../project-seed/infra/in-memory-project-seed.repository'
import { InMemoryCompanyConstitutionRepository } from '../constitution/infra/in-memory-company-constitution.repository'
import { InMemoryOrganizationalUnitRepository } from '../organizational-units/infra/in-memory-organizational-unit.repository'
import { InMemoryLcpAgentRepository } from '../lcp-agents/infra/in-memory-lcp-agent.repository'
import { InMemoryProposalRepository } from '../proposals/infra/in-memory-proposal.repository'
import { InMemoryRuntimeExecutionRepository } from '../runtime/infra/in-memory-runtime-execution.repository'
import { InMemoryRuntimeEventRepository } from '../runtime/infra/in-memory-runtime-event.repository'
import {
  PROJECT_ID,
  IDS,
  DEPARTMENTS,
  TEAMS,
  SPECIALISTS,
  RUNTIME_DEMO_EVENTS,
} from './verticaler-demo-data'

describe('VerticalerDemoSeeder', () => {
  let seeder: VerticalerDemoSeeder
  let seedRepo: InMemoryProjectSeedRepository
  let constitutionRepo: InMemoryCompanyConstitutionRepository
  let uoRepo: InMemoryOrganizationalUnitRepository
  let agentRepo: InMemoryLcpAgentRepository
  let proposalRepo: InMemoryProposalRepository
  let executionRepo: InMemoryRuntimeExecutionRepository
  let eventRepo: InMemoryRuntimeEventRepository

  beforeEach(async () => {
    seedRepo = new InMemoryProjectSeedRepository()
    constitutionRepo = new InMemoryCompanyConstitutionRepository()
    uoRepo = new InMemoryOrganizationalUnitRepository()
    agentRepo = new InMemoryLcpAgentRepository()
    proposalRepo = new InMemoryProposalRepository()
    executionRepo = new InMemoryRuntimeExecutionRepository()
    eventRepo = new InMemoryRuntimeEventRepository()

    const bootstrapService = new CeoFirstBootstrapService(
      seedRepo,
      constitutionRepo,
      uoRepo,
      agentRepo,
    )

    const eventEmitter = new EventEmitter2()
    const projector = new RuntimeStatusProjector(executionRepo, eventRepo)
    const runtimeService = new RuntimeService(executionRepo, eventRepo, eventEmitter, projector)

    seeder = new VerticalerDemoSeeder(
      bootstrapService,
      seedRepo,
      uoRepo,
      agentRepo,
      proposalRepo,
      runtimeService,
    )

    await seeder.seed()
  })

  // ── ProjectSeed ────────────────────────────────────────────────────

  describe('project seed', () => {
    it('should create a project seed for Verticaler', async () => {
      const seed = await seedRepo.findByProjectId(PROJECT_ID)
      expect(seed).not.toBeNull()
      expect(seed!.name).toBe('Verticaler')
      expect(seed!.companyType).toBe('saas-startup')
    })

    it('should advance seed to operating phase', async () => {
      const seed = await seedRepo.findByProjectId(PROJECT_ID)
      expect(seed!.maturityPhase).toBe('operating')
    })
  })

  // ── Organizational Units ───────────────────────────────────────────

  describe('organizational units', () => {
    it('should create 12 UOs total (1 company + 5 departments + 6 teams)', async () => {
      const uos = await uoRepo.findByProjectId(PROJECT_ID)
      expect(uos).toHaveLength(1 + DEPARTMENTS.length + TEAMS.length)
    })

    it('should create the company UO with stable ID', async () => {
      const company = await uoRepo.findById(IDS.company)
      expect(company).not.toBeNull()
      expect(company!.uoType).toBe('company')
      expect(company!.name).toBe('Verticaler')
    })

    it('should create all 5 departments under the company', async () => {
      const uos = await uoRepo.findByProjectId(PROJECT_ID)
      const departments = uos.filter(u => u.uoType === 'department')
      expect(departments).toHaveLength(5)
      for (const dept of departments) {
        expect(dept.parentUoId).toBe(IDS.company)
      }
    })

    it('should create all 6 teams under their parent departments', async () => {
      const uos = await uoRepo.findByProjectId(PROJECT_ID)
      const teams = uos.filter(u => u.uoType === 'team')
      expect(teams).toHaveLength(6)

      // Platform, Backend, QA under Engineering
      const engTeams = teams.filter(t => t.parentUoId === IDS.engineering)
      expect(engTeams).toHaveLength(3)

      // Dispatch, Field Service under Operations
      const opsTeams = teams.filter(t => t.parentUoId === IDS.operations)
      expect(opsTeams).toHaveLength(2)

      // Discovery under Product
      const prodTeams = teams.filter(t => t.parentUoId === IDS.product)
      expect(prodTeams).toHaveLength(1)
    })

    it('should use stable IDs for all UOs', async () => {
      for (const dept of DEPARTMENTS) {
        const uo = await uoRepo.findById(dept.id)
        expect(uo).not.toBeNull()
        expect(uo!.name).toBe(dept.name)
      }
      for (const team of TEAMS) {
        const uo = await uoRepo.findById(team.id)
        expect(uo).not.toBeNull()
        expect(uo!.name).toBe(team.name)
      }
    })
  })

  // ── Agents ─────────────────────────────────────────────────────────

  describe('agents', () => {
    it('should create 27 agents total (1 CEO + 5 dept + 6 team coords + 15 specialists)', async () => {
      const agents = await agentRepo.findByProjectId(PROJECT_ID)
      expect(agents).toHaveLength(1 + DEPARTMENTS.length + TEAMS.length + SPECIALISTS.length)
    })

    it('should create CEO with stable ID', async () => {
      const ceo = await agentRepo.findById(IDS.ceo)
      expect(ceo).not.toBeNull()
      expect(ceo!.agentType).toBe('coordinator')
      expect(ceo!.role).toBe('Chief Executive Officer')
      expect(ceo!.uoId).toBe(IDS.company)
    })

    it('should create all department coordinators', async () => {
      for (const dept of DEPARTMENTS) {
        const agent = await agentRepo.findById(dept.coordinatorId)
        expect(agent).not.toBeNull()
        expect(agent!.agentType).toBe('coordinator')
        expect(agent!.uoId).toBe(dept.id)
      }
    })

    it('should create all team coordinators', async () => {
      for (const team of TEAMS) {
        const agent = await agentRepo.findById(team.coordinatorId)
        expect(agent).not.toBeNull()
        expect(agent!.agentType).toBe('coordinator')
        expect(agent!.uoId).toBe(team.id)
      }
    })

    it('should create all specialists', async () => {
      const agents = await agentRepo.findByProjectId(PROJECT_ID)
      const specialists = agents.filter(a => a.agentType === 'specialist')
      expect(specialists).toHaveLength(SPECIALISTS.length)

      for (const spec of SPECIALISTS) {
        const agent = await agentRepo.findById(spec.id)
        expect(agent).not.toBeNull()
        expect(agent!.agentType).toBe('specialist')
        expect(agent!.uoId).toBe(spec.uoId)
      }
    })

    it('should correctly partition agents: 12 coordinators + 15 specialists', async () => {
      const agents = await agentRepo.findByProjectId(PROJECT_ID)
      const coordinators = agents.filter(a => a.agentType === 'coordinator')
      const specialists = agents.filter(a => a.agentType === 'specialist')
      expect(coordinators).toHaveLength(12)
      expect(specialists).toHaveLength(15)
    })
  })

  // ── Proposals ──────────────────────────────────────────────────────

  describe('proposals', () => {
    it('should create proposals for all structural changes', async () => {
      const proposals = await proposalRepo.findByProjectId(PROJECT_ID)
      expect(proposals).toHaveLength(DEPARTMENTS.length + TEAMS.length + SPECIALISTS.length)
    })

    it('should have all proposals in implemented status', async () => {
      const proposals = await proposalRepo.findByProjectId(PROJECT_ID)
      for (const p of proposals) {
        expect(p.status).toBe('implemented')
      }
    })

    it('should have 5 create-department proposals', async () => {
      const proposals = await proposalRepo.findByProjectId(PROJECT_ID, { proposalType: 'create-department' })
      expect(proposals).toHaveLength(5)
      for (const p of proposals) {
        expect(p.proposedByAgentId).toBe(IDS.ceo)
      }
    })

    it('should have 6 create-team proposals', async () => {
      const proposals = await proposalRepo.findByProjectId(PROJECT_ID, { proposalType: 'create-team' })
      expect(proposals).toHaveLength(6)
    })

    it('should have 15 create-specialist proposals', async () => {
      const proposals = await proposalRepo.findByProjectId(PROJECT_ID, { proposalType: 'create-specialist' })
      expect(proposals).toHaveLength(15)
    })

    it('department proposals should be proposed by CEO', async () => {
      const proposals = await proposalRepo.findByProjectId(PROJECT_ID, { proposalType: 'create-department' })
      for (const p of proposals) {
        expect(p.proposedByAgentId).toBe(IDS.ceo)
      }
    })

    it('team proposals should be proposed by their department coordinators', async () => {
      const proposals = await proposalRepo.findByProjectId(PROJECT_ID, { proposalType: 'create-team' })
      for (const p of proposals) {
        const team = TEAMS.find(t => p.title.includes(t.name))
        expect(team).toBeDefined()
        expect(p.proposedByAgentId).toBe(team!.proposedByAgentId)
      }
    })
  })

  // ── Runtime ────────────────────────────────────────────────────────

  describe('runtime demo data', () => {
    it('should create runtime executions', async () => {
      const executions = await executionRepo.listByProject(PROJECT_ID)
      expect(executions.length).toBeGreaterThanOrEqual(2)
    })

    it('should create a completed workflow execution', async () => {
      const executions = await executionRepo.listByProject(PROJECT_ID)
      const workflowRuns = executions.filter(e => e.executionType === 'workflow-run')
      expect(workflowRuns.length).toBeGreaterThanOrEqual(1)
      const completed = workflowRuns.filter(e => e.status === 'completed')
      expect(completed.length).toBeGreaterThanOrEqual(1)
    })

    it('should create a completed agent task execution', async () => {
      const executions = await executionRepo.listByProject(PROJECT_ID)
      const agentTasks = executions.filter(e => e.executionType === 'agent-task')
      expect(agentTasks.length).toBeGreaterThanOrEqual(1)
    })

    it('should track AI cost on executions', async () => {
      const executions = await executionRepo.listByProject(PROJECT_ID)
      const totalCost = executions.reduce((sum, e) => sum + e.aiCost, 0)
      expect(totalCost).toBeGreaterThan(0)
    })

    it('should create timeline events', async () => {
      const events = await eventRepo.listByProject(PROJECT_ID)
      // Runtime service emits events for execution lifecycle + demo events
      expect(events.length).toBeGreaterThanOrEqual(RUNTIME_DEMO_EVENTS.length)
    })

    it('should include diverse event types', async () => {
      const events = await eventRepo.listByProject(PROJECT_ID)
      const types = new Set(events.map(e => e.eventType))
      expect(types.has('agent-activated')).toBe(true)
      expect(types.has('execution-started')).toBe(true)
      expect(types.has('execution-completed')).toBe(true)
    })
  })

  // ── Idempotency ────────────────────────────────────────────────────

  describe('idempotency', () => {
    it('should not create duplicates on second seed', async () => {
      const uosBefore = await uoRepo.findByProjectId(PROJECT_ID)
      const agentsBefore = await agentRepo.findByProjectId(PROJECT_ID)

      // Second seed call
      await seeder.seed()

      const uosAfter = await uoRepo.findByProjectId(PROJECT_ID)
      const agentsAfter = await agentRepo.findByProjectId(PROJECT_ID)

      expect(uosAfter).toHaveLength(uosBefore.length)
      expect(agentsAfter).toHaveLength(agentsBefore.length)
    })
  })

  // ── Phase transitions ──────────────────────────────────────────────

  describe('phase transitions', () => {
    it('should have reached operating phase via seed → formation → structured → operating', async () => {
      const seed = await seedRepo.findByProjectId(PROJECT_ID)
      expect(seed!.maturityPhase).toBe('operating')
      // Domain events on the seed should capture the transitions
      const events = seed!.domainEvents
      const phaseEvents = events.filter(e => e.eventType === 'MaturityPhaseAdvanced')
      expect(phaseEvents).toHaveLength(3) // formation, structured, operating
    })
  })

  // ── Constitution ───────────────────────────────────────────────────

  describe('constitution', () => {
    it('should create a constitution for Verticaler', async () => {
      const constitution = await constitutionRepo.findByProjectId(PROJECT_ID)
      expect(constitution).not.toBeNull()
      expect(constitution!.operationalPrinciples.length).toBeGreaterThanOrEqual(1)
    })
  })

  // ── Growth story integrity ──────────────────────────────────────────

  describe('growth story integrity', () => {
    it('every agent should reference an existing UO', async () => {
      const agents = await agentRepo.findByProjectId(PROJECT_ID)
      const uoIds = new Set((await uoRepo.findByProjectId(PROJECT_ID)).map(u => u.id))
      for (const agent of agents) {
        expect(uoIds.has(agent.uoId)).toBe(true)
      }
    })

    it('every department UO should have a coordinator agent', async () => {
      const uos = await uoRepo.findByProjectId(PROJECT_ID)
      const departments = uos.filter(u => u.uoType === 'department')
      for (const dept of departments) {
        expect(dept.coordinatorAgentId).toBeTruthy()
        const agent = await agentRepo.findById(dept.coordinatorAgentId!)
        expect(agent).not.toBeNull()
        expect(agent!.agentType).toBe('coordinator')
      }
    })

    it('every team UO should have a coordinator agent', async () => {
      const uos = await uoRepo.findByProjectId(PROJECT_ID)
      const teams = uos.filter(u => u.uoType === 'team')
      for (const team of teams) {
        expect(team.coordinatorAgentId).toBeTruthy()
        const agent = await agentRepo.findById(team.coordinatorAgentId!)
        expect(agent).not.toBeNull()
        expect(agent!.agentType).toBe('coordinator')
      }
    })

    it('specialist agents should reference a valid UO', async () => {
      const agents = await agentRepo.findByProjectId(PROJECT_ID)
      const specialists = agents.filter(a => a.agentType === 'specialist')
      const uoIds = new Set((await uoRepo.findByProjectId(PROJECT_ID)).map(u => u.id))
      for (const spec of specialists) {
        expect(uoIds.has(spec.uoId)).toBe(true)
      }
    })
  })
})
