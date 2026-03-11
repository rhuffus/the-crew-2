import { useMemo, useCallback, useRef, useEffect, useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  type Node,
  type OnSelectionChangeParams,
  type ReactFlowInstance,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useVisualGraph } from '@/hooks/use-visual-graph'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'
import { VIEW_PRESET_REGISTRY } from '@the-crew/shared-types'
import { graphToFlow, enrichWithValidationCounts, applyEdgeEmphasis } from '@/lib/graph-to-flow'
import { enrichWithOperationsBadges } from '@/lib/operations-enrichment'
import { filterGraph } from '@/lib/graph-filter'
import { applyCollapse, getContainerNodeIds, enrichWithCollapseState } from '@/lib/collapse-filter'
import { loadNodePositions, saveNodePositions, clearNodePositions, applyPersistedPositions, updatePosition, type LayoutPositions } from '@/lib/layout-persistence'
import { visualNodeTypes } from './nodes'
import { CanvasToolbar } from './canvas-toolbar'
import { TransitionWrapper } from './transition-wrapper'
import { CanvasContextMenu } from './context-menu'

interface WorkflowCanvasProps {
  projectId: string
  workflowId: string
}

export function WorkflowCanvas({ projectId, workflowId }: WorkflowCanvasProps) {
  const rfInstance = useRef<ReactFlowInstance | null>(null)
  // Data selectors — each subscribes independently to avoid unnecessary re-renders
  const activeLayers = useVisualWorkspaceStore(s => s.activeLayers)
  const nodeTypeFilter = useVisualWorkspaceStore(s => s.nodeTypeFilter)
  const statusFilter = useVisualWorkspaceStore(s => s.statusFilter)
  const showValidationOverlay = useVisualWorkspaceStore(s => s.showValidationOverlay)
  const showOperationsOverlay = useVisualWorkspaceStore(s => s.showOperationsOverlay)
  const operationsStatus = useVisualWorkspaceStore(s => s.operationsStatus)
  const validationIssues = useVisualWorkspaceStore(s => s.validationIssues)
  const collapsedNodeIds = useVisualWorkspaceStore(s => s.collapsedNodeIds)
  const transitionDirection = useVisualWorkspaceStore(s => s.transitionDirection)
  const activePreset = useVisualWorkspaceStore(s => s.activePreset)
  // Actions — stable references, won't cause re-renders
  const selectNodes = useVisualWorkspaceStore(s => s.selectNodes)
  const selectEdges = useVisualWorkspaceStore(s => s.selectEdges)
  const clearSelection = useVisualWorkspaceStore(s => s.clearSelection)
  const clearTransition = useVisualWorkspaceStore(s => s.clearTransition)
  const showContextMenu = useVisualWorkspaceStore(s => s.showContextMenu)
  const dismissContextMenu = useVisualWorkspaceStore(s => s.dismissContextMenu)

  // Layout position persistence
  const positionsRef = useRef<LayoutPositions>({})
  const [layoutVersion, setLayoutVersion] = useState(0)
  const layoutScope = `workflow:${workflowId}`

  useEffect(() => {
    positionsRef.current = loadNodePositions(projectId, layoutScope) ?? {}
  }, [projectId, layoutScope])

  // Fetch full graph — filtering done client-side
  const { data: graph, isLoading, error } = useVisualGraph(
    projectId,
    'workflow',
    workflowId,
  )

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
    if (showValidationOverlay && validationIssues.length > 0) {
      result = enrichWithValidationCounts(result, validationIssues, projectId)
    }
    if (showOperationsOverlay && operationsStatus) {
      result = enrichWithOperationsBadges(result, operationsStatus)
    }
    return result
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graph, activeLayers, nodeTypeFilter, statusFilter, collapsedNodeIds, showValidationOverlay, validationIssues, projectId, layoutVersion, activePreset, showOperationsOverlay, operationsStatus])

  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes, edges: selectedEdges }: OnSelectionChangeParams) => {
      if (selectedNodes.length > 0) {
        selectNodes(selectedNodes.map((n) => n.id))
      } else if (selectedEdges.length > 0) {
        selectEdges(selectedEdges.map((e) => e.id))
      } else {
        clearSelection()
      }
    },
    [selectNodes, selectEdges, clearSelection],
  )

  const handleZoomIn = useCallback(() => rfInstance.current?.zoomIn(), [])
  const handleZoomOut = useCallback(() => rfInstance.current?.zoomOut(), [])
  const handleFitView = useCallback(() => rfInstance.current?.fitView(), [])
  const handleAutoLayout = useCallback(() => {
    positionsRef.current = {}
    clearNodePositions(projectId, layoutScope)
    setLayoutVersion((v) => v + 1)
    setTimeout(() => rfInstance.current?.fitView({ duration: 300 }), 50)
  }, [projectId, layoutScope])

  const handleNodeDragStop = useCallback(
    (_event: React.MouseEvent, _node: Node, draggedNodes: Node[]) => {
      for (const n of draggedNodes) {
        positionsRef.current = updatePosition(positionsRef.current, n.id, n.position)
      }
      saveNodePositions(projectId, layoutScope, positionsRef.current)
    },
    [projectId, layoutScope],
  )

  // Context menu handlers (CAV-008)
  const handleNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault()
      showContextMenu(event.clientX, event.clientY, 'node', node.id)
    },
    [showContextMenu],
  )

  const handlePaneContextMenu = useCallback(
    (event: MouseEvent | React.MouseEvent) => {
      event.preventDefault()
      showContextMenu(event.clientX, event.clientY, 'pane')
    },
    [showContextMenu],
  )

  const handlePaneClick = useCallback(() => {
    if (useVisualWorkspaceStore.getState().contextMenu) {
      dismissContextMenu()
    }
  }, [dismissContextMenu])

  if (isLoading) {
    return (
      <div data-testid="workflow-canvas-loading" className="flex flex-1 items-center justify-center text-slate-400">
        Loading workflow...
      </div>
    )
  }

  if (error) {
    return (
      <div data-testid="workflow-canvas-error" className="flex flex-1 items-center justify-center text-red-500">
        Failed to load workflow graph
      </div>
    )
  }

  return (
    <div data-testid="workflow-canvas" className="flex flex-1 flex-col overflow-hidden">
      <CanvasToolbar
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitView={handleFitView}
        onAutoLayout={handleAutoLayout}
      />
      <TransitionWrapper direction={transitionDirection} onTransitionEnd={clearTransition}>
        <div className="h-full w-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={visualNodeTypes}
            onInit={(instance) => {
              rfInstance.current = instance
            }}
            onSelectionChange={onSelectionChange}
            onNodeDragStop={handleNodeDragStop}
            onNodeContextMenu={handleNodeContextMenu}
            onPaneContextMenu={handlePaneContextMenu}
            onPaneClick={handlePaneClick}
            fitView
            minZoom={0.1}
            maxZoom={4}
            proOptions={{ hideAttribution: true }}
          >
            <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
            <Controls showInteractive={false} />
            <MiniMap zoomable pannable />
          </ReactFlow>
        </div>
      </TransitionWrapper>
      <CanvasContextMenu
        onFitView={handleFitView}
        onAutoLayout={handleAutoLayout}
      />
    </div>
  )
}
