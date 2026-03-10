import { useCallback, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
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
}

export interface UseEntityMutationReturn {
  updateEntity: (entityId: string, nodeType: NodeType, patch: Record<string, string>) => Promise<void>
  createEntity: (nodeType: NodeType, data: Record<string, unknown>) => Promise<{ id: string } | undefined>
  isPending: boolean
}

export function useEntityMutation(projectId: string): UseEntityMutationReturn {
  const queryClient = useQueryClient()
  const [isPending, setIsPending] = useState(false)

  const invalidate = useCallback(() => {
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: ['visual-graph', projectId] }),
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] }),
    ])
  }, [queryClient, projectId])

  const updateEntity = useCallback(
    async (entityId: string, nodeType: NodeType, patch: Record<string, string>) => {
      const apiPath = NODE_TYPE_TO_API_PATH[nodeType]
      if (!apiPath) return

      setIsPending(true)
      try {
        await apiClient.patch(
          `/projects/${projectId}/${apiPath}/${entityId}`,
          patch,
        )
        await invalidate()
      } finally {
        setIsPending(false)
      }
    },
    [projectId, invalidate],
  )

  const createEntity = useCallback(
    async (nodeType: NodeType, data: Record<string, unknown>): Promise<{ id: string } | undefined> => {
      const apiPath = NODE_TYPE_TO_API_PATH[nodeType]
      if (!apiPath) return undefined

      setIsPending(true)
      try {
        const result = await apiClient.post<{ id: string }>(
          `/projects/${projectId}/${apiPath}`,
          data,
        )
        await invalidate()
        return result
      } finally {
        setIsPending(false)
      }
    },
    [projectId, invalidate],
  )

  return { updateEntity, createEntity, isPending }
}
