import { useQuery } from '@tanstack/react-query'
import type { NodeType } from '@the-crew/shared-types'
import { apiClient } from '@/lib/api-client'

const NODE_TYPE_TO_API_PATH: Record<string, string> = {
  department: 'departments',
  capability: 'capabilities',
  workflow: 'workflows',
  role: 'roles',
  'agent-archetype': 'agent-archetypes',
  'agent-assignment': 'agent-assignments',
  skill: 'skills',
  contract: 'contracts',
  policy: 'policies',
  artifact: 'artifacts',
  company: 'organizational-units',
  team: 'organizational-units',
  'coordinator-agent': 'lcp-agents',
  'specialist-agent': 'lcp-agents',
  proposal: 'proposals',
}

const EDITABLE_NODE_TYPES = new Set<string>(Object.keys(NODE_TYPE_TO_API_PATH))

export function useEntityDetail(
  projectId: string | null,
  nodeType: NodeType | null,
  entityId: string | null,
) {
  const apiPath = nodeType ? NODE_TYPE_TO_API_PATH[nodeType] : undefined
  const enabled = !!projectId && !!nodeType && !!entityId && !!apiPath && EDITABLE_NODE_TYPES.has(nodeType!)

  return useQuery<Record<string, unknown>>({
    queryKey: ['entity-detail', projectId, nodeType, entityId],
    queryFn: () => apiClient.get(`/projects/${projectId}/${apiPath}/${entityId}`),
    enabled,
    staleTime: 10_000,
  })
}
