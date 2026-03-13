/**
 * Verticaler Live Company Demo Seeder.
 *
 * Seeds the Verticaler reference company using the new CEO-first bootstrap path,
 * creating new-paradigm entities (UOs, LcpAgents, Proposals, RuntimeEvents)
 * alongside the legacy entities (created by LegacyBootstrapService) for
 * graph-projection backward compatibility.
 *
 * Growth story:
 *   1. CEO-first bootstrap → seed phase
 *   2. 5 department proposals (auto-approved by founder) → formation phase
 *   3. 6 team proposals (proposed by coordinators) → structured phase
 *   4. 15 specialist proposals (proposed by team leads / dept coordinators)
 *   5. Runtime demo events + executions → operating phase
 *
 * Created by LCP-016.
 */

import { Inject, Injectable, Logger, type OnModuleInit } from '@nestjs/common'
import { VERTICALER_PROJECT_NAME, VERTICALER_PROJECT_DESCRIPTION } from '@the-crew/shared-types'
import {
  PROJECT_SEED_REPOSITORY,
  type ProjectSeedRepository,
} from '../project-seed/domain/project-seed-repository'
import {
  ORGANIZATIONAL_UNIT_REPOSITORY,
  type OrganizationalUnitRepository,
} from '../organizational-units/domain/organizational-unit-repository'
import {
  LCP_AGENT_REPOSITORY,
  type LcpAgentRepository,
} from '../lcp-agents/domain/lcp-agent-repository'
import {
  PROPOSAL_REPOSITORY,
  type ProposalRepository,
} from '../proposals/domain/proposal-repository'
import { CeoFirstBootstrapService } from './ceo-first-bootstrap.service'
import { OrganizationalUnit } from '../organizational-units/domain/organizational-unit'
import { LcpAgent } from '../lcp-agents/domain/lcp-agent'
import { Proposal } from '../proposals/domain/proposal'
import { RuntimeService } from '../runtime/application/runtime.service'
import {
  PROJECT_ID,
  IDS,
  DEPARTMENTS,
  TEAMS,
  SPECIALISTS,
  RUNTIME_DEMO_EVENTS,
  type DepartmentDef,
  type TeamDef,
  type SpecialistDef,
} from './verticaler-demo-data'

@Injectable()
export class VerticalerDemoSeeder implements OnModuleInit {
  private readonly logger = new Logger(VerticalerDemoSeeder.name)

  constructor(
    private readonly bootstrapService: CeoFirstBootstrapService,
    @Inject(PROJECT_SEED_REPOSITORY) private readonly seedRepo: ProjectSeedRepository,
    @Inject(ORGANIZATIONAL_UNIT_REPOSITORY) private readonly uoRepo: OrganizationalUnitRepository,
    @Inject(LCP_AGENT_REPOSITORY) private readonly agentRepo: LcpAgentRepository,
    @Inject(PROPOSAL_REPOSITORY) private readonly proposalRepo: ProposalRepository,
    private readonly runtimeService: RuntimeService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seed()
  }

  async seed(): Promise<void> {
    // Idempotent: skip if already seeded with new entities
    const existingSeed = await this.seedRepo.findByProjectId(PROJECT_ID)
    if (existingSeed) {
      this.logger.log('Verticaler demo already seeded (new paradigm), skipping')
      return
    }

    this.logger.log('Seeding Verticaler as Live Company demo...')

    // Phase 1: CEO-first bootstrap (seed phase)
    const bootstrap = await this.bootstrapService.bootstrap({
      projectId: PROJECT_ID,
      name: VERTICALER_PROJECT_NAME,
      mission: VERTICALER_PROJECT_DESCRIPTION,
      companyType: 'saas-startup',
      vision: 'Become the leading platform for elevator service management in LATAM',
      growthPace: 'moderate',
      approvalLevel: 'structural-only',
    })

    // Override generated IDs with stable demo IDs
    // We need to replace the bootstrap-generated entities with stable-ID versions
    await this.replaceBootstrapEntities(bootstrap.companyUoId, bootstrap.ceoAgentId)

    // Phase 2: Department proposals → formation phase
    await this.createDepartments()
    await this.advancePhase('formation')

    // Phase 3: Team proposals → structured phase
    await this.createTeams()
    await this.advancePhase('structured')

    // Phase 4: Specialist proposals
    await this.createSpecialists()

    // Phase 5: Runtime demo data → operating phase
    await this.seedRuntimeDemo()
    await this.advancePhase('operating')

    this.logger.log('Verticaler Live Company demo seeding complete')
    this.logger.log(`  UOs: ${1 + DEPARTMENTS.length + TEAMS.length}`)
    this.logger.log(`  Agents: 1 CEO + ${DEPARTMENTS.length} dept coords + ${TEAMS.length} team coords + ${SPECIALISTS.length} specialists = ${1 + DEPARTMENTS.length + TEAMS.length + SPECIALISTS.length}`)
    this.logger.log(`  Proposals: ${DEPARTMENTS.length + TEAMS.length + SPECIALISTS.length}`)
    this.logger.log(`  Runtime events: ${RUNTIME_DEMO_EVENTS.length}`)
  }

