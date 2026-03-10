import type { NodeType } from '@the-crew/shared-types'
import { useDepartments } from './use-departments'
import { useRoles } from './use-roles'
import { useCapabilities } from './use-capabilities'
import { useAgentArchetypes } from './use-agent-archetypes'
import { getSchemaForType, getRequiredOptionsSources } from '@/lib/entity-form-schemas'

interface SelectOption {
  value: string
  label: string
}

export interface UseEntityFormDataReturn {
  optionsMap: Record<string, SelectOption[]>
  isLoading: boolean
}

export function useEntityFormData(projectId: string, nodeType: NodeType | null): UseEntityFormDataReturn {
  const schema = nodeType ? getSchemaForType(nodeType) : undefined
  const sources = schema ? getRequiredOptionsSources(schema) : []

  const needsDepartments = sources.includes('departments')
  const needsRoles = sources.includes('roles')
  const needsCapabilities = sources.includes('capabilities')
  const needsArchetypes = sources.includes('archetypes')

  const { data: departments, isLoading: deptLoading } = useDepartments(projectId)
  const { data: roles, isLoading: rolesLoading } = useRoles(projectId)
  const { data: capabilities, isLoading: capLoading } = useCapabilities(projectId)
  const { data: archetypes, isLoading: archLoading } = useAgentArchetypes(projectId)

  const isLoading =
    (needsDepartments && deptLoading) ||
    (needsRoles && rolesLoading) ||
    (needsCapabilities && capLoading) ||
    (needsArchetypes && archLoading)

  const optionsMap: Record<string, SelectOption[]> = {}

  if (needsDepartments && departments) {
    optionsMap.departments = departments.map((d) => ({ value: d.id, label: d.name }))
  }
  if (needsRoles && roles) {
    optionsMap.roles = roles.map((r) => ({ value: r.id, label: r.name }))
  }
  if (needsCapabilities && capabilities) {
    optionsMap.capabilities = capabilities.map((c) => ({ value: c.id, label: c.name }))
  }
  if (needsArchetypes && archetypes) {
    optionsMap.archetypes = archetypes.map((a) => ({ value: a.id, label: a.name }))
  }

  return { optionsMap, isLoading }
}
