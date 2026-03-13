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

  // produces_artifact: producer -> artifact
  for (const artifact of snapshot.artifacts ?? []) {
    if (artifact.producerId) {
      const producerPrefix = artifact.producerType === 'department' ? 'department' : 'capability'
      const src = visualNodeId(producerPrefix, artifact.producerId)
      const tgt = visualNodeId('artifact', artifact.id)
      edges.push({
        id: visualEdgeId('produces_artifact', src, tgt),
        edgeType: 'produces_artifact',
        sourceId: src,
        targetId: tgt,
        label: 'produces',
        style: 'solid',
        layerIds: ['artifacts'],
      })
    }
  }

  // consumes_artifact: consumer -> artifact
  for (const artifact of snapshot.artifacts ?? []) {
    for (const consumerId of artifact.consumerIds ?? []) {
      const isDept = snapshot.departments.some((d) => d.id === consumerId)
      const prefix = isDept ? 'department' : 'capability'
      const src = visualNodeId(prefix, consumerId)
      const tgt = visualNodeId('artifact', artifact.id)
      edges.push({
        id: visualEdgeId('consumes_artifact', src, tgt),
        edgeType: 'consumes_artifact',
        sourceId: src,
        targetId: tgt,
        label: 'consumes',
        style: 'dashed',
        layerIds: ['artifacts'],
      })
    }
  }

  // ── Live Company Pivot: v3 edges ───────────────────────────────────

  const uos = snapshot.organizationalUnits ?? []
  const agents = snapshot.agents ?? []
  const proposals = snapshot.proposals ?? []

  // contains: UO parent -> UO child
  for (const uo of uos) {
    if (uo.parentUoId) {
      const parentUo = uos.find(u => u.id === uo.parentUoId)
      if (parentUo) {
        const parentType = parentUo.uoType === 'company' ? 'company'
          : parentUo.uoType === 'team' ? 'team' : 'department'
        const childType = uo.uoType === 'company' ? 'company'
          : uo.uoType === 'team' ? 'team' : 'department'
        const src = visualNodeId(parentType, parentUo.id)
        const tgt = visualNodeId(childType, uo.id)
        edges.push({
          id: visualEdgeId('contains', src, tgt),
          edgeType: 'contains',
          sourceId: src,
          targetId: tgt,
          label: null,
          style: 'solid',
          layerIds: ['organization'],
        })
      }
    }
  }

  // led_by: UO -> coordinator-agent
  for (const agent of agents) {
    if (agent.agentType === 'coordinator') {
      const uo = uos.find(u => u.id === agent.uoId)
      if (uo) {
        const uoNodeType = uo.uoType === 'company' ? 'company'
          : uo.uoType === 'team' ? 'team' : 'department'
        const src = visualNodeId(uoNodeType, uo.id)
        const tgt = visualNodeId('coordinator-agent', agent.id)
        edges.push({
          id: visualEdgeId('led_by', src, tgt),
          edgeType: 'led_by',
          sourceId: src,
          targetId: tgt,
          label: null,
          style: 'solid',
          layerIds: ['organization'],
        })
      }
    }
  }

  // belongs_to: specialist-agent -> UO
  for (const agent of agents) {
    if (agent.agentType === 'specialist') {
      const uo = uos.find(u => u.id === agent.uoId)
      if (uo) {
        const uoNodeType = uo.uoType === 'company' ? 'company'
          : uo.uoType === 'team' ? 'team' : 'department'
        const src = visualNodeId('specialist-agent', agent.id)
        const tgt = visualNodeId(uoNodeType, uo.id)
        edges.push({
          id: visualEdgeId('belongs_to', src, tgt),
          edgeType: 'belongs_to',
          sourceId: src,
          targetId: tgt,
          label: null,
          style: 'dashed',
          layerIds: ['organization'],
        })
      }
    }
  }

  // proposed-by: proposal -> agent
  for (const proposal of proposals) {
    if (proposal.proposedByAgentId) {
      const agent = agents.find(a => a.id === proposal.proposedByAgentId)
      if (agent) {
        const agentType = agent.agentType === 'coordinator' ? 'coordinator-agent' : 'specialist-agent'
        const src = visualNodeId('proposal', proposal.id)
        const tgt = visualNodeId(agentType, agent.id)
        edges.push({
          id: visualEdgeId('proposed_by', src, tgt),
          edgeType: 'proposed_by',
          sourceId: src,
          targetId: tgt,
          label: null,
          style: 'dotted',
          layerIds: ['governance'],
        })
      }
    }
  }

  return edges
}
