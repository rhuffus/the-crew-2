import type { NodeType, ZoomLevel } from '@the-crew/shared-types'

export type FieldType = 'text' | 'textarea' | 'select' | 'tags' | 'party-select'
export type OptionsSource = 'departments' | 'roles' | 'capabilities' | 'archetypes'

export interface FormFieldSchema {
  name: string
  label: string
  type: FieldType
  placeholder?: string
  required?: boolean
  options?: { value: string; label: string }[]
  optionsSource?: OptionsSource
  defaultValue?: string
  conditional?: { field: string; value: string }
}

export interface EntityFormSchema {
  nodeType: NodeType
  label: string
  fields: FormFieldSchema[]
  scopeAutoFill?: Record<string, string>
}

export const ENTITY_FORM_SCHEMAS: EntityFormSchema[] = [
  {
    nodeType: 'department',
    label: 'Department',
    fields: [
      { name: 'name', label: 'Name', type: 'text', placeholder: 'Department name', required: true },
      { name: 'description', label: 'Description', type: 'textarea', placeholder: 'What this department does' },
      { name: 'mandate', label: 'Mandate', type: 'textarea', placeholder: 'Department mandate' },
      { name: 'parentId', label: 'Parent Department', type: 'select', optionsSource: 'departments' },
    ],
  },
  {
    nodeType: 'capability',
    label: 'Capability',
    fields: [
      { name: 'name', label: 'Name', type: 'text', placeholder: 'Capability name', required: true },
      { name: 'description', label: 'Description', type: 'textarea', placeholder: 'What this capability provides' },
      { name: 'ownerDepartmentId', label: 'Owner Department', type: 'select', optionsSource: 'departments' },
    ],
    scopeAutoFill: { ownerDepartmentId: 'departmentId' },
  },
  {
    nodeType: 'role',
    label: 'Role',
    fields: [
      { name: 'name', label: 'Name', type: 'text', placeholder: 'Role name', required: true },
      { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Role description' },
      { name: 'departmentId', label: 'Department', type: 'select', optionsSource: 'departments', required: true },
      { name: 'accountability', label: 'Accountability', type: 'textarea', placeholder: 'What this role is accountable for' },
      { name: 'authority', label: 'Authority', type: 'textarea', placeholder: 'What authority this role has' },
    ],
    scopeAutoFill: { departmentId: 'departmentId' },
  },
  {
    nodeType: 'workflow',
    label: 'Workflow',
    fields: [
      { name: 'name', label: 'Name', type: 'text', placeholder: 'Workflow name', required: true },
      { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Workflow description' },
      { name: 'ownerDepartmentId', label: 'Owner Department', type: 'select', optionsSource: 'departments' },
      { name: 'triggerDescription', label: 'Trigger', type: 'text', placeholder: 'What triggers this workflow' },
    ],
    scopeAutoFill: { ownerDepartmentId: 'departmentId' },
  },
  {
    nodeType: 'contract',
    label: 'Contract',
    fields: [
      { name: 'name', label: 'Name', type: 'text', placeholder: 'Contract name', required: true },
      { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Contract description' },
      {
        name: 'type', label: 'Type', type: 'select', required: true,
        options: [
          { value: 'SLA', label: 'SLA' },
          { value: 'DataContract', label: 'Data Contract' },
          { value: 'InterfaceContract', label: 'Interface Contract' },
          { value: 'OperationalAgreement', label: 'Operational Agreement' },
        ],
        defaultValue: 'SLA',
      },
      { name: 'provider', label: 'Provider', type: 'party-select' },
      { name: 'consumer', label: 'Consumer', type: 'party-select' },
    ],
  },
  {
    nodeType: 'policy',
    label: 'Policy',
    fields: [
      { name: 'name', label: 'Name', type: 'text', placeholder: 'Policy name', required: true },
      { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Policy description' },
      {
        name: 'scope', label: 'Scope', type: 'select', required: true,
        options: [
          { value: 'global', label: 'Global' },
          { value: 'department', label: 'Department' },
        ],
        defaultValue: 'global',
      },
      {
        name: 'departmentId', label: 'Department', type: 'select', optionsSource: 'departments',
        conditional: { field: 'scope', value: 'department' },
      },
      {
        name: 'type', label: 'Type', type: 'select', required: true,
        options: [
          { value: 'approval-gate', label: 'Approval Gate' },
          { value: 'constraint', label: 'Constraint' },
          { value: 'rule', label: 'Rule' },
        ],
        defaultValue: 'constraint',
      },
      {
        name: 'enforcement', label: 'Enforcement', type: 'select', required: true,
        options: [
          { value: 'mandatory', label: 'Mandatory' },
          { value: 'advisory', label: 'Advisory' },
        ],
        defaultValue: 'mandatory',
      },
      { name: 'condition', label: 'Condition', type: 'textarea', placeholder: 'Policy condition', required: true },
    ],
    scopeAutoFill: { departmentId: 'departmentId' },
  },
  {
    nodeType: 'skill',
    label: 'Skill',
    fields: [
      { name: 'name', label: 'Name', type: 'text', placeholder: 'Skill name', required: true },
      { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Skill description' },
      { name: 'category', label: 'Category', type: 'text', placeholder: 'e.g. technical, leadership', required: true },
      { name: 'tags', label: 'Tags', type: 'tags', placeholder: 'Comma-separated tags' },
    ],
  },
  {
    nodeType: 'agent-archetype',
    label: 'Agent Archetype',
    fields: [
      { name: 'name', label: 'Name', type: 'text', placeholder: 'Archetype name', required: true },
      { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Archetype description' },
      { name: 'roleId', label: 'Role', type: 'select', optionsSource: 'roles', required: true },
      { name: 'departmentId', label: 'Department', type: 'select', optionsSource: 'departments', required: true },
    ],
    scopeAutoFill: { departmentId: 'departmentId' },
  },
  {
    nodeType: 'agent-assignment',
    label: 'Agent Assignment',
    fields: [
      { name: 'name', label: 'Name', type: 'text', placeholder: 'Assignment name', required: true },
      { name: 'archetypeId', label: 'Archetype', type: 'select', optionsSource: 'archetypes', required: true },
    ],
  },
]

const L1_TYPES: NodeType[] = ['department']
const L2_TYPES: NodeType[] = [
  'role', 'capability', 'workflow', 'contract', 'policy',
  'skill', 'agent-archetype', 'agent-assignment',
]

export function getAddableTypes(zoomLevel: ZoomLevel): NodeType[] {
  switch (zoomLevel) {
    case 'L1': return L1_TYPES
    case 'L2': return L2_TYPES
    default: return []
  }
}

export function getSchemaForType(nodeType: NodeType): EntityFormSchema | undefined {
  return ENTITY_FORM_SCHEMAS.find((s) => s.nodeType === nodeType)
}

export function getRequiredOptionsSources(schema: EntityFormSchema): OptionsSource[] {
  const sources = new Set<OptionsSource>()
  for (const field of schema.fields) {
    if (field.optionsSource) sources.add(field.optionsSource)
    if (field.type === 'party-select') sources.add('departments')
    if (field.type === 'party-select') sources.add('capabilities')
  }
  return [...sources]
}
