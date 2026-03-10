import { useCallback, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type {
  EdgeType,
  VisualNodeDto,
  WorkflowParticipantDto,
} from '@the-crew/shared-types'
import { apiClient } from '@/lib/api-client'
import {
  type MutableEntityType,
  type ParticipatesInMetadata,
  resolveEdgeCreation,
  resolveEdgeDeletion,
  requiresCurrentData,
  getEntityToFetch,
} from '@/lib/relationship-mutations'

// --- Entity API path mapping ---

const ENTITY_PATHS: Record<MutableEntityType, string> = {
  department: 'departments',
  capability: 'capabilities',
  workflow: 'workflows',
  role: 'roles',
  'agent-archetype': 'agent-archetypes',
  skill: 'skills',
  contract: 'contracts',
  policy: 'policies',
}

/** Maps a MutableEntityType to the REST API path segment. */
export function getEntityApiPath(entityType: MutableEntityType): string {
  return ENTITY_PATHS[entityType]
}

// --- Hook interfaces ---

export interface UseRelationshipMutationReturn {
  createEdge: (
    edgeType: EdgeType,
    sourceNode: VisualNodeDto,
    targetNode: VisualNodeDto,
    metadata?: Record<string, unknown>,
  ) => Promise<void>

  deleteEdge: (
    edgeType: EdgeType,
    sourceNode: VisualNodeDto,
    targetNode: VisualNodeDto,
  ) => Promise<void>

  updateEdgeMetadata: (
    edgeType: EdgeType,
    sourceNode: VisualNodeDto,
    targetNode: VisualNodeDto,
    metadata: Record<string, unknown>,
  ) => Promise<void>

  isPending: boolean
}

// --- Hook implementation ---

export function useRelationshipMutation(
  projectId: string,
): UseRelationshipMutationReturn {
  const queryClient = useQueryClient()
  const [isPending, setIsPending] = useState(false)

  const fetchEntity = useCallback(
    (entityType: MutableEntityType, entityId: string) =>
      apiClient.get<Record<string, unknown>>(
        `/projects/${projectId}/${getEntityApiPath(entityType)}/${entityId}`,
      ),
    [projectId],
  )

  const patchEntity = useCallback(
    (
      entityType: MutableEntityType,
      entityId: string,
      patch: Record<string, unknown>,
    ) =>
      apiClient.patch(
        `/projects/${projectId}/${getEntityApiPath(entityType)}/${entityId}`,
        patch,
      ),
    [projectId],
  )

  const invalidateGraph = useCallback(
    () =>
      queryClient.invalidateQueries({
        queryKey: ['visual-graph', projectId],
      }),
    [queryClient, projectId],
  )

  const createEdge = useCallback(
    async (
      edgeType: EdgeType,
      sourceNode: VisualNodeDto,
      targetNode: VisualNodeDto,
      metadata?: Record<string, unknown>,
    ): Promise<void> => {
      setIsPending(true)
      try {
        let currentEntityData: Record<string, unknown> | undefined
        if (requiresCurrentData(edgeType)) {
          const toFetch = getEntityToFetch(edgeType, sourceNode, targetNode)
          if (toFetch) {
            currentEntityData = await fetchEntity(
              toFetch.entityType,
              toFetch.entityId,
            )
          }
        }
        const mutation = resolveEdgeCreation(
          edgeType,
          sourceNode,
          targetNode,
          metadata,
          currentEntityData,
        )
        await patchEntity(mutation.entityType, mutation.entityId, mutation.patch)
        await invalidateGraph()
      } finally {
        setIsPending(false)
      }
    },
    [fetchEntity, patchEntity, invalidateGraph],
  )

  const deleteEdge = useCallback(
    async (
      edgeType: EdgeType,
      sourceNode: VisualNodeDto,
      targetNode: VisualNodeDto,
    ): Promise<void> => {
      setIsPending(true)
      try {
        let currentEntityData: Record<string, unknown> | undefined
        if (requiresCurrentData(edgeType)) {
          const toFetch = getEntityToFetch(edgeType, sourceNode, targetNode)
          if (toFetch) {
            currentEntityData = await fetchEntity(
              toFetch.entityType,
              toFetch.entityId,
            )
          }
        }
        const mutation = resolveEdgeDeletion(
          edgeType,
          sourceNode,
          targetNode,
          currentEntityData,
        )
        await patchEntity(mutation.entityType, mutation.entityId, mutation.patch)
        await invalidateGraph()
      } finally {
        setIsPending(false)
      }
    },
    [fetchEntity, patchEntity, invalidateGraph],
  )

  const updateEdgeMetadata = useCallback(
    async (
      edgeType: EdgeType,
      sourceNode: VisualNodeDto,
      targetNode: VisualNodeDto,
      metadata: Record<string, unknown>,
    ): Promise<void> => {
      if (edgeType !== 'participates_in') {
        throw new Error(
          `Edge type "${edgeType}" does not support metadata editing in v1`,
        )
      }
      setIsPending(true)
      try {
        const currentData = await fetchEntity('workflow', targetNode.entityId)
        const participants = Array.isArray(currentData.participants)
          ? (currentData.participants as WorkflowParticipantDto[])
          : []
        const updatedParticipants = participants.map((p) =>
          p.participantId === sourceNode.entityId
            ? {
                ...p,
                responsibility: (metadata as unknown as ParticipatesInMetadata)
                  .responsibility,
              }
            : p,
        )
        await patchEntity('workflow', targetNode.entityId, {
          participants: updatedParticipants,
        })
        await invalidateGraph()
      } finally {
        setIsPending(false)
      }
    },
    [fetchEntity, patchEntity, invalidateGraph],
  )

  return { createEdge, deleteEdge, updateEdgeMetadata, isPending }
}
