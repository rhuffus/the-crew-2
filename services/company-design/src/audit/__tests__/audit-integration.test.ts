import { describe, it, expect, beforeEach } from 'vitest'
import { AuditService } from '../application/audit.service'
import { InMemoryAuditRepository } from '../infra/in-memory-audit.repository'
import { DepartmentService } from '../../departments/application/department.service'
import { InMemoryDepartmentRepository } from '../../departments/infra/in-memory-department.repository'
import { CapabilityService } from '../../capabilities/application/capability.service'
import { InMemoryCapabilityRepository } from '../../capabilities/infra/in-memory-capability.repository'
import { PolicyService } from '../../policies/application/policy.service'
import { InMemoryPolicyRepository } from '../../policies/infra/in-memory-policy.repository'
import { ContractService } from '../../contracts/application/contract.service'
import { InMemoryContractRepository } from '../../contracts/infra/in-memory-contract.repository'
import { RoleService } from '../../roles/application/role.service'
import { InMemoryRoleRepository } from '../../roles/infra/in-memory-role.repository'
import { SkillService } from '../../skills/application/skill.service'
import { InMemorySkillRepository } from '../../skills/infra/in-memory-skill.repository'

describe('Audit Integration', () => {
  let auditService: AuditService
  let auditRepo: InMemoryAuditRepository

  beforeEach(() => {
    auditRepo = new InMemoryAuditRepository()
    auditService = new AuditService(auditRepo)
  })

  describe('DepartmentService audit', () => {
    let deptService: DepartmentService

    beforeEach(() => {
      deptService = new DepartmentService(new InMemoryDepartmentRepository(), auditService)
    })

    it('should record audit entry on create', async () => {
      await deptService.create('p1', { name: 'Engineering', description: 'Eng dept', mandate: 'Build' })
      const entries = await auditService.listByProject('p1')
      expect(entries).toHaveLength(1)
      expect(entries[0]!.entityType).toBe('department')
      expect(entries[0]!.entityName).toBe('Engineering')
      expect(entries[0]!.action).toBe('created')
    })

    it('should record audit entry on update', async () => {
      const dept = await deptService.create('p1', { name: 'Eng', description: 'Eng dept', mandate: 'Build' })
      await deptService.update(dept.id, { name: 'Engineering' })
      const entries = await auditService.listByProject('p1')
      expect(entries).toHaveLength(2)
      const updateEntry = entries.find((e) => e.action === 'updated')!
      expect(updateEntry.entityName).toBe('Engineering')
      expect(updateEntry.changes).toEqual({ name: 'Engineering' })
    })

    it('should record audit entry on delete', async () => {
      const dept = await deptService.create('p1', { name: 'Engineering', description: 'Eng dept', mandate: 'Build' })
      await deptService.remove(dept.id)
      const entries = await auditService.listByProject('p1')
      expect(entries).toHaveLength(2)
      const deleteEntry = entries.find((e) => e.action === 'deleted')!
      expect(deleteEntry.entityName).toBe('Engineering')
    })
  })

  describe('CapabilityService audit', () => {
    let capService: CapabilityService

    beforeEach(() => {
      capService = new CapabilityService(new InMemoryCapabilityRepository(), auditService)
    })

    it('should record audit entry on create', async () => {
      await capService.create('p1', { name: 'API Design', description: 'Design APIs' })
      const entries = await auditService.listByProject('p1')
      expect(entries).toHaveLength(1)
      expect(entries[0]!.entityType).toBe('capability')
      expect(entries[0]!.action).toBe('created')
    })

    it('should record audit entry on update', async () => {
      const cap = await capService.create('p1', { name: 'API', description: 'APIs' })
      await capService.update(cap.id, { name: 'API Design' })
      const entries = await auditService.listByProject('p1')
      const updateEntry = entries.find((e) => e.action === 'updated')!
      expect(updateEntry.entityType).toBe('capability')
      expect(updateEntry.changes).toEqual({ name: 'API Design' })
    })

    it('should record audit entry on delete', async () => {
      const cap = await capService.create('p1', { name: 'API', description: 'APIs' })
      await capService.remove(cap.id)
      const entries = await auditService.listByProject('p1')
      expect(entries.find((e) => e.action === 'deleted')).toBeDefined()
    })
  })

  describe('PolicyService audit', () => {
    let policyService: PolicyService

    beforeEach(() => {
      policyService = new PolicyService(new InMemoryPolicyRepository(), auditService)
    })

    it('should record create/update/delete audit entries', async () => {
      const policy = await policyService.create('p1', {
        name: 'Approval Gate',
        description: 'Requires approval',
        scope: 'global',
        type: 'approval-gate',
        condition: 'Must be approved',
        enforcement: 'mandatory',
      })
      await policyService.update(policy.id, { name: 'Updated Gate' })
      await policyService.remove(policy.id)
      const entries = await auditService.listByProject('p1')
      expect(entries).toHaveLength(3)
      expect(entries.map((e) => e.action).sort()).toEqual(['created', 'deleted', 'updated'])
      expect(entries.every((e) => e.entityType === 'policy')).toBe(true)
    })
  })

  describe('ContractService audit', () => {
    it('should record audit on CRUD', async () => {
      const contractService = new ContractService(new InMemoryContractRepository(), auditService)
      const contract = await contractService.create('p1', {
        name: 'SLA',
        description: 'Service level',
        type: 'SLA',
        providerId: 'd1',
        providerType: 'department',
        consumerId: 'd2',
        consumerType: 'department',
      })
      await contractService.update(contract.id, { name: 'Updated SLA' })
      await contractService.remove(contract.id)
      const entries = await auditService.listByProject('p1')
      expect(entries).toHaveLength(3)
      expect(entries.every((e) => e.entityType === 'contract')).toBe(true)
    })
  })

  describe('RoleService audit', () => {
    it('should record audit on CRUD', async () => {
      const roleService = new RoleService(new InMemoryRoleRepository(), auditService)
      const role = await roleService.create('p1', { name: 'Lead', description: 'Team lead', departmentId: 'd1' })
      await roleService.update(role.id, { name: 'Tech Lead' })
      await roleService.remove(role.id)
      const entries = await auditService.listByProject('p1')
      expect(entries).toHaveLength(3)
      expect(entries.every((e) => e.entityType === 'role')).toBe(true)
    })
  })

  describe('SkillService audit', () => {
    it('should record audit on CRUD', async () => {
      const skillService = new SkillService(new InMemorySkillRepository(), auditService)
      const skill = await skillService.create('p1', { name: 'TypeScript', description: 'TS skills', category: 'tech' })
      await skillService.update(skill.id, { name: 'TypeScript 5' })
      await skillService.remove(skill.id)
      const entries = await auditService.listByProject('p1')
      expect(entries).toHaveLength(3)
      expect(entries.every((e) => e.entityType === 'skill')).toBe(true)
    })
  })

  describe('without AuditService (backward compatibility)', () => {
    it('should work without audit service', async () => {
      const deptService = new DepartmentService(new InMemoryDepartmentRepository())
      const dept = await deptService.create('p1', { name: 'Eng', description: 'desc', mandate: 'build' })
      await deptService.update(dept.id, { name: 'Engineering' })
      await deptService.remove(dept.id)
      // No errors thrown — audit is optional
      expect(await auditService.listByProject('p1')).toEqual([])
    })
  })

  describe('cross-entity audit trail', () => {
    it('should track multiple entity types in the same project', async () => {
      const deptService = new DepartmentService(new InMemoryDepartmentRepository(), auditService)
      const capService = new CapabilityService(new InMemoryCapabilityRepository(), auditService)
      const roleService = new RoleService(new InMemoryRoleRepository(), auditService)

      await deptService.create('p1', { name: 'Engineering', description: 'Eng', mandate: 'Build' })
      await capService.create('p1', { name: 'API Design', description: 'APIs' })
      await roleService.create('p1', { name: 'Lead', description: 'Lead role', departmentId: 'd1' })

      const entries = await auditService.listByProject('p1')
      expect(entries).toHaveLength(3)
      const types = entries.map((e) => e.entityType).sort()
      expect(types).toEqual(['capability', 'department', 'role'])
    })
  })
})
