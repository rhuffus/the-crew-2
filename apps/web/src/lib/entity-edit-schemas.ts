import type { NodeType } from '@the-crew/shared-types'
import type { FieldType, OptionsSource } from './entity-form-schemas'

export interface EditFieldSchema {
  name: string
  label: string
  type: FieldType | 'multi-select' | 'status-select'
  placeholder?: string
  readOnly?: boolean
  options?: { value: string; label: string }[]
  optionsSource?: OptionsSource
  conditional?: { field: string; value: string }
}

export interface EntityEditSchema {
  nodeType: NodeType
  label: string
  fields: EditFieldSchema[]
}

export const ENTITY_EDIT_SCHEMAS: EntityEditSchema[] = [
  {
    nodeType: 'department',
    label: 'Department',
    fields: [
      { name: 'name', label: 'Name', type: 'text', placeholder: 'Department name' },
      { name: 'description', label: 'Description', type: 'textarea', placeholder: 'What this department does' },
      { name: 'mandate', label: 'Mandate', type: 'textarea', placeholder: 'Department mandate' },
      { name: 'parentId', label: 'Parent Department', type: 'select', optionsSource: 'departments' },
    ],
  },
  {
    nodeType: 'capability',
    label: 'Capability',
    fields: [
      { name: 'name', label: 'Name', type: 'text', placeholder: 'Capability name' },
      { name: 'description', label: 'Description', type: 'textarea', placeholder: 'What this capability provides' },
      { name: 'ownerDepartmentId', label: 'Owner Department', type: 'select', optionsSource: 'departments' },
      { name: 'inputs', label: 'Inputs', type: 'tags', placeholder: 'Comma-separated inputs' },
      { name: 'outputs', label: 'Outputs', type: 'tags', placeholder: 'Comma-separated outputs' },
    ],
  },
  {
    nodeType: 'role',
    label: 'Role',
    fields: [
      { name: 'name', label: 'Name', type: 'text', placeholder: 'Role name' },
      { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Role description' },
      { name: 'departmentId', label: 'Department', type: 'select', optionsSource: 'departments' },
      { name: 'accountability', label: 'Accountability', type: 'textarea', placeholder: 'What this role is accountable for' },
      { name: 'authority', label: 'Authority', type: 'textarea', placeholder: 'What authority this role has' },
      { name: 'capabilityIds', label: 'Capabilities', type: 'multi-select', optionsSource: 'capabilities' },
    ],
  },
  {
    nodeType: 'workflow',
    label: 'Workflow',
    fields: [
      { name: 'name', label: 'Name', type: 'text', placeholder: 'Workflow name' },
      { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Workflow description' },
      { name: 'ownerDepartmentId', label: 'Owner Department', type: 'select', optionsSource: 'departments' },
      {
        name: 'status', label: 'Status', type: 'status-select',
        options: [
          { value: 'draft', label: 'Draft' },
          { value: 'active', label: 'Active' },
          { value: 'archived', label: 'Archived' },
        ],
      },
      { name: 'triggerDescription', label: 'Trigger', type: 'text', placeholder: 'What triggers this workflow' },
    ],
  },
  {
    nodeType: 'contract',
    label: 'Contract',
    fields: [
      { name: 'name', label: 'Name', type: 'text', placeholder: 'Contract name' },
      { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Contract description' },
      {
        name: 'type', label: 'Type', type: 'select',
        options: [
          { value: 'SLA', label: 'SLA' },
          { value: 'DataContract', label: 'Data Contract' },
          { value: 'InterfaceContract', label: 'Interface Contract' },
          { value: 'OperationalAgreement', label: 'Operational Agreement' },
        ],
      },
      {
        name: 'status', label: 'Status', type: 'status-select',
        options: [
          { value: 'draft', label: 'Draft' },
          { value: 'active', label: 'Active' },
          { value: 'deprecated', label: 'Deprecated' },
        ],
      },
      { name: 'providerId', label: 'Provider', type: 'party-select' },
      { name: 'consumerId', label: 'Consumer', type: 'party-select' },
      { name: 'acceptanceCriteria', label: 'Acceptance Criteria', type: 'tags', placeholder: 'Comma-separated criteria' },
    ],
  },
  {
    nodeType: 'policy',
    label: 'Policy',
    fields: [
      { name: 'name', label: 'Name', type: 'text', placeholder: 'Policy name' },
      { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Policy description' },
      {
        name: 'scope', label: 'Scope', type: 'select',
        options: [
          { value: 'global', label: 'Global' },
          { value: 'department', label: 'Department' },
        ],
      },
      {
        name: 'departmentId', label: 'Department', type: 'select', optionsSource: 'departments',
        conditional: { field: 'scope', value: 'department' },
      },
      {
        name: 'type', label: 'Type', type: 'select',
        options: [
          { value: 'approval-gate', label: 'Approval Gate' },
          { value: 'constraint', label: 'Constraint' },
          { value: 'rule', label: 'Rule' },
        ],
      },
      {
        name: 'enforcement', label: 'Enforcement', type: 'select',
        options: [
          { value: 'mandatory', label: 'Mandatory' },
          { value: 'advisory', label: 'Advisory' },
        ],
      },
      { name: 'condition', label: 'Condition', type: 'textarea', placeholder: 'Policy condition' },
      {
        name: 'status', label: 'Status', type: 'status-select',
        options: [
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
        ],
      },
    ],
  },
  {
    nodeType: 'skill',
    label: 'Skill',
    fields: [
      { name: 'name', label: 'Name', type: 'text', placeholder: 'Skill name' },
      { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Skill description' },
      { name: 'category', label: 'Category', type: 'text', placeholder: 'e.g. technical, leadership' },
      { name: 'tags', label: 'Tags', type: 'tags', placeholder: 'Comma-separated tags' },
      { name: 'compatibleRoleIds', label: 'Compatible Roles', type: 'multi-select', optionsSource: 'roles' },
    ],
  },
  {
    nodeType: 'agent-archetype',
    label: 'Agent Archetype',
    fields: [
      { name: 'name', label: 'Name', type: 'text', placeholder: 'Archetype name' },
      { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Archetype description' },
      { name: 'roleId', label: 'Role', type: 'select', optionsSource: 'roles' },
      { name: 'departmentId', label: 'Department', type: 'select', optionsSource: 'departments' },
      { name: 'skillIds', label: 'Skills', type: 'multi-select', optionsSource: 'skills' },
    ],
  },
  {
    nodeType: 'agent-assignment',
    label: 'Agent Assignment',
    fields: [
      { name: 'name', label: 'Name', type: 'text', placeholder: 'Assignment name' },
      { name: 'archetypeId', label: 'Archetype', type: 'select', optionsSource: 'archetypes', readOnly: true },
      {
        name: 'status', label: 'Status', type: 'status-select',
        options: [
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
        ],
      },
    ],
  },
  {
    nodeType: 'artifact',
    label: 'Artifact',
    fields: [
      { name: 'name', label: 'Name', type: 'text', placeholder: 'Artifact name' },
      { name: 'description', label: 'Description', type: 'textarea', placeholder: 'What this artifact is' },
      {
        name: 'type', label: 'Type', type: 'select',
        options: [
          { value: 'document', label: 'Document' },
          { value: 'data', label: 'Data' },
          { value: 'deliverable', label: 'Deliverable' },
          { value: 'decision', label: 'Decision' },
          { value: 'template', label: 'Template' },
        ],
      },
      {
        name: 'status', label: 'Status', type: 'status-select',
        options: [
          { value: 'draft', label: 'Draft' },
          { value: 'active', label: 'Active' },
          { value: 'archived', label: 'Archived' },
        ],
      },
      { name: 'producerId', label: 'Producer', type: 'party-select' },
      { name: 'tags', label: 'Tags', type: 'tags', placeholder: 'Comma-separated tags' },
    ],
  },
]

export function getEditSchema(nodeType: NodeType): EntityEditSchema | undefined {
  return ENTITY_EDIT_SCHEMAS.find((s) => s.nodeType === nodeType)
}

export function getEditRequiredSources(schema: EntityEditSchema): OptionsSource[] {
  const sources = new Set<OptionsSource>()
  for (const field of schema.fields) {
    if (field.optionsSource) sources.add(field.optionsSource)
    if (field.type === 'party-select') {
      sources.add('departments')
      sources.add('capabilities')
    }
  }
  return [...sources]
}
