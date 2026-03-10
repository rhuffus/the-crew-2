import { Inject, Injectable } from '@nestjs/common'
import type { ReleaseSnapshotDto } from '@the-crew/shared-types'
import {
  COMPANY_MODEL_REPOSITORY,
  type CompanyModelRepository,
} from '../../company-model/domain/company-model-repository'
import {
  DEPARTMENT_REPOSITORY,
  type DepartmentRepository,
} from '../../departments/domain/department-repository'
import {
  CAPABILITY_REPOSITORY,
  type CapabilityRepository,
} from '../../capabilities/domain/capability-repository'
import {
  CONTRACT_REPOSITORY,
  type ContractRepository,
} from '../../contracts/domain/contract-repository'
import {
  WORKFLOW_REPOSITORY,
  type WorkflowRepository,
} from '../../workflows/domain/workflow-repository'
import {
  ROLE_REPOSITORY,
  type RoleRepository,
} from '../../roles/domain/role-repository'
import {
  AGENT_ARCHETYPE_REPOSITORY,
  type AgentArchetypeRepository,
} from '../../agent-archetypes/domain/agent-archetype-repository'
import {
  AGENT_ASSIGNMENT_REPOSITORY,
  type AgentAssignmentRepository,
} from '../../agent-assignments/domain/agent-assignment-repository'
import {
  SKILL_REPOSITORY,
  type SkillRepository,
} from '../../skills/domain/skill-repository'
import {
  POLICY_REPOSITORY,
  type PolicyRepository,
} from '../../policies/domain/policy-repository'
import { CompanyModelMapper } from '../../company-model/application/company-model.mapper'
import { DepartmentMapper } from '../../departments/application/department.mapper'
import { CapabilityMapper } from '../../capabilities/application/capability.mapper'
import { ContractMapper } from '../../contracts/application/contract.mapper'
import { WorkflowMapper } from '../../workflows/application/workflow.mapper'
import { RoleMapper } from '../../roles/application/role.mapper'
import { AgentArchetypeMapper } from '../../agent-archetypes/application/agent-archetype.mapper'
import { AgentAssignmentMapper } from '../../agent-assignments/application/agent-assignment.mapper'
import { SkillMapper } from '../../skills/application/skill.mapper'
import { PolicyMapper } from '../../policies/application/policy.mapper'

@Injectable()
export class SnapshotCollector {
  constructor(
    @Inject(COMPANY_MODEL_REPOSITORY) private readonly companyModelRepo: CompanyModelRepository,
    @Inject(DEPARTMENT_REPOSITORY) private readonly departmentRepo: DepartmentRepository,
    @Inject(CAPABILITY_REPOSITORY) private readonly capabilityRepo: CapabilityRepository,
    @Inject(CONTRACT_REPOSITORY) private readonly contractRepo: ContractRepository,
    @Inject(ROLE_REPOSITORY) private readonly roleRepo: RoleRepository,
    @Inject(AGENT_ARCHETYPE_REPOSITORY) private readonly agentArchetypeRepo: AgentArchetypeRepository,
    @Inject(AGENT_ASSIGNMENT_REPOSITORY) private readonly agentAssignmentRepo: AgentAssignmentRepository,
    @Inject(SKILL_REPOSITORY) private readonly skillRepo: SkillRepository,
    @Inject(WORKFLOW_REPOSITORY) private readonly workflowRepo: WorkflowRepository,
    @Inject(POLICY_REPOSITORY) private readonly policyRepo: PolicyRepository,
  ) {}

  async collect(projectId: string): Promise<ReleaseSnapshotDto> {
    const [companyModel, departments, capabilities, roles, agentArchetypes, agentAssignments, skills, contracts, workflows, policies] =
      await Promise.all([
        this.companyModelRepo.findByProjectId(projectId),
        this.departmentRepo.findByProjectId(projectId),
        this.capabilityRepo.findByProjectId(projectId),
        this.roleRepo.findByProjectId(projectId),
        this.agentArchetypeRepo.findByProjectId(projectId),
        this.agentAssignmentRepo.findByProjectId(projectId),
        this.skillRepo.findByProjectId(projectId),
        this.contractRepo.findByProjectId(projectId),
        this.workflowRepo.findByProjectId(projectId),
        this.policyRepo.findByProjectId(projectId),
      ])

    return {
      companyModel: companyModel ? CompanyModelMapper.toDto(companyModel) : null,
      departments: departments.map(DepartmentMapper.toDto),
      capabilities: capabilities.map(CapabilityMapper.toDto),
      roles: roles.map(RoleMapper.toDto),
      agentArchetypes: agentArchetypes.map(AgentArchetypeMapper.toDto),
      agentAssignments: agentAssignments.map(AgentAssignmentMapper.toDto),
      skills: skills.map(SkillMapper.toDto),
      contracts: contracts.map(ContractMapper.toDto),
      workflows: workflows.map(WorkflowMapper.toDto),
      policies: policies.map(PolicyMapper.toDto),
    }
  }
}
