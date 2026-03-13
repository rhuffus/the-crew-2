import { useCallback, useEffect, useMemo } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import type { Node } from '@xyflow/react'
import type { NodeType, EdgeType } from '@the-crew/shared-types'
import { VisualShell } from '@/components/visual-shell/visual-shell'
import { CanvasViewport } from '@/components/visual-shell/canvas-viewport'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'
import { useVisualGraph } from '@/hooks/use-visual-graph'
import { useValidations } from '@/hooks/use-validations'
import { useEntityMutation } from '@/hooks/use-entity-mutation'
import { useRelationshipMutation } from '@/hooks/use-relationship-mutation'
import { useCanvasKeyboard } from '@/hooks/use-canvas-keyboard'
import { useCurrentProject } from '@/providers/project-provider'
import { graphToFlow, enrichWithValidationCounts } from '@/lib/graph-to-flow'

export const Route = createFileRoute('/projects/$projectSlug/workflows/$workflowId/stages/$stageId')({
  component: WorkflowStageCanvasPage,
})

function WorkflowStageCanvasPage() {
  const { workflowId, stageId } = Route.useParams()
  const { projectId, projectSlug } = useCurrentProject()
  const navigate = useNavigate()
  const showValidationOverlay = useVisualWorkspaceStore((s) => s.showValidationOverlay)

  useEffect(() => {
    const state = useVisualWorkspaceStore.getState()
    state.setScope('workflow-stage', stageId)
    state.setProjectId(projectId)
  }, [stageId, projectId])

  // Fetch L4 graph
  const { data: graph, isLoading, error } = useVisualGraph(
    projectId,
    'workflow-stage',
    stageId,
  )

  // Sync breadcrumb from graph response to store
  useEffect(() => {
    if (graph?.breadcrumb) {
      useVisualWorkspaceStore.getState().setBreadcrumb(graph.breadcrumb)
    }
  }, [graph])

  const { data: validationResult } = useValidations(projectId)

  useEffect(() => {
    useVisualWorkspaceStore.getState().setValidationIssues(validationResult?.issues ?? [])
  }, [validationResult])

  // Sync graph nodes to store for keyboard navigation
  useEffect(() => {
    if (graph) {
      const state = useVisualWorkspaceStore.getState()
      state.setGraphNodes(graph.nodes)
      state.setGraphEdges(graph.edges)
    }
  }, [graph])

  // Convert to React Flow format
  const { nodes, edges } = useMemo(() => {
    if (!graph) return { nodes: [], edges: [] }
    const flowGraph = graphToFlow(graph)
    if (showValidationOverlay && validationResult?.issues?.length) {
      return enrichWithValidationCounts(flowGraph, validationResult.issues, projectId)
    }
    return flowGraph
  }, [graph, showValidationOverlay, validationResult, projectId])

  // L4 is terminal — no drill-in from stage
  const handleDrillIn = useCallback(() => {
    // no-op
  }, [])

  // Drill-out: back to parent workflow
  const handleDrillOut = useCallback(() => {
    const state = useVisualWorkspaceStore.getState()
    const entry = state.popNavigation()

    state.startTransition('drill-out', entry?.focusNodeId ?? stageId)

    if (entry?.scope.scopeType === 'workflow' && entry.scope.entityId) {
      navigate({
        to: '/projects/$projectSlug/workflows/$workflowId',
        params: { projectSlug, workflowId: entry.scope.entityId },
      })
    } else {
      // Fallback: go back to the workflow we came from
      navigate({
        to: '/projects/$projectSlug/workflows/$workflowId',
        params: { projectSlug, workflowId },
      })
    }
  }, [navigate, projectSlug, workflowId, stageId])

  useCanvasKeyboard({ onDrillIn: handleDrillIn, onDrillOut: handleDrillOut })

  const { updateEntity, isPending: entityPending } = useEntityMutation(projectId)
  const { createEdge, deleteEdge, updateEdgeMetadata, isPending: relationPending } = useRelationshipMutation(projectId)
  const isPending = entityPending || relationPending

  const handleEdgeCreate = useCallback(
    (edgeType: EdgeType, sourceNodeId: string, targetNodeId: string, metadata?: Record<string, unknown>) => {
      const { graphNodes } = useVisualWorkspaceStore.getState()
      const sourceNode = graphNodes.find((n) => n.id === sourceNodeId)
      const targetNode = graphNodes.find((n) => n.id === targetNodeId)
      if (!sourceNode || !targetNode) return
      createEdge(edgeType, sourceNode, targetNode, metadata)
    },
    [createEdge],
  )

  const handleEdgeDelete = useCallback(
    (edgeType: EdgeType, sourceNodeId: string, targetNodeId: string) => {
      const { graphNodes } = useVisualWorkspaceStore.getState()
      const sourceNode = graphNodes.find((n) => n.id === sourceNodeId)
      const targetNode = graphNodes.find((n) => n.id === targetNodeId)
      if (!sourceNode || !targetNode) return
      deleteEdge(edgeType, sourceNode, targetNode)
    },
    [deleteEdge],
  )

  const handleEdgeUpdateMetadata = useCallback(
    (edgeType: EdgeType, sourceNodeId: string, targetNodeId: string, metadata: Record<string, unknown>) => {
      const { graphNodes } = useVisualWorkspaceStore.getState()
      const sourceNode = graphNodes.find((n) => n.id === sourceNodeId)
      const targetNode = graphNodes.find((n) => n.id === targetNodeId)
      if (!sourceNode || !targetNode) return
      updateEdgeMetadata(edgeType, sourceNode, targetNode, metadata)
    },
    [updateEdgeMetadata],
  )

  const handleNodeUpdate = useCallback(
    (entityId: string, nodeType: NodeType, patch: Record<string, unknown>) => {
      updateEntity(entityId, nodeType, patch)
    },
    [updateEntity],
  )

  const handleNodeDoubleClick = useCallback(
    (_event: React.MouseEvent, _node: Node) => {
      // no-op at L4
    },
    [],
  )

  return (
    <VisualShell onNodeUpdate={handleNodeUpdate} onEdgeCreate={handleEdgeCreate} onEdgeDelete={handleEdgeDelete} onEdgeUpdateMetadata={handleEdgeUpdateMetadata} isPending={isPending}>
      <CanvasViewport
        nodes={nodes}
        edges={edges}
        isLoading={isLoading}
        error={error ? 'Failed to load stage graph' : null}
        onNodeDoubleClick={handleNodeDoubleClick}
        onEdgeCreate={handleEdgeCreate}
        onEdgeDelete={handleEdgeDelete}
        isPending={isPending}
      />
    </VisualShell>
  )
}
