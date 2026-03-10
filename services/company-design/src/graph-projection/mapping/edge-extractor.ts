import type { ReleaseSnapshotDto, VisualEdgeDto } from '@the-crew/shared-types'
import { visualNodeId, workflowStageId, visualEdgeId } from './visual-id'

export function extractEdges(snapshot: ReleaseSnapshotDto, projectId: string): VisualEdgeDto[] {
  const edges: VisualEdgeDto[] = []

  // reports_to: department hierarchy
  for (const dept of snapshot.departments) {
    if (dept.parentId) {
      const src = visualNodeId('department', dept.id)
      const tgt = visualNodeId('department', dept.parentId)
      edges.push({
        id: visualEdgeId('reports_to', src, tgt),
        edgeType: 'reports_to',
        sourceId: src,
        targetId: tgt,
        label: null,
        style: 'solid',
        layerIds: ['organization'],
      })
    }
  }

  // owns: department -> capability
  for (const cap of snapshot.capabilities) {
    if (cap.ownerDepartmentId) {
      const src = visualNodeId('department', cap.ownerDepartmentId)
      const tgt = visualNodeId('capability', cap.id)
      edges.push({
        id: visualEdgeId('owns', src, tgt),
        edgeType: 'owns',
        sourceId: src,
        targetId: tgt,
        label: null,
        style: 'solid',
        layerIds: ['capabilities'],
      })
    }
  }

  // owns: department -> workflow
  for (const wf of snapshot.workflows) {
    if (wf.ownerDepartmentId) {
      const src = visualNodeId('department', wf.ownerDepartmentId)
      const tgt = visualNodeId('workflow', wf.id)
      edges.push({
        id: visualEdgeId('owns', src, tgt),
        edgeType: 'owns',
        sourceId: src,
        targetId: tgt,
        label: null,
        style: 'solid',
        layerIds: ['workflows'],
      })
    }
  }

  // assigned_to: archetype -> role
  for (const archetype of snapshot.agentArchetypes) {
    const src = visualNodeId('agent-archetype', archetype.id)
    const tgt = visualNodeId('role', archetype.roleId)
    edges.push({
      id: visualEdgeId('assigned_to', src, tgt),
      edgeType: 'assigned_to',
      sourceId: src,
      targetId: tgt,
      label: null,
      style: 'dashed',
      layerIds: ['organization'],
    })
  }

  // contributes_to: role -> capability
  for (const role of snapshot.roles) {
    for (const capId of role.capabilityIds ?? []) {
      const src = visualNodeId('role', role.id)
      const tgt = visualNodeId('capability', capId)
      edges.push({
        id: visualEdgeId('contributes_to', src, tgt),
        edgeType: 'contributes_to',
        sourceId: src,
        targetId: tgt,
        label: null,
        style: 'dotted',
        layerIds: ['capabilities'],
      })
    }
  }

  // has_skill: archetype -> skill
  for (const archetype of snapshot.agentArchetypes) {
    for (const skillId of archetype.skillIds ?? []) {
      const src = visualNodeId('agent-archetype', archetype.id)
      const tgt = visualNodeId('skill', skillId)
      edges.push({
        id: visualEdgeId('has_skill', src, tgt),
        edgeType: 'has_skill',
        sourceId: src,
        targetId: tgt,
        label: null,
        style: 'dotted',
        layerIds: ['capabilities'],
      })
    }
  }

  // compatible_with: skill -> role
  for (const skill of snapshot.skills) {
    for (const roleId of skill.compatibleRoleIds ?? []) {
      const src = visualNodeId('skill', skill.id)
      const tgt = visualNodeId('role', roleId)
      edges.push({
        id: visualEdgeId('compatible_with', src, tgt),
        edgeType: 'compatible_with',
        sourceId: src,
        targetId: tgt,
        label: null,
        style: 'dotted',
        layerIds: ['capabilities'],
      })
    }
  }

  // provides: party -> contract
  for (const contract of snapshot.contracts) {
    const providerPrefix = contract.providerType === 'department' ? 'department' : 'capability'
    const src = visualNodeId(providerPrefix, contract.providerId)
    const tgt = visualNodeId('contract', contract.id)
    edges.push({
      id: visualEdgeId('provides', src, tgt),
      edgeType: 'provides',
      sourceId: src,
      targetId: tgt,
      label: null,
      style: 'solid',
      layerIds: ['contracts'],
    })
  }

  // consumes: party -> contract
  for (const contract of snapshot.contracts) {
    const consumerPrefix = contract.consumerType === 'department' ? 'department' : 'capability'
    const src = visualNodeId(consumerPrefix, contract.consumerId)
    const tgt = visualNodeId('contract', contract.id)
    edges.push({
      id: visualEdgeId('consumes', src, tgt),
      edgeType: 'consumes',
      sourceId: src,
      targetId: tgt,
      label: null,
      style: 'solid',
      layerIds: ['contracts'],
    })
  }

  // bound_by: workflow -> contract
  for (const wf of snapshot.workflows) {
    for (const contractId of wf.contractIds ?? []) {
      const src = visualNodeId('workflow', wf.id)
      const tgt = visualNodeId('contract', contractId)
      edges.push({
        id: visualEdgeId('bound_by', src, tgt),
        edgeType: 'bound_by',
        sourceId: src,
        targetId: tgt,
        label: null,
        style: 'dashed',
        layerIds: ['contracts'],
      })
    }
  }

  // participates_in: role/dept -> workflow
  for (const wf of snapshot.workflows) {
    for (const participant of wf.participants ?? []) {
      const pType = participant.participantType === 'role' ? 'role' : 'department'
      const src = visualNodeId(pType as 'role' | 'department', participant.participantId)
      const tgt = visualNodeId('workflow', wf.id)
      edges.push({
        id: visualEdgeId('participates_in', src, tgt),
        edgeType: 'participates_in',
        sourceId: src,
        targetId: tgt,
        label: participant.responsibility || null,
        style: 'dotted',
        layerIds: ['workflows'],
      })
    }
  }

  // hands_off_to: stage -> stage
  for (const wf of snapshot.workflows) {
    const stages = [...(wf.stages ?? [])].sort((a, b) => a.order - b.order)
    for (let i = 0; i < stages.length - 1; i++) {
      const src = workflowStageId(wf.id, stages[i]!.order)
      const tgt = workflowStageId(wf.id, stages[i + 1]!.order)
      edges.push({
        id: visualEdgeId('hands_off_to', src, tgt),
        edgeType: 'hands_off_to',
        sourceId: src,
        targetId: tgt,
        label: null,
        style: 'solid',
        layerIds: ['workflows'],
      })
    }
  }

  // governs: policy -> target
  for (const policy of snapshot.policies) {
    if (policy.scope === 'global') {
      const src = visualNodeId('policy', policy.id)
      const tgt = visualNodeId('company', projectId)
      edges.push({
        id: visualEdgeId('governs', src, tgt),
        edgeType: 'governs',
        sourceId: src,
        targetId: tgt,
        label: null,
        style: 'dashed',
        layerIds: ['governance'],
      })
    } else if (policy.scope === 'department' && policy.departmentId) {
      const src = visualNodeId('policy', policy.id)
      const tgt = visualNodeId('department', policy.departmentId)
      edges.push({
        id: visualEdgeId('governs', src, tgt),
        edgeType: 'governs',
        sourceId: src,
        targetId: tgt,
        label: null,
        style: 'dashed',
        layerIds: ['governance'],
      })
    }
  }

  return edges
}
