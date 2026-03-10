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

  return nodes
}
