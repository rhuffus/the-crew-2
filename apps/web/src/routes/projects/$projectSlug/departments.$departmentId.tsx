import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import type { Node } from '@xyflow/react'
import type { NodeType, EdgeType } from '@the-crew/shared-types'
import { VIEW_PRESET_REGISTRY } from '@the-crew/shared-types'
import { VisualShell } from '@/components/visual-shell/visual-shell'
import type { MutationError } from '@/components/visual-shell/mutation-error-banner'
import { CanvasViewport } from '@/components/visual-shell/canvas-viewport'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'
import { useVisualGraph } from '@/hooks/use-visual-graph'
import { useValidations } from '@/hooks/use-validations'
import { useEntityMutation } from '@/hooks/use-entity-mutation'
import { useRelationshipMutation } from '@/hooks/use-relationship-mutation'
import { useUndoRedoStore } from '@/stores/undo-redo-store'
import { useCanvasKeyboard } from '@/hooks/use-canvas-keyboard'
import { DRILLABLE_NODE_TYPES } from '@/components/visual-shell/nodes/visual-node'
import { graphToFlow, enrichWithValidationCounts, applyEdgeEmphasis } from '@/lib/graph-to-flow'
import { filterGraph } from '@/lib/graph-filter'
import { applyCollapse, getContainerNodeIds, enrichWithCollapseState } from '@/lib/collapse-filter'
import { loadViewState, saveViewState } from '@/lib/view-persistence'
import { loadNodePositions, saveNodePositions, clearNodePositions, applyPersistedPositions, updatePosition, type LayoutPositions } from '@/lib/layout-persistence'
import { buildVisualId, resolveDrillTarget } from '@/lib/entity-route-resolver'
import { EntityFormDialog } from '@/components/visual-shell/entity-form-dialog'
import { useOperationsStatus } from '@/hooks/use-operations'
import { enrichWithOperationsBadges } from '@/lib/operations-enrichment'
import { useCurrentProject } from '@/providers/project-provider'

export const Route = createFileRoute('/projects/$projectSlug/departments/$departmentId')({
  component: DepartmentCanvasPage,
})