  // ── Internal methods ──────────────────────────────────────────────────

  private async replaceBootstrapEntities(generatedCompanyId: string, generatedCeoId: string): Promise<void> {
    // Delete generated entities
    await this.uoRepo.delete(generatedCompanyId)
    await this.agentRepo.delete(generatedCeoId)

    // Create with stable IDs
    const companyUo = OrganizationalUnit.create({
      id: IDS.company,
      projectId: PROJECT_ID,
      name: VERTICALER_PROJECT_NAME,
      description: VERTICALER_PROJECT_DESCRIPTION,
      uoType: 'company',
      mandate: VERTICALER_PROJECT_DESCRIPTION,
      purpose: 'Elevator service management SaaS platform',
    })
    await this.uoRepo.save(companyUo)

    const ceo = LcpAgent.create({
      id: IDS.ceo,
      projectId: PROJECT_ID,
      name: 'CEO',
      agentType: 'coordinator',
      uoId: IDS.company,
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
    await this.agentRepo.save(ceo)
  }

  private async createDepartments(): Promise<void> {
    for (const dept of DEPARTMENTS) {
      await this.createDepartmentWithProposal(dept)
    }
  }

  private async createDepartmentWithProposal(dept: DepartmentDef): Promise<void> {
    // Create proposal (pre-approved)
    const proposalId = `vert-proposal-dept-${dept.name.toLowerCase().replace(/\s+/g, '-')}`
    const proposal = Proposal.create({
      id: proposalId,
      projectId: PROJECT_ID,
      proposalType: 'create-department',
      title: `Create ${dept.name} Department`,
      description: `Establish the ${dept.name} department to ${dept.mandate.toLowerCase()}`,
      motivation: `The company needs dedicated ${dept.name.toLowerCase()} capabilities`,
      problemDetected: `No organizational unit exists for ${dept.purpose.toLowerCase()}`,
      expectedBenefit: `Dedicated ${dept.name.toLowerCase()} function with clear mandate`,
      estimatedCost: '1 coordinator agent',
      contextToAssign: dept.functions.join(', '),
      proposedByAgentId: IDS.ceo,
      requiredApproval: 'founder',
    })
    proposal.submit()
    proposal.approve('founder')
    proposal.markImplemented()
    await this.proposalRepo.save(proposal)

    // Create UO
    const uo = OrganizationalUnit.create({
      id: dept.id,
      projectId: PROJECT_ID,
      name: dept.name,
      description: dept.purpose,
      uoType: 'department',
      mandate: dept.mandate,
      purpose: dept.purpose,
      parentUoId: IDS.company,
      coordinatorAgentId: dept.coordinatorId,
      functions: dept.functions,
    })
    await this.uoRepo.save(uo)

    // Create coordinator agent
    const coordinator = LcpAgent.create({
      id: dept.coordinatorId,
      projectId: PROJECT_ID,
      name: dept.coordinatorName,
      agentType: 'coordinator',
      uoId: dept.id,
      role: dept.coordinatorRole,
      responsibilities: dept.coordinatorResponsibilities,
      skills: dept.coordinatorSkills,
    })
    await this.agentRepo.save(coordinator)
  }

  private async createTeams(): Promise<void> {
    for (const team of TEAMS) {
      await this.createTeamWithProposal(team)
    }
  }

  private async createTeamWithProposal(team: TeamDef): Promise<void> {
    const proposalId = `vert-proposal-team-${team.name.toLowerCase().replace(/\s+/g, '-')}`
    const proposal = Proposal.create({
      id: proposalId,
      projectId: PROJECT_ID,
      proposalType: 'create-team',
      title: `Create ${team.name}`,
      description: `Establish the ${team.name} to ${team.mandate.toLowerCase()}`,
      motivation: `Department has differentiated recurring work requiring a dedicated team`,
      problemDetected: `${team.purpose} needs dedicated ownership`,
      expectedBenefit: `Focused team with clear mandate for ${team.functions.join(', ').toLowerCase()}`,
      estimatedCost: '1 coordinator agent',
      contextToAssign: team.functions.join(', '),
      proposedByAgentId: team.proposedByAgentId,
      requiredApproval: 'founder',
    })
    proposal.submit()
    proposal.approve('founder')
    proposal.markImplemented()
    await this.proposalRepo.save(proposal)

    // Create UO
    const uo = OrganizationalUnit.create({
      id: team.id,
      projectId: PROJECT_ID,
      name: team.name,
      description: team.purpose,
      uoType: 'team',
      mandate: team.mandate,
      purpose: team.purpose,
      parentUoId: team.parentId,
      coordinatorAgentId: team.coordinatorId,
      functions: team.functions,
    })
    await this.uoRepo.save(uo)

    // Create coordinator agent
    const coordinator = LcpAgent.create({
      id: team.coordinatorId,
      projectId: PROJECT_ID,
      name: team.coordinatorName,
      agentType: 'coordinator',
      uoId: team.id,
      role: team.coordinatorRole,
      responsibilities: team.coordinatorResponsibilities,
      skills: team.coordinatorSkills,
    })
    await this.agentRepo.save(coordinator)
  }

  private async createSpecialists(): Promise<void> {
    for (const spec of SPECIALISTS) {
      await this.createSpecialistWithProposal(spec)
    }
  }

  private async createSpecialistWithProposal(spec: SpecialistDef): Promise<void> {
    const proposalId = `vert-proposal-spec-${spec.name.toLowerCase().replace(/\s+/g, '-')}`
    const proposal = Proposal.create({
      id: proposalId,
      projectId: PROJECT_ID,
      proposalType: 'create-specialist',
      title: `Create ${spec.name}`,
      description: `Add ${spec.name} specialist to handle ${spec.responsibilities[0]?.toLowerCase() ?? 'specialized work'}`,
      motivation: 'Active workflow requires specialized function',
      problemDetected: `No specialist exists for ${spec.role.toLowerCase()}`,
      expectedBenefit: `Dedicated specialist for ${spec.outputs.join(', ').toLowerCase()}`,
      estimatedCost: '1 specialist agent',
      proposedByAgentId: spec.proposedByAgentId,
      requiredApproval: 'ceo',
    })
    proposal.submit()
    proposal.approve('ceo')
    proposal.markImplemented()
    await this.proposalRepo.save(proposal)

    // Create specialist agent
    const agent = LcpAgent.create({
      id: spec.id,
      projectId: PROJECT_ID,
      name: spec.name,
      agentType: 'specialist',
      uoId: spec.uoId,
      role: spec.role,
      responsibilities: spec.responsibilities,
      skills: spec.skills,
      inputs: spec.inputs,
      outputs: spec.outputs,
    })
    await this.agentRepo.save(agent)
  }

  private async advancePhase(to: 'formation' | 'structured' | 'operating'): Promise<void> {
    const seed = await this.seedRepo.findByProjectId(PROJECT_ID)
    if (!seed) throw new Error('ProjectSeed not found during phase advance')
    seed.advancePhase(to)
    await this.seedRepo.save(seed)
    this.logger.log(`  Phase advanced to: ${to}`)
  }

  private async seedRuntimeDemo(): Promise<void> {
    // Create a demo workflow execution
    const execution = await this.runtimeService.createExecution(PROJECT_ID, {
      executionType: 'workflow-run',
      workflowId: 'vert-wf-dispatch',
      input: { date: new Date().toISOString(), region: 'LATAM-South' },
    })

    // Transition to running
    await this.runtimeService.updateExecution(execution.id, {
      status: 'running',
      logSummary: 'Processing daily dispatch routing',
    })

    // Create a demo agent task
    const agentExec = await this.runtimeService.createExecution(PROJECT_ID, {
      executionType: 'agent-task',
      agentId: IDS.fieldOpsAgent,
      input: { workOrder: 'WO-2024-001', type: 'maintenance' },
      parentExecutionId: execution.id,
    })

    await this.runtimeService.updateExecution(agentExec.id, {
      status: 'running',
      logSummary: 'Executing field maintenance work order',
    })

    // Complete the agent task
    await this.runtimeService.updateExecution(agentExec.id, {
      status: 'completed',
      output: { result: 'Maintenance completed', duration: '2h 15m' },
      addCost: 0.45,
    })

    // Complete the workflow
    await this.runtimeService.updateExecution(execution.id, {
      status: 'completed',
      output: { routesProcessed: 12, ordersDispatched: 8 },
      addCost: 1.2,
    })

    // Emit timeline demo events
    for (const evt of RUNTIME_DEMO_EVENTS) {
      await this.runtimeService.emitRuntimeEvent(PROJECT_ID, {
        eventType: evt.eventType as Parameters<typeof this.runtimeService.emitRuntimeEvent>[1]['eventType'],
        severity: evt.severity,
        title: evt.title,
        description: evt.description,
        sourceEntityType: evt.sourceEntityType,
        sourceEntityId: evt.sourceEntityId,
        targetEntityType: evt.targetEntityType,
        targetEntityId: evt.targetEntityId,
      })
    }
  }
}
