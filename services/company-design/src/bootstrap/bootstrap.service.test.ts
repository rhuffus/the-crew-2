import { describe, it, expect, beforeEach } from 'vitest'
import { LegacyBootstrapService } from './legacy-bootstrap.service'
import { InMemoryCompanyModelRepository } from '../company-model/infra/in-memory-company-model.repository'
import { InMemoryDepartmentRepository } from '../departments/infra/in-memory-department.repository'
import { InMemoryCapabilityRepository } from '../capabilities/infra/in-memory-capability.repository'
import { InMemoryRoleRepository } from '../roles/infra/in-memory-role.repository'
import { InMemorySkillRepository } from '../skills/infra/in-memory-skill.repository'
import { InMemoryAgentArchetypeRepository } from '../agent-archetypes/infra/in-memory-agent-archetype.repository'
import { InMemoryAgentAssignmentRepository } from '../agent-assignments/infra/in-memory-agent-assignment.repository'
import { InMemoryContractRepository } from '../contracts/infra/in-memory-contract.repository'
import { InMemoryWorkflowRepository } from '../workflows/infra/in-memory-workflow.repository'
import { InMemoryPolicyRepository } from '../policies/infra/in-memory-policy.repository'
import { InMemoryArtifactRepository } from '../artifacts/infra/in-memory-artifact.repository'
import { CompanyModel } from '../company-model/domain/company-model'
import { VERTICALER_PROJECT_ID } from '@the-crew/shared-types'
import { DEPT, CAP, ROLE, SKILL, ARCH, ASGN, CONT, WKFL, PLCY, ARTF } from './verticaler-seed'