function DepartmentCanvasPage() {
  const { departmentId } = Route.useParams()
  const { projectId, projectSlug } = useCurrentProject()
  const navigate = useNavigate()
  // Data selectors — each subscribes independently to avoid unnecessary re-renders
  const activeLayers = useVisualWorkspaceStore(s => s.activeLayers)
  const nodeTypeFilter = useVisualWorkspaceStore(s => s.nodeTypeFilter)
  const statusFilter = useVisualWorkspaceStore(s => s.statusFilter)
  const showValidationOverlay = useVisualWorkspaceStore(s => s.showValidationOverlay)
  const showOperationsOverlay = useVisualWorkspaceStore(s => s.showOperationsOverlay)
  const collapsedNodeIds = useVisualWorkspaceStore(s => s.collapsedNodeIds)
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

  // Layout position persistence
  const positionsRef = useRef<LayoutPositions>({})
  const [layoutVersion, setLayoutVersion] = useState(0)
  const layoutScope = `department:${departmentId}`

  // On mount: set scope, project ID, restore persisted state, clear undo stack
  useEffect(() => {
    const store = useVisualWorkspaceStore.getState()
    store.setScope('department', departmentId)
    store.setProjectId(projectId)
    useUndoRedoStore.getState().clear()
    positionsRef.current = loadNodePositions(projectId, layoutScope) ?? {}
    const saved = loadViewState(projectId, `department:${departmentId}`)
    if (saved) {
      store.setActiveLayers(saved.activeLayers)
      store.setNodeTypeFilter(saved.nodeTypeFilter)
      store.setStatusFilter(saved.statusFilter)
      if (saved.activePreset) {
        store.setActivePreset(saved.activePreset)
      }
    }
  }, [projectId, departmentId, layoutScope])

  // Auto-persist view state on changes
  useEffect(() => {
    saveViewState(projectId, `department:${departmentId}`, {
      activeLayers,
      nodeTypeFilter,
      statusFilter,
      activePreset,
    })
  }, [projectId, departmentId, activeLayers, nodeTypeFilter, statusFilter, activePreset])

  // Fetch full graph (no layer filter) — filtering is done client-side
  const { data: graph, isLoading, error } = useVisualGraph(
    projectId,
    'department',
    departmentId,
  )

  // Fetch validation issues for overlay
  const { data: validationResult } = useValidations(projectId)

  // Sync breadcrumb from graph response to store
  useEffect(() => {
    if (graph?.breadcrumb) {
      useVisualWorkspaceStore.getState().setBreadcrumb(graph.breadcrumb)
    }
  }, [graph])

  // Sync validation issues to store
  useEffect(() => {
    useVisualWorkspaceStore.getState().setValidationIssues(validationResult?.issues ?? [])
  }, [validationResult])

  // Fetch operations status with polling (CAV-019)
  const { data: opsStatus } = useOperationsStatus(projectId, 'department', departmentId, { enabled: showOperationsOverlay })

  // Sync operations status to store
  useEffect(() => {
    useVisualWorkspaceStore.getState().setOperationsStatus(showOperationsOverlay && opsStatus ? opsStatus : null)
  }, [opsStatus, showOperationsOverlay])

  // Apply client-side filters, collapse, and enrich with validation counts
  const { nodes, edges } = useMemo(() => {
    if (!graph) return { nodes: [], edges: [] }
    const filtered = filterGraph(graph.nodes, graph.edges, {
      activeLayers,
      nodeTypeFilter,
      statusFilter,
    })
    const containerIds = getContainerNodeIds(filtered.nodes)
    const { nodes: visibleNodes, edges: visibleEdges, hiddenCounts } = applyCollapse(
      filtered.nodes, filtered.edges, collapsedNodeIds,
    )
    const flowGraph = graphToFlow({
      ...graph,
      nodes: visibleNodes,
      edges: visibleEdges,
    })
    // Apply persisted positions over computed layout
    const positionedNodes = applyPersistedPositions(flowGraph.nodes, positionsRef.current)
    const enrichedNodes = enrichWithCollapseState(positionedNodes, containerIds, collapsedNodeIds, hiddenCounts)
    let result = { nodes: enrichedNodes, edges: flowGraph.edges }
    // Apply edge emphasis from active preset
    if (activePreset) {
      const presetDef = VIEW_PRESET_REGISTRY[activePreset]
      result = applyEdgeEmphasis(result, presetDef?.emphasisEdgeTypes)
    }
    if (showValidationOverlay && validationResult?.issues?.length) {
      result = enrichWithValidationCounts(result, validationResult.issues, projectId)
    }
    if (showOperationsOverlay && opsStatus) {
      result = enrichWithOperationsBadges(result, opsStatus)
    }
    return result
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graph, activeLayers, nodeTypeFilter, statusFilter, collapsedNodeIds, showValidationOverlay, validationResult, projectId, layoutVersion, activePreset, showOperationsOverlay, opsStatus])

  // Sync graph nodes to store for explorer (use filtered nodes)
  useEffect(() => {
    if (graph) {
      const filtered = filterGraph(graph.nodes, graph.edges, {
        activeLayers,
        nodeTypeFilter,
        statusFilter,
      })
      const store = useVisualWorkspaceStore.getState()
      store.setGraphNodes(filtered.nodes)
      store.setGraphEdges(filtered.edges)
    }
  }, [graph, activeLayers, nodeTypeFilter, statusFilter])

  // Unified drill-in handler for both double-click and keyboard Enter
  const handleDrillIn = useCallback(
    (nodeId: string) => {
      const state = useVisualWorkspaceStore.getState()
      const node = state.graphNodes.find((n) => n.id === nodeId)
      if (!node || !DRILLABLE_NODE_TYPES.has(node.nodeType)) return

      const target = resolveDrillTarget(node.nodeType, node.entityId, projectSlug)
      if (!target) return

      state.pushNavigation({
        scope: { scopeType: 'department', entityId: departmentId, zoomLevel: 'L2' },
        focusNodeId: nodeId,
      })

      // Trigger drill-in transition animation
      state.startTransition('drill-in', nodeId)

      navigate({ to: target.route })
    },
    [navigate, projectSlug, departmentId],
  )

  const handleNodeDoubleClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      handleDrillIn(node.id)
    },
    [handleDrillIn],
  )

  // Escape with no selection: navigate up to org or previous nav entry
  const handleDrillOut = useCallback(() => {
    const state = useVisualWorkspaceStore.getState()
    const entry = state.popNavigation()

    // Trigger drill-out transition animation
    state.startTransition('drill-out', entry?.focusNodeId ?? departmentId)

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
  }, [navigate, projectSlug, departmentId])

  useCanvasKeyboard({ onDrillIn: handleDrillIn, onDrillOut: handleDrillOut })

  const entityFormNodeType = useVisualWorkspaceStore((s) => s.entityFormNodeType)

  const { updateEntity, createEntity, deleteEntity, isPending: entityPending } = useEntityMutation(projectId, { onError: handleMutationError })
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

  const handleAddEntity = useCallback(
    (nodeType: NodeType) => {
      useVisualWorkspaceStore.getState().showEntityForm(nodeType)
    },
    [],
  )

  const handleEntityCreated = useCallback(
    (nodeType: NodeType, entityId: string) => {
      const visualId = buildVisualId(nodeType, entityId)
      useVisualWorkspaceStore.getState().setPendingFocus(visualId)
      useUndoRedoStore.getState().pushAction({
        description: `Create ${nodeType}`,
        undo: () => deleteEntity(nodeType, entityId),
        redo: async () => { /* entity recreation not supported */ },
        undoOnly: true,
      })
    },
    [deleteEntity],
  )

  // Position persistence: save on drag, clear on auto-layout
  const handleNodeDragStop = useCallback(
    (nodeId: string, position: { x: number; y: number }) => {
      positionsRef.current = updatePosition(positionsRef.current, nodeId, position)
      saveNodePositions(projectId, layoutScope, positionsRef.current)
    },
    [projectId, layoutScope],
  )

  const handleAutoLayout = useCallback(() => {
    positionsRef.current = {}
    clearNodePositions(projectId, layoutScope)
    setLayoutVersion((v) => v + 1)
  }, [projectId, layoutScope])

  // Auto-focus after graph refetch includes newly created node
  useEffect(() => {
    const { pendingFocusNodeId, focusNode, clearPendingFocus } = useVisualWorkspaceStore.getState()
    if (pendingFocusNodeId && graph?.nodes.some((n) => n.id === pendingFocusNodeId)) {
      focusNode(pendingFocusNodeId)
      clearPendingFocus()
    }
  }, [graph])

  return (
    <VisualShell onNodeUpdate={handleNodeUpdate} onNodeDelete={handleNodeDelete} onEdgeCreate={handleEdgeCreate} onEdgeDelete={handleEdgeDelete} onEdgeUpdateMetadata={handleEdgeUpdateMetadata} isPending={isPending} mutationErrors={mutationErrors} onDismissError={handleDismissError}>
      <CanvasViewport
        nodes={nodes}
        edges={edges}
        isLoading={isLoading}
        error={error ? 'Failed to load department graph' : null}
        onNodeDoubleClick={handleNodeDoubleClick}
        onEdgeCreate={handleEdgeCreate}
        onEdgeDelete={handleEdgeDelete}
        onAddEntity={handleAddEntity}
        onNodeDelete={(nodeType, entityId) => deleteEntity(nodeType as NodeType, entityId)}
        onDrillIn={handleDrillIn}
        onNodeDragStop={handleNodeDragStop}
        onAutoLayout={handleAutoLayout}
        isPending={isPending}
      />
      {entityFormNodeType && (
        <EntityFormDialog
          nodeType={entityFormNodeType}
          projectId={projectId}
          scopeContext={{ departmentId }}
          onSubmit={createEntity}
          onCreated={handleEntityCreated}
          onClose={() => useVisualWorkspaceStore.getState().dismissEntityForm()}
        />
      )}
    </VisualShell>
  )
}
