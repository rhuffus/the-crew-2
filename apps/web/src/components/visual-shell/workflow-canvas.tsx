import { useMemo, useCallback, useRef } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  type OnSelectionChangeParams,
  type ReactFlowInstance,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useVisualGraph } from '@/hooks/use-visual-graph'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'
import { graphToFlow, enrichWithValidationCounts } from '@/lib/graph-to-flow'
import { filterGraph } from '@/lib/graph-filter'
import { applyCollapse, getContainerNodeIds, enrichWithCollapseState } from '@/lib/collapse-filter'
import { visualNodeTypes } from './nodes'
import { CanvasToolbar } from './canvas-toolbar'
import { TransitionWrapper } from './transition-wrapper'

interface WorkflowCanvasProps {
  projectId: string
  workflowId: string
}

export function WorkflowCanvas({ projectId, workflowId }: WorkflowCanvasProps) {
  const rfInstance = useRef<ReactFlowInstance | null>(null)
  const { selectNodes, selectEdges, clearSelection, activeLayers, nodeTypeFilter, statusFilter, showValidationOverlay, validationIssues, collapsedNodeIds, transitionDirection, clearTransition } =
    useVisualWorkspaceStore()

  // Fetch full graph — filtering done client-side
  const { data: graph, isLoading, error } = useVisualGraph(
    projectId,
    'L3',
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
    const enrichedNodes = enrichWithCollapseState(flowGraph.nodes, containerIds, collapsedNodeIds, hiddenCounts)
    let result = { nodes: enrichedNodes, edges: flowGraph.edges }
    if (showValidationOverlay && validationIssues.length > 0) {
      result = enrichWithValidationCounts(result, validationIssues, projectId)
    }
    return result
  }, [graph, activeLayers, nodeTypeFilter, statusFilter, collapsedNodeIds, showValidationOverlay, validationIssues, projectId])

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
    rfInstance.current?.fitView({ duration: 300 })
  }, [])

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
    </div>
  )
}