describe('LegacyBootstrapService (company-design)', () => {
  let service: LegacyBootstrapService
  let companyModelRepo: InMemoryCompanyModelRepository
  let departmentRepo: InMemoryDepartmentRepository
  let capabilityRepo: InMemoryCapabilityRepository
  let roleRepo: InMemoryRoleRepository
  let skillRepo: InMemorySkillRepository
  let archetypeRepo: InMemoryAgentArchetypeRepository
  let assignmentRepo: InMemoryAgentAssignmentRepository
  let contractRepo: InMemoryContractRepository
  let workflowRepo: InMemoryWorkflowRepository
  let policyRepo: InMemoryPolicyRepository
  let artifactRepo: InMemoryArtifactRepository

  beforeEach(() => {
    companyModelRepo = new InMemoryCompanyModelRepository()
    departmentRepo = new InMemoryDepartmentRepository()
    capabilityRepo = new InMemoryCapabilityRepository()
    roleRepo = new InMemoryRoleRepository()
    skillRepo = new InMemorySkillRepository()
    archetypeRepo = new InMemoryAgentArchetypeRepository()
    assignmentRepo = new InMemoryAgentAssignmentRepository()
    contractRepo = new InMemoryContractRepository()
    workflowRepo = new InMemoryWorkflowRepository()
    policyRepo = new InMemoryPolicyRepository()
    artifactRepo = new InMemoryArtifactRepository()

    service = new LegacyBootstrapService(
      companyModelRepo,
      departmentRepo,
      capabilityRepo,
      roleRepo,
      skillRepo,
      archetypeRepo,
      assignmentRepo,
      contractRepo,
      workflowRepo,
      policyRepo,
      artifactRepo,
    )
  })

  it('should seed Verticaler company model when instance is empty', async () => {
    await service.onModuleInit()

    const model = await companyModelRepo.findByProjectId(VERTICALER_PROJECT_ID)
    expect(model).not.toBeNull()
    expect(model!.purpose).toContain('ascensores')
    expect(model!.type).toBe('SaaS B2B vertical')
    expect(model!.scope).toBe('España primero, multi-sede a futuro')
    expect(model!.principles).toHaveLength(6)
  })

  it('should skip bootstrap when company model already exists', async () => {
    const existing = CompanyModel.createEmpty(VERTICALER_PROJECT_ID)
    existing.update({ purpose: 'custom purpose' })
    await companyModelRepo.save(existing)

    await service.onModuleInit()

    const model = await companyModelRepo.findByProjectId(VERTICALER_PROJECT_ID)
    expect(model!.purpose).toBe('custom purpose')

    const departments = await departmentRepo.findByProjectId(VERTICALER_PROJECT_ID)
    expect(departments).toHaveLength(0)
  })

  it('should be idempotent — running twice produces the same state', async () => {
    await service.onModuleInit()
    const firstDepts = await departmentRepo.findByProjectId(VERTICALER_PROJECT_ID)

    await service.onModuleInit()
    const secondDepts = await departmentRepo.findByProjectId(VERTICALER_PROJECT_ID)

    expect(secondDepts).toHaveLength(firstDepts.length)
  })

  describe('departments', () => {
    it('should create 9 departments', async () => {
      await service.onModuleInit()
      const departments = await departmentRepo.findByProjectId(VERTICALER_PROJECT_ID)
      expect(departments).toHaveLength(9)
    })

    it('should include all required departments from spec', async () => {
      await service.onModuleInit()
      const departments = await departmentRepo.findByProjectId(VERTICALER_PROJECT_ID)
      const names = departments.map((d) => d.name)
      expect(names).toContain('Executive')
      expect(names).toContain('Product')
      expect(names).toContain('Engineering')
      expect(names).toContain('Design')
      expect(names).toContain('Operations')
      expect(names).toContain('Customer Success')
      expect(names).toContain('Sales')
      expect(names).toContain('Finance & Admin')
      expect(names).toContain('Compliance & Quality')
    })

    it('should use deterministic IDs', async () => {
      await service.onModuleInit()
      const dept = await departmentRepo.findById(DEPT.ENGINEERING)
      expect(dept).not.toBeNull()
      expect(dept!.name).toBe('Engineering')
    })
  })

  describe('capabilities', () => {
    it('should create 16 capabilities', async () => {
      await service.onModuleInit()
      const capabilities = await capabilityRepo.findByProjectId(VERTICALER_PROJECT_ID)
      expect(capabilities).toHaveLength(16)
    })

    it('should link capabilities to departments', async () => {
      await service.onModuleInit()
      const cap = await capabilityRepo.findById(CAP.SOFTWARE_IMPLEMENTATION)
      expect(cap).not.toBeNull()
      expect(cap!.ownerDepartmentId).toBe(DEPT.ENGINEERING)
    })
  })

  describe('roles', () => {
    it('should create 15 roles', async () => {
      await service.onModuleInit()
      const roles = await roleRepo.findByProjectId(VERTICALER_PROJECT_ID)
      expect(roles).toHaveLength(15)
    })

    it('should link roles to departments', async () => {
      await service.onModuleInit()
      const role = await roleRepo.findById(ROLE.QA_LEAD)
      expect(role).not.toBeNull()
      expect(role!.departmentId).toBe(DEPT.ENGINEERING)
    })

    it('should link roles to capabilities', async () => {
      await service.onModuleInit()
      const role = await roleRepo.findById(ROLE.HEAD_OF_PRODUCT)
      expect(role!.capabilityIds).toContain(CAP.PRODUCT_DISCOVERY)
      expect(role!.capabilityIds).toContain(CAP.PRD_DEFINITION)
    })
  })

  describe('skills', () => {
    it('should create 14 skills', async () => {
      await service.onModuleInit()
      const skills = await skillRepo.findByProjectId(VERTICALER_PROJECT_ID)
      expect(skills).toHaveLength(14)
    })

    it('should link skills to compatible roles', async () => {
      await service.onModuleInit()
      const skill = await skillRepo.findById(SKILL.IMPLEMENT_FEATURE)
      expect(skill!.compatibleRoleIds).toContain(ROLE.FRONTEND_ENGINEER)
      expect(skill!.compatibleRoleIds).toContain(ROLE.BACKEND_ENGINEER)
      expect(skill!.compatibleRoleIds).toContain(ROLE.TECH_LEAD)
    })
  })

  describe('agent archetypes', () => {
    it('should create 14 archetypes', async () => {
      await service.onModuleInit()
      const archetypes = await archetypeRepo.findByProjectId(VERTICALER_PROJECT_ID)
      expect(archetypes).toHaveLength(14)
    })

    it('should link archetypes to roles and departments', async () => {
      await service.onModuleInit()
      const arch = await archetypeRepo.findById(ARCH.FRONTEND_BUILDER)
      expect(arch!.roleId).toBe(ROLE.FRONTEND_ENGINEER)
      expect(arch!.departmentId).toBe(DEPT.ENGINEERING)
    })

    it('should link archetypes to skills', async () => {
      await service.onModuleInit()
      const arch = await archetypeRepo.findById(ARCH.QA_REVIEWER)
      expect(arch!.skillIds).toContain(SKILL.DESIGN_TEST_PLAN)
      expect(arch!.skillIds).toContain(SKILL.VALIDATE_RELEASE)
    })
  })

  describe('agent assignments', () => {
    it('should create 14 assignments (one per archetype)', async () => {
      await service.onModuleInit()
      const assignments = await assignmentRepo.findByProjectId(VERTICALER_PROJECT_ID)
      expect(assignments).toHaveLength(14)
    })

    it('should link assignments to archetypes', async () => {
      await service.onModuleInit()
      const assignment = await assignmentRepo.findById(ASGN.FRONTEND_BUILDER)
      expect(assignment!.archetypeId).toBe(ARCH.FRONTEND_BUILDER)
      expect(assignment!.status).toBe('active')
    })
  })

  describe('contracts', () => {
    it('should create 7 contracts', async () => {
      await service.onModuleInit()
      const contracts = await contractRepo.findByProjectId(VERTICALER_PROJECT_ID)
      expect(contracts).toHaveLength(7)
    })

    it('should include both department and capability party types', async () => {
      await service.onModuleInit()
      const deptContract = await contractRepo.findById(CONT.PRD_TO_DESIGN)
      expect(deptContract!.providerType).toBe('department')
      expect(deptContract!.consumerType).toBe('department')

      const capContract = await contractRepo.findById(CONT.ENGINEERING_TO_QA)
      expect(capContract!.providerType).toBe('capability')
      expect(capContract!.consumerType).toBe('capability')
    })

    it('should include acceptance criteria', async () => {
      await service.onModuleInit()
      const contract = await contractRepo.findById(CONT.CS_TO_OPS)
      expect(contract!.acceptanceCriteria.length).toBeGreaterThan(0)
    })
  })

  describe('workflows', () => {
    it('should create 4 workflows', async () => {
      await service.onModuleInit()
      const workflows = await workflowRepo.findByProjectId(VERTICALER_PROJECT_ID)
      expect(workflows).toHaveLength(4)
    })

    it('should create Product Delivery with 8 stages', async () => {
      await service.onModuleInit()
      const wf = await workflowRepo.findById(WKFL.PRODUCT_DELIVERY)
      expect(wf!.stages).toHaveLength(8)
      expect(wf!.stages[0]!.name).toBe('PRD Draft')
      expect(wf!.stages[7]!.name).toBe('Release')
    })

    it('should create Incident Management with 7 stages', async () => {
      await service.onModuleInit()
      const wf = await workflowRepo.findById(WKFL.INCIDENT_MANAGEMENT)
      expect(wf!.stages).toHaveLength(7)
    })

    it('should create Maintenance Contract Lifecycle with 6 stages', async () => {
      await service.onModuleInit()
      const wf = await workflowRepo.findById(WKFL.MAINTENANCE_LIFECYCLE)
      expect(wf!.stages).toHaveLength(6)
    })

    it('should create Inspection / Compliance with 6 stages', async () => {
      await service.onModuleInit()
      const wf = await workflowRepo.findById(WKFL.INSPECTION_COMPLIANCE)
      expect(wf!.stages).toHaveLength(6)
    })

    it('should link workflows to participants', async () => {
      await service.onModuleInit()
      const wf = await workflowRepo.findById(WKFL.PRODUCT_DELIVERY)
      expect(wf!.participants).toHaveLength(8)
      const participantIds = wf!.participants.map((p) => p.participantId)
      expect(participantIds).toContain(ROLE.HEAD_OF_PRODUCT)
      expect(participantIds).toContain(ROLE.QA_LEAD)
    })

    it('should link workflows to contracts', async () => {
      await service.onModuleInit()
      const wf = await workflowRepo.findById(WKFL.PRODUCT_DELIVERY)
      expect(wf!.contractIds).toHaveLength(4)
      expect(wf!.contractIds).toContain(CONT.PRD_TO_DESIGN)
    })
  })

  describe('policies', () => {
    it('should create 5 policies', async () => {
      await service.onModuleInit()
      const policies = await policyRepo.findByProjectId(VERTICALER_PROJECT_ID)
      expect(policies).toHaveLength(5)
    })

    it('should include both global and department-scoped policies', async () => {
      await service.onModuleInit()
      const global = await policyRepo.findById(PLCY.RELEASE_APPROVAL)
      expect(global!.scope).toBe('global')

      const dept = await policyRepo.findById(PLCY.PRODUCTION_CHANGE_GATE)
      expect(dept!.scope).toBe('department')
      expect(dept!.departmentId).toBe(DEPT.ENGINEERING)
    })

    it('should include different policy types', async () => {
      await service.onModuleInit()
      const policies = await policyRepo.findByProjectId(VERTICALER_PROJECT_ID)
      const types = [...new Set(policies.map((p) => p.type))]
      expect(types).toContain('approval-gate')
      expect(types).toContain('rule')
      expect(types).toContain('constraint')
    })
  })

  describe('artifacts', () => {
    it('should create 12 artifacts', async () => {
      await service.onModuleInit()
      const artifacts = await artifactRepo.findByProjectId(VERTICALER_PROJECT_ID)
      expect(artifacts).toHaveLength(12)
    })

    it('should include all artifact types from spec', async () => {
      await service.onModuleInit()
      const artifacts = await artifactRepo.findByProjectId(VERTICALER_PROJECT_ID)
      const types = [...new Set(artifacts.map((a) => a.type))]
      expect(types).toContain('document')
      expect(types).toContain('deliverable')
      expect(types).toContain('data')
      expect(types).toContain('decision')
    })

    it('should link artifacts to producers and consumers', async () => {
      await service.onModuleInit()
      const prd = await artifactRepo.findById(ARTF.PRD)
      expect(prd!.producerId).toBe(DEPT.PRODUCT)
      expect(prd!.producerType).toBe('department')
      expect(prd!.consumerIds).toContain(DEPT.DESIGN)
      expect(prd!.consumerIds).toContain(DEPT.ENGINEERING)
    })

    it('should support capability as producer', async () => {
      await service.onModuleInit()
      const qa = await artifactRepo.findById(ARTF.QA_REPORT)
      expect(qa!.producerId).toBe(CAP.QA_VALIDATION)
      expect(qa!.producerType).toBe('capability')
    })
  })

  describe('cross-entity relationships', () => {
    it('should have consistent department references across all entities', async () => {
      await service.onModuleInit()

      const deptIds = new Set((await departmentRepo.findByProjectId(VERTICALER_PROJECT_ID)).map((d) => d.id))
      const roles = await roleRepo.findByProjectId(VERTICALER_PROJECT_ID)
      for (const role of roles) {
        expect(deptIds.has(role.departmentId)).toBe(true)
      }
    })

    it('should have consistent capability references in roles', async () => {
      await service.onModuleInit()

      const capIds = new Set((await capabilityRepo.findByProjectId(VERTICALER_PROJECT_ID)).map((c) => c.id))
      const roles = await roleRepo.findByProjectId(VERTICALER_PROJECT_ID)
      for (const role of roles) {
        for (const capId of role.capabilityIds) {
          expect(capIds.has(capId)).toBe(true)
        }
      }
    })

    it('should have consistent role references in archetypes', async () => {
      await service.onModuleInit()

      const roleIds = new Set((await roleRepo.findByProjectId(VERTICALER_PROJECT_ID)).map((r) => r.id))
      const archetypes = await archetypeRepo.findByProjectId(VERTICALER_PROJECT_ID)
      for (const arch of archetypes) {
        expect(roleIds.has(arch.roleId)).toBe(true)
      }
    })

    it('should have consistent skill references in archetypes', async () => {
      await service.onModuleInit()

      const skillIds = new Set((await skillRepo.findByProjectId(VERTICALER_PROJECT_ID)).map((s) => s.id))
      const archetypes = await archetypeRepo.findByProjectId(VERTICALER_PROJECT_ID)
      for (const arch of archetypes) {
        for (const sid of arch.skillIds) {
          expect(skillIds.has(sid)).toBe(true)
        }
      }
    })

    it('should have consistent archetype references in assignments', async () => {
      await service.onModuleInit()

      const archIds = new Set((await archetypeRepo.findByProjectId(VERTICALER_PROJECT_ID)).map((a) => a.id))
      const assignments = await assignmentRepo.findByProjectId(VERTICALER_PROJECT_ID)
      for (const asgn of assignments) {
        expect(archIds.has(asgn.archetypeId)).toBe(true)
      }
    })
  })

  describe('entity counts summary', () => {
    it('should populate all entity types with expected counts', async () => {
      await service.onModuleInit()

      expect(await companyModelRepo.findByProjectId(VERTICALER_PROJECT_ID)).not.toBeNull()
      expect((await departmentRepo.findByProjectId(VERTICALER_PROJECT_ID)).length).toBe(9)
      expect((await capabilityRepo.findByProjectId(VERTICALER_PROJECT_ID)).length).toBe(16)
      expect((await roleRepo.findByProjectId(VERTICALER_PROJECT_ID)).length).toBe(15)
      expect((await skillRepo.findByProjectId(VERTICALER_PROJECT_ID)).length).toBe(14)
      expect((await archetypeRepo.findByProjectId(VERTICALER_PROJECT_ID)).length).toBe(14)
      expect((await assignmentRepo.findByProjectId(VERTICALER_PROJECT_ID)).length).toBe(14)
      expect((await contractRepo.findByProjectId(VERTICALER_PROJECT_ID)).length).toBe(7)
      expect((await workflowRepo.findByProjectId(VERTICALER_PROJECT_ID)).length).toBe(4)
      expect((await policyRepo.findByProjectId(VERTICALER_PROJECT_ID)).length).toBe(5)
      expect((await artifactRepo.findByProjectId(VERTICALER_PROJECT_ID)).length).toBe(12)
    })
  })
})
