import { Injectable } from '@nestjs/common'
import type { ReleaseSnapshotDto, ValidationIssue } from '@the-crew/shared-types'

@Injectable()
export class ValidationEngine {
  validate(snapshot: ReleaseSnapshotDto): ValidationIssue[] {
    const issues: ValidationIssue[] = []
    const deptIds = new Set(snapshot.departments.map((d) => d.id))
    const capIds = new Set(snapshot.capabilities.map((c) => c.id))
    const contractIds = new Set(snapshot.contracts.map((c) => c.id))

    this.validateCompanyModel(snapshot, issues)
    this.validateDepartments(snapshot, issues)
    this.validateCapabilities(snapshot, issues, deptIds)
    this.validateRoles(snapshot, issues, deptIds, capIds)
    const roleIds = new Set(snapshot.roles.map((r) => r.id))
    const skillIds = new Set(snapshot.skills.map((s) => s.id))
    const archetypeIds = new Set(snapshot.agentArchetypes.map((a) => a.id))
    this.validateAgentArchetypes(snapshot, issues, deptIds, roleIds, skillIds)
    this.validateAgentAssignments(snapshot, issues, archetypeIds)
    this.validateSkills(snapshot, issues, roleIds)
    this.validateContracts(snapshot, issues, deptIds, capIds)
    this.validateWorkflows(snapshot, issues, deptIds, contractIds)
    this.validatePolicies(snapshot, issues, deptIds)

    return issues
  }

  private validateCompanyModel(snapshot: ReleaseSnapshotDto, issues: ValidationIssue[]) {
    if (!snapshot.companyModel || !snapshot.companyModel.purpose.trim()) {
      issues.push({
        entity: 'CompanyModel',
        entityId: null,
        field: 'purpose',
        message: 'Company model has no purpose defined',
        severity: 'error',
      })
    }
  }

  private validateDepartments(snapshot: ReleaseSnapshotDto, issues: ValidationIssue[]) {
    for (const dept of snapshot.departments) {
      if (!dept.mandate.trim()) {
        issues.push({
          entity: 'Department',
          entityId: dept.id,
          field: 'mandate',
          message: `Department "${dept.name}" has no mandate`,
          severity: 'warning',
        })
      }
    }
  }

  private validateCapabilities(
    snapshot: ReleaseSnapshotDto,
    issues: ValidationIssue[],
    deptIds: Set<string>,
  ) {
    for (const cap of snapshot.capabilities) {
      if (!cap.ownerDepartmentId) {
        issues.push({
          entity: 'Capability',
          entityId: cap.id,
          field: 'ownerDepartmentId',
          message: `Capability "${cap.name}" has no owner department`,
          severity: 'warning',
        })
      } else if (!deptIds.has(cap.ownerDepartmentId)) {
        issues.push({
          entity: 'Capability',
          entityId: cap.id,
          field: 'ownerDepartmentId',
          message: `Capability "${cap.name}" references non-existent department "${cap.ownerDepartmentId}"`,
          severity: 'error',
        })
      }
    }
  }

  private validateRoles(
    snapshot: ReleaseSnapshotDto,
    issues: ValidationIssue[],
    deptIds: Set<string>,
    capIds: Set<string>,
  ) {
    for (const role of snapshot.roles) {
      if (!deptIds.has(role.departmentId)) {
        issues.push({
          entity: 'Role',
          entityId: role.id,
          field: 'departmentId',
          message: `Role "${role.name}" references non-existent department "${role.departmentId}"`,
          severity: 'error',
        })
      }
      for (const capId of role.capabilityIds) {
        if (!capIds.has(capId)) {
          issues.push({
            entity: 'Role',
            entityId: role.id,
            field: 'capabilityIds',
            message: `Role "${role.name}" references non-existent capability "${capId}"`,
            severity: 'error',
          })
        }
      }
    }
  }

  private validateAgentArchetypes(
    snapshot: ReleaseSnapshotDto,
    issues: ValidationIssue[],
    deptIds: Set<string>,
    roleIds: Set<string>,
    skillIds: Set<string>,
  ) {
    for (const archetype of snapshot.agentArchetypes) {
      if (!roleIds.has(archetype.roleId)) {
        issues.push({
          entity: 'AgentArchetype',
          entityId: archetype.id,
          field: 'roleId',
          message: `Agent archetype "${archetype.name}" references non-existent role "${archetype.roleId}"`,
          severity: 'error',
        })
      }
      if (!deptIds.has(archetype.departmentId)) {
        issues.push({
          entity: 'AgentArchetype',
          entityId: archetype.id,
          field: 'departmentId',
          message: `Agent archetype "${archetype.name}" references non-existent department "${archetype.departmentId}"`,
          severity: 'error',
        })
      }
      for (const sid of archetype.skillIds) {
        if (!skillIds.has(sid)) {
          issues.push({
            entity: 'AgentArchetype',
            entityId: archetype.id,
            field: 'skillIds',
            message: `Agent archetype "${archetype.name}" references non-existent skill "${sid}"`,
            severity: 'error',
          })
        }
      }
    }
  }

