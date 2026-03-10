import type { VisualNodeDto, VisualEdgeDto } from '@the-crew/shared-types'

export const mockDeptNode: VisualNodeDto = {
  id: 'dept:abc',
  nodeType: 'department',
  entityId: 'abc',
  label: 'Marketing',
  sublabel: 'Drive growth',
  position: null,
  collapsed: false,
  status: 'normal',
  layerIds: ['organization'],
  parentId: 'company:proj-1',
}

export const mockRoleNode: VisualNodeDto = {
  id: 'role:r1',
  nodeType: 'role',
  entityId: 'r1',
  label: 'CMO',
  sublabel: 'Marketing strategy',
  position: { x: 100, y: 200 },
  collapsed: false,
  status: 'normal',
  layerIds: ['organization'],
  parentId: 'dept:abc',
}

export const mockCompanyNode: VisualNodeDto = {
  id: 'company:proj-1',
  nodeType: 'company',
  entityId: 'proj-1',
  label: 'Acme Corp',
  sublabel: 'Technology',
  position: null,
  collapsed: false,
  status: 'normal',
  layerIds: ['organization'],
  parentId: null,
}

export const mockCapabilityNode: VisualNodeDto = {
  id: 'cap:c1',
  nodeType: 'capability',
  entityId: 'c1',
  label: 'Brand Management',
  sublabel: 'Manage brand identity',
  position: null,
  collapsed: false,
  status: 'warning',
  layerIds: ['capabilities'],
  parentId: 'dept:abc',
}

export const mockWorkflowNode: VisualNodeDto = {
  id: 'wf:w1',
  nodeType: 'workflow',
  entityId: 'w1',
  label: 'Onboarding',
  sublabel: 'active',
  position: null,
  collapsed: false,
  status: 'normal',
  layerIds: ['workflows'],
  parentId: 'dept:abc',
}

export const mockContractNode: VisualNodeDto = {
  id: 'contract:ct1',
  nodeType: 'contract',
  entityId: 'ct1',
  label: 'Data SLA',
  sublabel: 'SLA \u00b7 active',
  position: null,
  collapsed: false,
  status: 'error',
  layerIds: ['contracts'],
  parentId: null,
}

export const mockPolicyNode: VisualNodeDto = {
  id: 'policy:p1',
  nodeType: 'policy',
  entityId: 'p1',
  label: 'Privacy Policy',
  sublabel: 'constraint \u00b7 mandatory',
  position: null,
  collapsed: false,
  status: 'normal',
  layerIds: ['governance'],
  parentId: null,
}

export const mockReportsToEdge: VisualEdgeDto = {
  id: 'reports_to:dept:abc\u2192dept:xyz',
  edgeType: 'reports_to',
  sourceId: 'dept:abc',
  targetId: 'dept:xyz',
  label: null,
  style: 'solid',
  layerIds: ['organization'],
}

export const mockOwnsEdge: VisualEdgeDto = {
  id: 'owns:dept:abc\u2192cap:c1',
  edgeType: 'owns',
  sourceId: 'dept:abc',
  targetId: 'cap:c1',
  label: null,
  style: 'solid',
  layerIds: ['capabilities'],
}

export const mockContributesToEdge: VisualEdgeDto = {
  id: 'contributes_to:role:r1\u2192cap:c1',
  edgeType: 'contributes_to',
  sourceId: 'role:r1',
  targetId: 'cap:c1',
  label: null,
  style: 'dotted',
  layerIds: ['capabilities'],
}

export const allMockNodes: VisualNodeDto[] = [
  mockCompanyNode,
  mockDeptNode,
  mockRoleNode,
  mockCapabilityNode,
  mockWorkflowNode,
  mockContractNode,
  mockPolicyNode,
]

export const mockParticipatesInEdge: VisualEdgeDto = {
  id: 'participates_in:role:r1→wf:w1',
  edgeType: 'participates_in',
  sourceId: 'role:r1',
  targetId: 'wf:w1',
  label: 'Facilitates onboarding sessions',
  style: 'dashed',
  layerIds: ['workflows'],
}

export const mockHandsOffToEdge: VisualEdgeDto = {
  id: 'hands_off_to:wf-stage:s1→wf-stage:s2',
  edgeType: 'hands_off_to',
  sourceId: 'wf-stage:s1',
  targetId: 'wf-stage:s2',
  label: null,
  style: 'solid',
  layerIds: ['workflows'],
}

export const allMockEdges: VisualEdgeDto[] = [
  mockReportsToEdge,
  mockOwnsEdge,
  mockContributesToEdge,
  mockParticipatesInEdge,
]
