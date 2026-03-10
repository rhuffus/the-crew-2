import { useCallback, useEffect, useMemo } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import type { Node } from '@xyflow/react'
import type { NodeType } from '@the-crew/shared-types'
import { VisualShell } from '@/components/visual-shell/visual-shell'
import { CanvasViewport } from '@/components/visual-shell/canvas-viewport'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'
import { useVisualGraph } from '@/hooks/use-visual-graph'
import { useValidations } from '@/hooks/use-validations'
import { useEntityMutation } from '@/hooks/use-entity-mutation'
import { useCanvasKeyboard } from '@/hooks/use-canvas-keyboard'
import { DRILLABLE_NODE_TYPES } from '@/components/visual-shell/nodes/visual-node'
import { graphToFlow, enrichWithValidationCounts } from '@/lib/graph-to-flow'
import { buildVisualId } from '@/lib/entity-route-resolver'
import { EntityFormDialog } from '@/components/visual-shell/entity-form-dialog'
import { filterGraph } from '@/lib/graph-filter'
import { loadViewState, saveViewState } from '@/lib/view-persistence'

export const Route = createFileRoute('/projects/$projectId/org')({
  component: OrgCanvasPage,
})

function OrgCanvasPage() {
  const { projectId } = Route.useParams()
  const navigate = useNavigate()
  const {
    setView,
    activeLayers,
    nodeTypeFilter,
    statusFilter,
    showValidationOverlay,
    setActiveLayers,
    setNodeTypeFilter,
    setStatusFilter,
    setGraphNodes,
    setGraphEdges,
    setProjectId,
    setValidationIssues,
    setBreadcrumb,
  } = useVisualWorkspaceStore()

  // On mount: set view, project ID, and restore persisted state
  useEffect(() => {
    setView('org')
    setProjectId(projectId)
    const saved = loadViewState(projectId, 'org')
    if (saved) {
      setActiveLayers(saved.activeLayers)
      setNodeTypeFilter(saved.nodeTypeFilter)
      setStatusFilter(saved.statusFilter)
    }
  }, [projectId, setView, setProjectId, setActiveLayers, setNodeTypeFilter, setStatusFilter])

  // Auto-persist view state on changes
  useEffect(() => {
    saveViewState(projectId, 'org', { activeLayers, nodeTypeFilter, statusFilter })
  }, [projectId, activeLayers, nodeTypeFilter, statusFilter])

  // Fetch the full graph (no layer filter) — filtering is done client-side
  const { data: graph, isLoading, error } = useVisualGraph(projectId, 'L1')

  // Fetch validation issues for overlay
  const { data: validationResult } = useValidations(projectId)

  // Sync breadcrumb from graph response to store
  useEffect(() => {
    if (graph?.breadcrumb) {
      setBreadcrumb(graph.breadcrumb)
    }
  }, [graph, setBreadcrumb])

  // Sync validation issues to store
  useEffect(() => {
    setValidationIssues(validationResult?.issues ?? [])
  }, [validationResult, setValidationIssues])

  // Apply client-side filters and enrich with validation counts
  const { nodes, edges } = useMemo(() => {
    if (!graph) return { nodes: [], edges: [] }
    const filtered = filterGraph(graph.nodes, graph.edges, {
      activeLayers,
      nodeTypeFilter,
      statusFilter,
    })
    const flowGraph = graphToFlow({
      ...graph,
      nodes: filtered.nodes,
      edges: filtered.edges,
    })
    if (showValidationOverlay && validationResult?.issues?.length) {
      return enrichWithValidationCounts(flowGraph, validationResult.issues, projectId)
    }
    return flowGraph
  }, [graph, activeLayers, nodeTypeFilter, statusFilter, showValidationOverlay, validationResult, projectId])

  // Sync graph nodes to store for explorer (use filtered nodes)
  useEffect(() => {
    if (graph) {
      const filtered = filterGraph(graph.nodes, graph.edges, {
        activeLayers,
        nodeTypeFilter,
        statusFilter,
      })
      setGraphNodes(filtered.nodes)
      setGraphEdges(filtered.edges)
    }
  }, [graph, activeLayers, nodeTypeFilter, statusFilter, setGraphNodes, setGraphEdges])

  // Unified drill-in handler for both double-click and keyboard Enter
  const handleDrillIn = useCallback(
    (nodeId: string) => {
      const state = useVisualWorkspaceStore.getState()
      const node = state.graphNodes.find((n) => n.id === nodeId)
      if (!node || !DRILLABLE_NODE_TYPES.has(node.nodeType)) return

      // Push current view to navigation stack before navigating
      state.pushNavigation({
        view: 'org',
        entityId: null,
        focusNodeId: nodeId,
      })

      // Trigger drill-in transition animation
      state.startTransition('drill-in', nodeId)

      if (node.nodeType === 'department') {
        navigate({
          to: '/projects/$projectId/departments/$departmentId',
          params: { projectId, departmentId: node.entityId },
        })
      } else if (node.nodeType === 'workflow') {
        navigate({
          to: '/projects/$projectId/workflows/$workflowId',
          params: { projectId, workflowId: node.entityId },
        })
      }
    },
    [navigate, projectId],
  )

  const handleNodeDoubleClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      handleDrillIn(node.id)
    },
    [handleDrillIn],
  )

  // At L1 org, Escape with no selection is a no-op (no parent level)
  const handleDrillOut = useCallback(() => {
    // no-op at L1
  }, [])

  useCanvasKeyboard({ onDrillIn: handleDrillIn, onDrillOut: handleDrillOut })

  const entityFormNodeType = useVisualWorkspaceStore((s) => s.entityFormNodeType)

  const { updateEntity, createEntity } = useEntityMutation(projectId)

  const handleNodeUpdate = useCallback(
    (entityId: string, nodeType: NodeType, patch: Record<string, string>) => {
      updateEntity(entityId, nodeType, patch)
    },
    [updateEntity],
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
    },
    [],
  )

  // Auto-focus after graph refetch includes newly created node
  useEffect(() => {
    const { pendingFocusNodeId, focusNode, clearPendingFocus } = useVisualWorkspaceStore.getState()
    if (pendingFocusNodeId && graph?.nodes.some((n) => n.id === pendingFocusNodeId)) {
      focusNode(pendingFocusNodeId)
      clearPendingFocus()
    }
  }, [graph])

  return (
    <VisualShell onNodeUpdate={handleNodeUpdate}>
      <CanvasViewport
        nodes={nodes}
        edges={edges}
        isLoading={isLoading}
        error={error ? 'Failed to load organization graph' : null}
        onNodeDoubleClick={handleNodeDoubleClick}
        onAddEntity={handleAddEntity}
      />
      {entityFormNodeType && (
        <EntityFormDialog
          nodeType={entityFormNodeType}
          projectId={projectId}
          onSubmit={createEntity}
          onCreated={handleEntityCreated}
          onClose={() => useVisualWorkspaceStore.getState().dismissEntityForm()}
        />
      )}
    </VisualShell>
  )
}
