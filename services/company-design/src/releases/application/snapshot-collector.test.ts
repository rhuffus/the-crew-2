import { describe, it, expect } from 'vitest'
import { SnapshotCollector } from './snapshot-collector'
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
import type { ArtifactRepository } from '../../artifacts/domain/artifact-repository'

function mockCompanyModelRepo(hasModel: boolean): CompanyModelRepository {
  return {
    findByProjectId: async () =>
      hasModel
        ? { projectId: 'p1', purpose: 'Test', type: 'SaaS', scope: 'Global', principles: [], updatedAt: new Date('2026-01-01') }
        : null,
    save: async () => {},
  } as unknown as CompanyModelRepository
}

function mockRepo(items: unknown[] = []) {
  return {
    findByProjectId: async () => items,
    findById: async () => null,
    save: async () => {},
    delete: async () => {},
  }
}

describe('SnapshotCollector', () => {
  it('should collect an empty snapshot', async () => {
    const collector = new SnapshotCollector(
      mockCompanyModelRepo(false) as CompanyModelRepository,
      mockRepo() as unknown as DepartmentRepository,
      mockRepo() as unknown as CapabilityRepository,
      mockRepo() as unknown as ContractRepository,
      mockRepo() as unknown as RoleRepository,
      mockRepo() as unknown as AgentArchetypeRepository,
      mockRepo() as unknown as AgentAssignmentRepository,
      mockRepo() as unknown as SkillRepository,
      mockRepo() as unknown as WorkflowRepository,
      mockRepo() as unknown as PolicyRepository,
      mockRepo() as unknown as ArtifactRepository,
    )

    const snapshot = await collector.collect('p1')
    expect(snapshot.companyModel).toBeNull()
    expect(snapshot.departments).toEqual([])
    expect(snapshot.capabilities).toEqual([])
    expect(snapshot.roles).toEqual([])
    expect(snapshot.agentArchetypes).toEqual([])
    expect(snapshot.agentAssignments).toEqual([])
    expect(snapshot.skills).toEqual([])
    expect(snapshot.contracts).toEqual([])
    expect(snapshot.workflows).toEqual([])
    expect(snapshot.policies).toEqual([])
    expect(snapshot.artifacts).toEqual([])
  })

  it('should collect snapshot with company model', async () => {
    const collector = new SnapshotCollector(
      mockCompanyModelRepo(true) as CompanyModelRepository,
      mockRepo() as unknown as DepartmentRepository,
      mockRepo() as unknown as CapabilityRepository,
      mockRepo() as unknown as ContractRepository,
      mockRepo() as unknown as RoleRepository,
      mockRepo() as unknown as AgentArchetypeRepository,
      mockRepo() as unknown as AgentAssignmentRepository,
      mockRepo() as unknown as SkillRepository,
      mockRepo() as unknown as WorkflowRepository,
      mockRepo() as unknown as PolicyRepository,
      mockRepo() as unknown as ArtifactRepository,
    )

    const snapshot = await collector.collect('p1')
    expect(snapshot.companyModel).not.toBeNull()
    expect(snapshot.companyModel!.purpose).toBe('Test')
  })

  it('should collect departments', async () => {
    const dept = {
      id: 'd1',
      projectId: 'p1',
      name: 'Eng',
      description: 'Engineering',
      mandate: 'Build',
      parentId: null,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    }
    const collector = new SnapshotCollector(
      mockCompanyModelRepo(false) as CompanyModelRepository,
      mockRepo([dept]) as unknown as DepartmentRepository,
      mockRepo() as unknown as CapabilityRepository,
      mockRepo() as unknown as ContractRepository,
      mockRepo() as unknown as RoleRepository,
      mockRepo() as unknown as AgentArchetypeRepository,
      mockRepo() as unknown as AgentAssignmentRepository,
      mockRepo() as unknown as SkillRepository,
      mockRepo() as unknown as WorkflowRepository,
      mockRepo() as unknown as PolicyRepository,
      mockRepo() as unknown as ArtifactRepository,
    )

    const snapshot = await collector.collect('p1')
    expect(snapshot.departments).toHaveLength(1)
    expect(snapshot.departments[0]!.name).toBe('Eng')
  })

  it('should collect capabilities', async () => {
    const cap = {
      id: 'c1',
      projectId: 'p1',
      name: 'API',
      description: 'API dev',
      ownerDepartmentId: 'd1',
      inputs: ['req'],
      outputs: ['resp'],
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    }
    const collector = new SnapshotCollector(
      mockCompanyModelRepo(false) as CompanyModelRepository,
      mockRepo() as unknown as DepartmentRepository,
      mockRepo([cap]) as unknown as CapabilityRepository,
      mockRepo() as unknown as ContractRepository,
      mockRepo() as unknown as RoleRepository,
      mockRepo() as unknown as AgentArchetypeRepository,
      mockRepo() as unknown as AgentAssignmentRepository,
      mockRepo() as unknown as SkillRepository,
      mockRepo() as unknown as WorkflowRepository,
      mockRepo() as unknown as PolicyRepository,
      mockRepo() as unknown as ArtifactRepository,
    )

    const snapshot = await collector.collect('p1')
    expect(snapshot.capabilities).toHaveLength(1)
    expect(snapshot.capabilities[0]!.name).toBe('API')
  })

  it('should collect all entity types in parallel', async () => {
    const contract = {
      id: 'ct1',
      projectId: 'p1',
      name: 'SLA',
      description: 'desc',
      type: 'SLA',
      status: 'active',
      providerId: 'd1',
      providerType: 'department',
      consumerId: 'c1',
      consumerType: 'capability',
      acceptanceCriteria: [],
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    }
    const workflow = {
      id: 'w1',
      projectId: 'p1',
      name: 'Deploy',
      description: 'desc',
      ownerDepartmentId: 'd1',
      status: 'active',
      triggerDescription: 'Push',
      stages: [],
      participants: [],
      contractIds: ['ct1'],
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    }
    const policy = {
      id: 'po1',
      projectId: 'p1',
      name: 'Pol',
      description: 'desc',
      scope: 'global',
      departmentId: null,
      type: 'constraint',
      condition: 'cond',
      enforcement: 'mandatory',
      status: 'active',
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    }
    const collector = new SnapshotCollector(
      mockCompanyModelRepo(true) as CompanyModelRepository,
      mockRepo() as unknown as DepartmentRepository,
      mockRepo() as unknown as CapabilityRepository,
      mockRepo([contract]) as unknown as ContractRepository,
      mockRepo() as unknown as RoleRepository,
      mockRepo() as unknown as AgentArchetypeRepository,
      mockRepo() as unknown as AgentAssignmentRepository,
      mockRepo() as unknown as SkillRepository,
      mockRepo([workflow]) as unknown as WorkflowRepository,
      mockRepo([policy]) as unknown as PolicyRepository,
      mockRepo() as unknown as ArtifactRepository,
    )

    const snapshot = await collector.collect('p1')
    expect(snapshot.companyModel).not.toBeNull()
    expect(snapshot.contracts).toHaveLength(1)
    expect(snapshot.workflows).toHaveLength(1)
    expect(snapshot.policies).toHaveLength(1)
  })
})
