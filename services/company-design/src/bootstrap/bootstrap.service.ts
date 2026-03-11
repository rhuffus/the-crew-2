import { Inject, Injectable, Logger, type OnModuleInit } from '@nestjs/common'
import { VERTICALER_PROJECT_ID } from '@the-crew/shared-types'
import { CompanyModel } from '../company-model/domain/company-model'
import {
  COMPANY_MODEL_REPOSITORY,
  type CompanyModelRepository,
} from '../company-model/domain/company-model-repository'
import { Department } from '../departments/domain/department'
import {
  DEPARTMENT_REPOSITORY,
  type DepartmentRepository,
} from '../departments/domain/department-repository'
import { Capability } from '../capabilities/domain/capability'
import {
  CAPABILITY_REPOSITORY,
  type CapabilityRepository,
} from '../capabilities/domain/capability-repository'
import { Role } from '../roles/domain/role'
import {
  ROLE_REPOSITORY,
  type RoleRepository,
} from '../roles/domain/role-repository'
import { Skill } from '../skills/domain/skill'
import {
  SKILL_REPOSITORY,
  type SkillRepository,
} from '../skills/domain/skill-repository'
import { AgentArchetype } from '../agent-archetypes/domain/agent-archetype'
import {
  AGENT_ARCHETYPE_REPOSITORY,
  type AgentArchetypeRepository,
} from '../agent-archetypes/domain/agent-archetype-repository'
import { AgentAssignment } from '../agent-assignments/domain/agent-assignment'
import {
  AGENT_ASSIGNMENT_REPOSITORY,
  type AgentAssignmentRepository,
} from '../agent-assignments/domain/agent-assignment-repository'
import { Contract } from '../contracts/domain/contract'
import {
  CONTRACT_REPOSITORY,
  type ContractRepository,
} from '../contracts/domain/contract-repository'
import { Workflow } from '../workflows/domain/workflow'
import {
  WORKFLOW_REPOSITORY,
  type WorkflowRepository,
} from '../workflows/domain/workflow-repository'
import { Policy } from '../policies/domain/policy'
import {
  POLICY_REPOSITORY,
  type PolicyRepository,
} from '../policies/domain/policy-repository'
import { Artifact } from '../artifacts/domain/artifact'
import {
  ARTIFACT_REPOSITORY,
  type ArtifactRepository,
} from '../artifacts/domain/artifact-repository'
import {
  SEED_DEPARTMENTS,
  SEED_CAPABILITIES,
  SEED_ROLES,
  SEED_SKILLS,
  SEED_AGENT_ARCHETYPES,
  SEED_AGENT_ASSIGNMENTS,
  SEED_CONTRACTS,
  SEED_WORKFLOWS,
  SEED_POLICIES,
  SEED_ARTIFACTS,
} from './verticaler-seed'

@Injectable()
export class BootstrapService implements OnModuleInit {
  private readonly logger = new Logger(BootstrapService.name)

  constructor(
    @Inject(COMPANY_MODEL_REPOSITORY) private readonly companyModelRepo: CompanyModelRepository,
    @Inject(DEPARTMENT_REPOSITORY) private readonly departmentRepo: DepartmentRepository,
    @Inject(CAPABILITY_REPOSITORY) private readonly capabilityRepo: CapabilityRepository,
    @Inject(ROLE_REPOSITORY) private readonly roleRepo: RoleRepository,
    @Inject(SKILL_REPOSITORY) private readonly skillRepo: SkillRepository,
    @Inject(AGENT_ARCHETYPE_REPOSITORY) private readonly archetypeRepo: AgentArchetypeRepository,
    @Inject(AGENT_ASSIGNMENT_REPOSITORY) private readonly assignmentRepo: AgentAssignmentRepository,
    @Inject(CONTRACT_REPOSITORY) private readonly contractRepo: ContractRepository,
    @Inject(WORKFLOW_REPOSITORY) private readonly workflowRepo: WorkflowRepository,
    @Inject(POLICY_REPOSITORY) private readonly policyRepo: PolicyRepository,
    @Inject(ARTIFACT_REPOSITORY) private readonly artifactRepo: ArtifactRepository,
  ) {}

  async onModuleInit(): Promise<void> {
    const existing = await this.companyModelRepo.findByProjectId(VERTICALER_PROJECT_ID)
    if (existing) {
      this.logger.log('Verticaler already seeded, skipping bootstrap')
      return
    }

    this.logger.log('Empty instance detected — seeding Verticaler')

    await this.seedCompanyModel()
    await this.seedDepartments()
    await this.seedCapabilities()
    await this.seedRoles()
    await this.seedSkills()
    await this.seedAgentArchetypes()
    await this.seedAgentAssignments()
    await this.seedContracts()
    await this.seedWorkflows()
    await this.seedPolicies()
    await this.seedArtifacts()

    this.logger.log('Verticaler seed complete — 9 departments, 16 capabilities, 15 roles, 14 skills, 14 archetypes, 14 assignments, 7 contracts, 4 workflows, 5 policies, 12 artifacts')
  }

  private async seedCompanyModel(): Promise<void> {
    const model = CompanyModel.createEmpty(VERTICALER_PROJECT_ID)
    model.update({
      purpose:
        'Construir el sistema operativo para empresas de ascensores, conectando mantenimiento, incidencias, inspecciones, técnicos, contratos y facturación en una única plataforma.',
      type: 'SaaS B2B vertical',
      scope: 'España primero, multi-sede a futuro',
      principles: [
        'Trazabilidad completa',
        'Operaciones primero',
        'Claridad contractual entre áreas',
        'Seguridad y compliance visibles',
        'Automatización sin perder supervisión',
        'Visual-first para comprender la empresa',
      ],
    })
    await this.companyModelRepo.save(model)
  }

  private async seedDepartments(): Promise<void> {
    for (const data of SEED_DEPARTMENTS) {
      await this.departmentRepo.save(Department.create(data))
    }
  }

  private async seedCapabilities(): Promise<void> {
    for (const data of SEED_CAPABILITIES) {
      await this.capabilityRepo.save(Capability.create(data))
    }
  }

  private async seedRoles(): Promise<void> {
    for (const data of SEED_ROLES) {
      await this.roleRepo.save(Role.create(data))
    }
  }

  private async seedSkills(): Promise<void> {
    for (const data of SEED_SKILLS) {
      await this.skillRepo.save(Skill.create(data))
    }
  }

  private async seedAgentArchetypes(): Promise<void> {
    for (const data of SEED_AGENT_ARCHETYPES) {
      await this.archetypeRepo.save(AgentArchetype.create(data))
    }
  }

  private async seedAgentAssignments(): Promise<void> {
    for (const data of SEED_AGENT_ASSIGNMENTS) {
      await this.assignmentRepo.save(AgentAssignment.create(data))
    }
  }

  private async seedContracts(): Promise<void> {
    for (const data of SEED_CONTRACTS) {
      await this.contractRepo.save(Contract.create(data))
    }
  }

  private async seedWorkflows(): Promise<void> {
    for (const data of SEED_WORKFLOWS) {
      await this.workflowRepo.save(Workflow.create(data))
    }
  }

  private async seedPolicies(): Promise<void> {
    for (const data of SEED_POLICIES) {
      await this.policyRepo.save(Policy.create(data))
    }
  }

  private async seedArtifacts(): Promise<void> {
    for (const data of SEED_ARTIFACTS) {
      await this.artifactRepo.save(Artifact.create(data))
    }
  }
}