  private validateAgentAssignments(
    snapshot: ReleaseSnapshotDto,
    issues: ValidationIssue[],
    archetypeIds: Set<string>,
  ) {
    for (const assignment of snapshot.agentAssignments) {
      if (!archetypeIds.has(assignment.archetypeId)) {
        issues.push({
          entity: 'AgentAssignment',
          entityId: assignment.id,
          field: 'archetypeId',
          message: `Agent assignment "${assignment.name}" references non-existent archetype "${assignment.archetypeId}"`,
          severity: 'error',
        })
      }
    }
  }

  private validateSkills(
    snapshot: ReleaseSnapshotDto,
    issues: ValidationIssue[],
    roleIds: Set<string>,
  ) {
    for (const skill of snapshot.skills) {
      for (const rid of skill.compatibleRoleIds) {
        if (!roleIds.has(rid)) {
          issues.push({
            entity: 'Skill',
            entityId: skill.id,
            field: 'compatibleRoleIds',
            message: `Skill "${skill.name}" references non-existent role "${rid}"`,
            severity: 'error',
          })
        }
      }
    }
  }

  private validateContracts(
    snapshot: ReleaseSnapshotDto,
    issues: ValidationIssue[],
    deptIds: Set<string>,
    capIds: Set<string>,
  ) {
    for (const contract of snapshot.contracts) {
      this.validateContractParty(contract, 'provider', contract.providerId, contract.providerType, deptIds, capIds, issues)
      this.validateContractParty(contract, 'consumer', contract.consumerId, contract.consumerType, deptIds, capIds, issues)
    }
  }

  private validateContractParty(
    contract: { id: string; name: string },
    role: 'provider' | 'consumer',
    partyId: string,
    partyType: string,
    deptIds: Set<string>,
    capIds: Set<string>,
    issues: ValidationIssue[],
  ) {
    const ids = partyType === 'department' ? deptIds : capIds
    if (!ids.has(partyId)) {
      issues.push({
        entity: 'Contract',
        entityId: contract.id,
        field: `${role}Id`,
        message: `Contract "${contract.name}" references non-existent ${partyType} "${partyId}" as ${role}`,
        severity: 'error',
      })
    }
  }

  private validateWorkflows(
    snapshot: ReleaseSnapshotDto,
    issues: ValidationIssue[],
    deptIds: Set<string>,
    contractIds: Set<string>,
  ) {
    for (const wf of snapshot.workflows) {
      if (wf.contractIds.length === 0) {
        issues.push({
          entity: 'Workflow',
          entityId: wf.id,
          field: 'contractIds',
          message: `Workflow "${wf.name}" has no associated contracts`,
          severity: 'warning',
        })
      } else {
        for (const cid of wf.contractIds) {
          if (!contractIds.has(cid)) {
            issues.push({
              entity: 'Workflow',
              entityId: wf.id,
              field: 'contractIds',
              message: `Workflow "${wf.name}" references non-existent contract "${cid}"`,
              severity: 'error',
            })
          }
        }
      }

      if (wf.ownerDepartmentId && !deptIds.has(wf.ownerDepartmentId)) {
        issues.push({
          entity: 'Workflow',
          entityId: wf.id,
          field: 'ownerDepartmentId',
          message: `Workflow "${wf.name}" references non-existent department "${wf.ownerDepartmentId}"`,
          severity: 'error',
        })
      }
    }
  }

  private validatePolicies(
    snapshot: ReleaseSnapshotDto,
    issues: ValidationIssue[],
    deptIds: Set<string>,
  ) {
    for (const policy of snapshot.policies) {
      if (policy.scope === 'department' && policy.departmentId && !deptIds.has(policy.departmentId)) {
        issues.push({
          entity: 'Policy',
          entityId: policy.id,
          field: 'departmentId',
          message: `Policy "${policy.name}" references non-existent department "${policy.departmentId}"`,
          severity: 'error',
        })
      }
    }
  }
}
