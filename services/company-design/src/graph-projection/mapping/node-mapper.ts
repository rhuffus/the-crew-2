import type { ReleaseSnapshotDto, VisualNodeDto } from '@the-crew/shared-types'
import { visualNodeId, workflowStageId } from './visual-id'
import { truncate } from './truncate'

export function mapNodes(snapshot: ReleaseSnapshotDto, projectId: string): VisualNodeDto[] {
  const nodes: VisualNodeDto[] = []

  // Company node
  if (snapshot.companyModel) {
    nodes.push({
      id: visualNodeId('company', projectId),
      nodeType: 'company',
      entityId: projectId,
      label: truncate(snapshot.companyModel.purpose, 60) ?? '(No purpose defined)',
      sublabel: snapshot.companyModel.type || null,
      position: null,
      collapsed: false,
      status: 'normal',
      layerIds: ['organization'],
      parentId: null,
    })
  } else {
    nodes.push({
      id: visualNodeId('company', projectId),
      nodeType: 'company',
      entityId: projectId,
      label: '(No purpose defined)',
      sublabel: null,
      position: null,
      collapsed: false,
      status: 'error',
      layerIds: ['organization'],
      parentId: null,
    })
  }

  // Department nodes
  for (const dept of snapshot.departments) {
    nodes.push({
      id: visualNodeId('department', dept.id),
      nodeType: 'department',
      entityId: dept.id,
      label: dept.name,
      sublabel: truncate(dept.mandate, 50),
      position: null,
      collapsed: false,
      status: 'normal',
      layerIds: ['organization'],
      parentId: dept.parentId
        ? visualNodeId('department', dept.parentId)
        : visualNodeId('company', projectId),
    })
  }

  // Role nodes
  for (const role of snapshot.roles) {
    nodes.push({
      id: visualNodeId('role', role.id),
      nodeType: 'role',
      entityId: role.id,
      label: role.name,
      sublabel: truncate(role.accountability, 50),
      position: null,
      collapsed: false,
      status: 'normal',
      layerIds: ['organization'],
      parentId: visualNodeId('department', role.departmentId),
    })
  }

  // Agent archetype nodes
  for (const archetype of snapshot.agentArchetypes) {
    nodes.push({
      id: visualNodeId('agent-archetype', archetype.id),
      nodeType: 'agent-archetype',
      entityId: archetype.id,
      label: archetype.name,
      sublabel: truncate(archetype.description, 50),
      position: null,
      collapsed: false,
      status: 'normal',
      layerIds: ['organization'],
      parentId: visualNodeId('department', archetype.departmentId),
    })
  }

  // Agent assignment nodes
  for (const assignment of snapshot.agentAssignments) {
    nodes.push({
      id: visualNodeId('agent-assignment', assignment.id),
      nodeType: 'agent-assignment',
      entityId: assignment.id,
      label: assignment.name,
      sublabel: assignment.status,
      position: null,
      collapsed: false,
      status: 'normal',
      layerIds: ['organization'],
      parentId: visualNodeId('agent-archetype', assignment.archetypeId),
    })
  }

  // Capability nodes
  for (const cap of snapshot.capabilities) {
    nodes.push({
      id: visualNodeId('capability', cap.id),
      nodeType: 'capability',
      entityId: cap.id,
      label: cap.name,
      sublabel: truncate(cap.description, 50),
      position: null,
      collapsed: false,
      status: 'normal',
      layerIds: ['capabilities'],
      parentId: cap.ownerDepartmentId
        ? visualNodeId('department', cap.ownerDepartmentId)
        : null,
    })
  }

  // Skill nodes
  for (const skill of snapshot.skills) {
    nodes.push({
      id: visualNodeId('skill', skill.id),
      nodeType: 'skill',
      entityId: skill.id,
      label: skill.name,
      sublabel: skill.category || null,
      position: null,
      collapsed: false,
      status: 'normal',
      layerIds: ['capabilities'],
      parentId: null,
    })
  }

  // Workflow nodes
  for (const wf of snapshot.workflows) {
    nodes.push({
      id: visualNodeId('workflow', wf.id),
      nodeType: 'workflow',
      entityId: wf.id,
      label: wf.name,
      sublabel: wf.status || null,
      position: null,
      collapsed: false,
      status: 'normal',
      layerIds: ['workflows'],
      parentId: wf.ownerDepartmentId
        ? visualNodeId('department', wf.ownerDepartmentId)
        : null,
    })

    // Workflow stage nodes
    for (const stage of wf.stages ?? []) {
      nodes.push({
        id: workflowStageId(wf.id, stage.order),
        nodeType: 'workflow-stage',
        entityId: `${wf.id}:${stage.name}`,
        label: stage.name,
        sublabel: truncate(stage.description, 50),
        position: null,
        collapsed: false,
        status: 'normal',
        layerIds: ['workflows'],
        parentId: visualNodeId('workflow', wf.id),
      })
    }
  }

  // Contract nodes
  for (const contract of snapshot.contracts) {
    nodes.push({
      id: visualNodeId('contract', contract.id),
      nodeType: 'contract',
      entityId: contract.id,
      label: contract.name,
      sublabel: `${contract.type} \u00b7 ${contract.status}`,
      position: null,
      collapsed: false,
      status: 'normal',
      layerIds: ['contracts'],
      parentId: null,
    })
  }

  // Policy nodes
  for (const policy of snapshot.policies) {
    nodes.push({
      id: visualNodeId('policy', policy.id),
      nodeType: 'policy',
      entityId: policy.id,
      label: policy.name,
      sublabel: `${policy.type} \u00b7 ${policy.enforcement}`,
      position: null,
      collapsed: false,
      status: 'normal',
      layerIds: ['governance'],
      parentId: null,
    })
  }

  // Artifact nodes
  for (const artifact of snapshot.artifacts ?? []) {
    const parentId = artifact.producerId
      ? visualNodeId(artifact.producerType === 'department' ? 'department' : 'capability', artifact.producerId)
      : null
    nodes.push({
      id: visualNodeId('artifact', artifact.id),
      nodeType: 'artifact',
      entityId: artifact.id,
      label: artifact.name,
      sublabel: artifact.type || null,
      position: null,
      collapsed: false,
      status: 'normal',
      layerIds: ['artifacts'],
      parentId,
    })
  }

  // ── Live Company Pivot: v3 entities ────────────────────────────────

  const hasUos = (snapshot.organizationalUnits ?? []).length > 0

  // Organizational Unit nodes (company / department / team)
  for (const uo of snapshot.organizationalUnits ?? []) {
    const uoNodeType = uo.uoType === 'company' ? 'company'
      : uo.uoType === 'department' ? 'department'
      : 'team'

    // If UOs exist and there's a company UO, skip the legacy company node
    if (uo.uoType === 'company') {
      // Replace the legacy company node if it exists
      const legacyIdx = nodes.findIndex(n => n.nodeType === 'company')
      const companyNode: VisualNodeDto = {
        id: visualNodeId('company', uo.id),
        nodeType: 'company',
        entityId: uo.id,
        label: uo.name,
        sublabel: truncate(uo.mandate, 50),
        position: null,
        collapsed: false,
        status: uo.status === 'active' ? 'normal' : uo.status === 'proposed' ? 'proposed' as never : 'normal',
        layerIds: ['organization'],
        parentId: null,
      }
      if (legacyIdx >= 0) {
        nodes[legacyIdx] = companyNode
      } else {
        nodes.push(companyNode)
      }
      continue
    }

    const parentId = uo.parentUoId
      ? visualNodeId(
          (snapshot.organizationalUnits ?? []).find(p => p.id === uo.parentUoId)?.uoType === 'company'
            ? 'company'
            : (snapshot.organizationalUnits ?? []).find(p => p.id === uo.parentUoId)?.uoType === 'team'
              ? 'team'
              : 'department',
          uo.parentUoId,
        )
      : hasUos
        ? visualNodeId('company', (snapshot.organizationalUnits ?? []).find(c => c.uoType === 'company')?.id ?? projectId)
        : null

    nodes.push({
      id: visualNodeId(uoNodeType, uo.id),
      nodeType: uoNodeType,
      entityId: uo.id,
      label: uo.name,
      sublabel: truncate(uo.mandate, 50),
      position: null,
      collapsed: false,
      status: 'normal',
      layerIds: ['organization'],
      parentId,
    })
  }

  // LCP Agent nodes (coordinator / specialist)
  for (const agent of snapshot.agents ?? []) {
    const agentNodeType = agent.agentType === 'coordinator' ? 'coordinator-agent' : 'specialist-agent'
    const parentUo = (snapshot.organizationalUnits ?? []).find(u => u.id === agent.uoId)
    const parentNodeType = parentUo?.uoType === 'company' ? 'company'
      : parentUo?.uoType === 'team' ? 'team'
      : 'department'
    const parentId = parentUo
      ? visualNodeId(parentNodeType, parentUo.id)
      : null

    nodes.push({
      id: visualNodeId(agentNodeType, agent.id),
      nodeType: agentNodeType,
      entityId: agent.id,
      label: agent.name,
      sublabel: truncate(agent.role, 50),
      position: null,
      collapsed: false,
      status: 'normal',
      layerIds: ['organization'],
      parentId,
    })
  }

  // Proposal nodes
  for (const proposal of snapshot.proposals ?? []) {
    nodes.push({
      id: visualNodeId('proposal', proposal.id),
      nodeType: 'proposal',
      entityId: proposal.id,
      label: proposal.title,
      sublabel: `${proposal.proposalType} · ${proposal.status}`,
      position: null,
      collapsed: false,
      status: proposal.status === 'rejected' ? 'error' : 'normal',
      layerIds: ['governance'],
      parentId: null,
    })
  }

  return nodes
}
