import { useCallback, useEffect, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import type { NodeType, EdgeType } from '@the-crew/shared-types'
import { SCOPE_REGISTRY } from '@the-crew/shared-types'
import { VisualShell } from '@/components/visual-shell/visual-shell'
import type { MutationError } from '@/components/visual-shell/mutation-error-banner'
import { WorkflowCanvas } from '@/components/visual-shell/workflow-canvas'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'
import { useValidations } from '@/hooks/use-validations'
import { useVisualGraph } from '@/hooks/use-visual-graph'
import { useOperationsStatus } from '@/hooks/use-operations'
import { useEntityMutation } from '@/hooks/use-entity-mutation'
import { useRelationshipMutation } from '@/hooks/use-relationship-mutation'
import { useUndoRedoStore } from '@/stores/undo-redo-store'
import { useCanvasKeyboard } from '@/hooks/use-canvas-keyboard'
import { loadViewState, saveViewState } from '@/lib/view-persistence'
import { useCurrentProject } from '@/providers/project-provider'

export const Route = createFileRoute('/projects/$projectSlug/workflows/$workflowId')({
  component: WorkflowCanvasPage,
})

function WorkflowCanvasPage() {
  const { workflowId } = Route.useParams()
  const { projectId, projectSlug } = useCurrentProject()
  const navigate = useNavigate()
  // Data selectors — each subscribes independently to avoid unnecessary re-renders
  const showOperationsOverlay = useVisualWorkspaceStore(s => s.showOperationsOverlay)
  const activeLayers = useVisualWorkspaceStore(s => s.activeLayers)
  const nodeTypeFilter = useVisualWorkspaceStore(s => s.nodeTypeFilter)
  const statusFilter = useVisualWorkspaceStore(s => s.statusFilter)
  const activePreset = useVisualWorkspaceStore(s => s.activePreset)

  // Mutation error state
  const [mutationErrors, setMutationErrors] = useState<MutationError[]>([])

  const handleMutationError = useCallback((error: Error) => {
    setMutationErrors((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random()}`, message: error.message, timestamp: Date.now() },
    ])
  }, [])

  const handleDismissError = useCallback((id: string) => {
    setMutationErrors((prev) => prev.filter((e) => e.id !== id))
  }, [])

  useEffect(() => {
    const store = useVisualWorkspaceStore.getState()
    store.setScope('workflow', workflowId)
    store.setProjectId(projectId)
    useUndoRedoStore.getState().clear()

    // Restore view state persistence (parity with org/dept routes)
    const saved = loadViewState(projectId, `workflow:${workflowId}`)
    if (saved) {
      store.setActiveLayers(saved.activeLayers)
      store.setNodeTypeFilter(saved.nodeTypeFilter)
      store.setStatusFilter(saved.statusFilter)
      if (saved.activePreset) {
        store.setActivePreset(saved.activePreset)
      }
    }
  }, [workflowId, projectId])

  // Auto-persist view state on changes
  useEffect(() => {
    saveViewState(projectId, `workflow:${workflowId}`, {
      activeLayers,
      nodeTypeFilter,
      statusFilter,
      activePreset,
    })
  }, [projectId, workflowId, activeLayers, nodeTypeFilter, statusFilter, activePreset])

  // Fetch graph to get breadcrumb data
  const { data: graph } = useVisualGraph(projectId, 'workflow', workflowId)

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

  // Fetch operations status with polling (CAV-019)
  const { data: opsStatus } = useOperationsStatus(projectId, 'workflow', workflowId, { enabled: showOperationsOverlay })

  // Sync operations status to store
  useEffect(() => {
    useVisualWorkspaceStore.getState().setOperationsStatus(showOperationsOverlay && opsStatus ? opsStatus : null)
  }, [opsStatus, showOperationsOverlay])

  // Sync graph nodes to store for keyboard navigation (Tab cycling)
  useEffect(() => {
    if (graph) {
      const store = useVisualWorkspaceStore.getState()
      store.setGraphNodes(graph.nodes)
      store.setGraphEdges(graph.edges)
    }
  }, [graph])

  // Drill into workflow-stage (L4) if SCOPE_REGISTRY allows
  const handleDrillIn = useCallback(
    (nodeId: string) => {
      const state = useVisualWorkspaceStore.getState()
      const node = state.graphNodes.find((n) => n.id === nodeId)
      if (!node) return

      // Check if this node type is a drillable child of workflow scope
      const wfDef = SCOPE_REGISTRY.workflow
      const childScope = Object.values(SCOPE_REGISTRY).find(
        def => def.rootNodeType === node.nodeType && wfDef.drillableChildScopes.includes(def.scopeType),
      )
      if (!childScope) return

      state.pushNavigation({
        scope: { scopeType: 'workflow', entityId: workflowId, zoomLevel: 'L3' },
        focusNodeId: nodeId,
      })

      state.startTransition('drill-in', nodeId)

      navigate({
        to: `/projects/${projectSlug}/workflows/${workflowId}/stages/${node.entityId}`,
      })
    },
    [navigate, projectSlug, workflowId],
  )

  // Escape with no selection: navigate up to parent department or org
  const handleDrillOut = useCallback(() => {
    const state = useVisualWorkspaceStore.getState()
    const entry = state.popNavigation()

    // Trigger drill-out transition animation
    state.startTransition('drill-out', entry?.focusNodeId ?? workflowId)

    if (entry?.scope.scopeType === 'department' && entry.scope.entityId) {
      navigate({
        to: '/projects/$projectSlug/departments/$departmentId',
        params: { projectSlug, departmentId: entry.scope.entityId },
      })
    } else {
      navigate({
        to: '/projects/$projectSlug/org',
        params: { projectSlug },
      })
    }
  }, [navigate, projectSlug, workflowId])

  useCanvasKeyboard({ onDrillIn: handleDrillIn, onDrillOut: handleDrillOut })

  const { updateEntity, deleteEntity, isPending: entityPending } = useEntityMutation(projectId, { onError: handleMutationError })
  const { createEdge, deleteEdge, updateEdgeMetadata, isPending: relationPending } = useRelationshipMutation(projectId, { onError: handleMutationError })
  const isPending = entityPending || relationPending

  const handleEdgeCreate = useCallback(
    (edgeType: EdgeType, sourceNodeId: string, targetNodeId: string, metadata?: Record<string, unknown>) => {
      const { graphNodes } = useVisualWorkspaceStore.getState()
      const sourceNode = graphNodes.find((n) => n.id === sourceNodeId)
      const targetNode = graphNodes.find((n) => n.id === targetNodeId)
      if (!sourceNode || !targetNode) return
      const snapSource = { ...sourceNode }
      const snapTarget = { ...targetNode }
      createEdge(edgeType, snapSource, snapTarget, metadata)
      useUndoRedoStore.getState().pushAction({
        description: `Create ${edgeType}`,
        undo: () => deleteEdge(edgeType, snapSource, snapTarget),
        redo: () => createEdge(edgeType, snapSource, snapTarget, metadata),
      })
    },
    [createEdge, deleteEdge],
  )

  const handleEdgeDelete = useCallback(
    (edgeType: EdgeType, sourceNodeId: string, targetNodeId: string) => {
      const { graphNodes } = useVisualWorkspaceStore.getState()
      const sourceNode = graphNodes.find((n) => n.id === sourceNodeId)
      const targetNode = graphNodes.find((n) => n.id === targetNodeId)
      if (!sourceNode || !targetNode) return
      const snapSource = { ...sourceNode }
      const snapTarget = { ...targetNode }
      deleteEdge(edgeType, snapSource, snapTarget)
      useUndoRedoStore.getState().pushAction({
        description: `Delete ${edgeType}`,
        undo: () => createEdge(edgeType, snapSource, snapTarget),
        redo: () => deleteEdge(edgeType, snapSource, snapTarget),
      })
    },
    [createEdge, deleteEdge],
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

  const handleNodeDelete = useCallback(
    (entityId: string, nodeType: NodeType) => {
      deleteEntity(nodeType, entityId)
    },
    [deleteEntity],
  )

  return (
    <VisualShell
      onNodeUpdate={handleNodeUpdate}
      onNodeDelete={handleNodeDelete}
      onEdgeCreate={handleEdgeCreate}
      onEdgeDelete={handleEdgeDelete}
      onEdgeUpdateMetadata={handleEdgeUpdateMetadata}
      isPending={isPending}
      mutationErrors={mutationErrors}
      onDismissError={handleDismissError}
    >
      <WorkflowCanvas projectId={projectId} workflowId={workflowId} />
    </VisualShell>
  )
}
