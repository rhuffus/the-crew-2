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
  artifact: 'artifacts',
}

export interface UseEntityMutationReturn {
  updateEntity: (entityId: string, nodeType: NodeType, patch: Record<string, unknown>) => Promise<void>
  createEntity: (nodeType: NodeType, data: Record<string, unknown>) => Promise<{ id: string } | undefined>
  deleteEntity: (nodeType: NodeType, entityId: string) => Promise<void>
  isPending: boolean
  lastError: string | null
}

export interface UseEntityMutationOptions {
  onError?: (error: Error) => void
}

export function useEntityMutation(projectId: string, options?: UseEntityMutationOptions): UseEntityMutationReturn {
  const queryClient = useQueryClient()
  const [isPending, setIsPending] = useState(false)
  const [lastError, setLastError] = useState<string | null>(null)

  const invalidate = useCallback(() => {
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: ['visual-graph', projectId] }),
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] }),
      queryClient.invalidateQueries({ queryKey: ['entity-detail'] }),
    ])
  }, [queryClient, projectId])

  const handleError = useCallback(
    (err: unknown) => {
      const error = err instanceof Error ? err : new Error(String(err))
      setLastError(error.message)
      options?.onError?.(error)
    },
    [options],
  )

  const updateEntity = useCallback(
    async (entityId: string, nodeType: NodeType, patch: Record<string, unknown>) => {
      const apiPath = NODE_TYPE_TO_API_PATH[nodeType]
      if (!apiPath) return

      setIsPending(true)
      setLastError(null)
      try {
        await apiClient.patch(
          `/projects/${projectId}/${apiPath}/${entityId}`,
          patch,
        )
        await invalidate()
      } catch (err) {
        handleError(err)
      } finally {
        setIsPending(false)
      }
    },
    [projectId, invalidate, handleError],
  )

  const createEntity = useCallback(
    async (nodeType: NodeType, data: Record<string, unknown>): Promise<{ id: string } | undefined> => {
      const apiPath = NODE_TYPE_TO_API_PATH[nodeType]
      if (!apiPath) return undefined

      setIsPending(true)
      setLastError(null)
      try {
        const result = await apiClient.post<{ id: string }>(
          `/projects/${projectId}/${apiPath}`,
          data,
        )
        await invalidate()
        return result
      } catch (err) {
        handleError(err)
        return undefined
      } finally {
        setIsPending(false)
      }
    },
    [projectId, invalidate, handleError],
  )

  const deleteEntity = useCallback(
    async (nodeType: NodeType, entityId: string): Promise<void> => {
      const apiPath = NODE_TYPE_TO_API_PATH[nodeType]
      if (!apiPath) return

      setIsPending(true)
      setLastError(null)
      try {
        await apiClient.delete(
          `/projects/${projectId}/${apiPath}/${entityId}`,
        )
        await invalidate()
      } catch (err) {
        handleError(err)
      } finally {
        setIsPending(false)
      }
    },
    [projectId, invalidate, handleError],
  )

  return { updateEntity, createEntity, deleteEntity, isPending, lastError }
}
