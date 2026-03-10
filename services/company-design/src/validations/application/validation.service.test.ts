import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ValidationService } from './validation.service'
import { ValidationEngine } from './validation-engine'
import type { CompanyModelRepository } from '../../company-model/domain/company-model-repository'
import type { DepartmentRepository } from '../../departments/domain/department-repository'
import type { CapabilityRepository } from '../../capabilities/domain/capability-repository'
import type { ContractRepository } from '../../contracts/domain/contract-repository'
import type { WorkflowRepository } from '../../workflows/domain/workflow-repository'
import type { RoleRepository } from '../../roles/domain/role-repository'
import type { AgentArchetypeRepository } from '../../agent-archetypes/domain/agent-archetype-repository'
import type { AgentAssignmentRepository } from '../../agent-assignments/domain/agent-assignment-repository'
import type { SkillRepository } from '../../skills/domain/skill-repository'
import type { PolicyRepository } from '../../policies/domain/policy-repository'
import { CompanyModel } from '../../company-model/domain/company-model'

function createMockRepos() {
  const companyModel = CompanyModel.reconstitute('p1', {
    purpose: 'Test purpose',
    type: 'SaaS',
    scope: 'Global',
    principles: [],
    updatedAt: new Date('2026-01-01'),
  })

  return {
    companyModelRepo: {
      findByProjectId: vi.fn().mockResolvedValue(companyModel),
      save: vi.fn(),
    } as unknown as CompanyModelRepository,
    departmentRepo: {
      findByProjectId: vi.fn().mockResolvedValue([]),
      findById: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    } as unknown as DepartmentRepository,
    capabilityRepo: {
      findByProjectId: vi.fn().mockResolvedValue([]),
      findById: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    } as unknown as CapabilityRepository,
    contractRepo: {
      findByProjectId: vi.fn().mockResolvedValue([]),
      findById: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    } as unknown as ContractRepository,
    roleRepo: {
      findByProjectId: vi.fn().mockResolvedValue([]),
      findById: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    } as unknown as RoleRepository,
    agentArchetypeRepo: {
      findByProjectId: vi.fn().mockResolvedValue([]),
      findById: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    } as unknown as AgentArchetypeRepository,
    agentAssignmentRepo: {
      findByProjectId: vi.fn().mockResolvedValue([]),
      findById: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    } as unknown as AgentAssignmentRepository,
    skillRepo: {
      findByProjectId: vi.fn().mockResolvedValue([]),
      findById: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    } as unknown as SkillRepository,
    workflowRepo: {
      findByProjectId: vi.fn().mockResolvedValue([]),
      findById: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    } as unknown as WorkflowRepository,
    policyRepo: {
      findByProjectId: vi.fn().mockResolvedValue([]),
      findById: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    } as unknown as PolicyRepository,
  }
}

describe('ValidationService', () => {
  let service: ValidationService
  let repos: ReturnType<typeof createMockRepos>

  beforeEach(() => {
    repos = createMockRepos()
    service = new ValidationService(
      repos.companyModelRepo,
      repos.departmentRepo,
      repos.capabilityRepo,
      repos.contractRepo,
      repos.roleRepo,
      repos.agentArchetypeRepo,
      repos.agentAssignmentRepo,
      repos.skillRepo,
      repos.workflowRepo,
      repos.policyRepo,
      new ValidationEngine(),
    )
  })

  it('should return validation result with projectId', async () => {
    const result = await service.validate('p1')
    expect(result.projectId).toBe('p1')
  })

  it('should return no issues for valid data', async () => {
    const result = await service.validate('p1')
    expect(result.issues).toEqual([])
    expect(result.summary).toEqual({ errors: 0, warnings: 0 })
  })

  it('should collect data from all repositories', async () => {
    await service.validate('p1')
    expect(repos.companyModelRepo.findByProjectId).toHaveBeenCalledWith('p1')
    expect(repos.departmentRepo.findByProjectId).toHaveBeenCalledWith('p1')
    expect(repos.capabilityRepo.findByProjectId).toHaveBeenCalledWith('p1')
    expect(repos.contractRepo.findByProjectId).toHaveBeenCalledWith('p1')
    expect(repos.roleRepo.findByProjectId).toHaveBeenCalledWith('p1')
    expect(repos.agentArchetypeRepo.findByProjectId).toHaveBeenCalledWith('p1')
    expect(repos.agentAssignmentRepo.findByProjectId).toHaveBeenCalledWith('p1')
    expect(repos.skillRepo.findByProjectId).toHaveBeenCalledWith('p1')
    expect(repos.workflowRepo.findByProjectId).toHaveBeenCalledWith('p1')
    expect(repos.policyRepo.findByProjectId).toHaveBeenCalledWith('p1')
  })

  it('should report errors when company model has no purpose', async () => {
    vi.mocked(repos.companyModelRepo.findByProjectId).mockResolvedValue(null)
    const result = await service.validate('p1')
    expect(result.issues).toHaveLength(1)
    expect(result.issues[0]!.severity).toBe('error')
    expect(result.summary).toEqual({ errors: 1, warnings: 0 })
  })

  it('should report summary counts correctly', async () => {
    vi.mocked(repos.companyModelRepo.findByProjectId).mockResolvedValue(null)
    const result = await service.validate('p1')
    expect(result.summary.errors).toBe(1)
    expect(result.summary.warnings).toBe(0)
  })
})
