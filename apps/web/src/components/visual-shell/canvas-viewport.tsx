import { useCallback, useEffect, useRef } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type ReactFlowInstance,
  type Node,
  type Edge,
  type Connection,
  type OnSelectionChangeParams,
  type NodeMouseHandler,
  BackgroundVariant,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import type { EdgeType, NodeType, VisualEdgeDto } from '@the-crew/shared-types'
import { CONNECTION_RULES } from '@the-crew/shared-types'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'
import {
  validateConnection,
  getValidTargetTypes,
  isSelfLoop,
  isAmbiguousConnection,
} from '@/lib/connection-validator'
import { requiresMetadata, NON_CREATABLE_EDGE_TYPES } from '@/lib/relationship-mutations'
import { visualNodeTypes } from './nodes'
import { CanvasToolbar } from './canvas-toolbar'
import { EdgeTypePicker } from './edge-type-picker'
import { MetadataInput } from './metadata-input'
import { EdgeDeleteConfirm } from './edge-delete-confirm'
import { TransitionWrapper } from './transition-wrapper'

export interface CanvasViewportProps {
  nodes?: Node[]
  edges?: Edge[]
  isLoading?: boolean
  error?: string | null
  onNodeDoubleClick?: NodeMouseHandler
  onEdgeCreate?: (edgeType: EdgeType, sourceNodeId: string, targetNodeId: string, metadata?: Record<string, unknown>) => void
  onEdgeDelete?: (edgeType: EdgeType, sourceNodeId: string, targetNodeId: string) => void
  onAddEntity?: (nodeType: NodeType) => void
}

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}

export function CanvasViewport({
  nodes: externalNodes = [],
  edges: externalEdges = [],
  isLoading = false,
  error = null,
  onNodeDoubleClick,
  onEdgeCreate,
  onEdgeDelete,
  onAddEntity,
}: CanvasViewportProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rfInstance = useRef<ReactFlowInstance<any, any> | null>(null)
  const { selectedNodeIds, selectedEdgeIds, focusNodeId, clearFocus, selectNodes, selectEdges, clearSelection, pendingConnection, edgeTypePicker, metadataInput, deleteConfirm, transitionDirection, clearTransition } =
    useVisualWorkspaceStore()

  // Apply selection + connection feedback to nodes
  const nodesWithState = externalNodes.map((n) => {
    const selected = selectedNodeIds.includes(n.id)
    let connectionDimmed = false
    let connectionHighlight = false

    if (pendingConnection) {
      const nodeType = (n.data as Record<string, unknown>)?.nodeType as string | undefined
      const isSource = n.id === pendingConnection.sourceNodeId
      const isValidTarget = nodeType
        ? pendingConnection.validTargetTypes.includes(nodeType as never)
        : false

      if (!isSource && !isValidTarget) {
        connectionDimmed = true
      } else if (!isSource && isValidTarget) {
        connectionHighlight = true
      }
    }

    return {
      ...n,
      selected,
      data: {
        ...n.data,
        connectionDimmed,
        connectionHighlight,
      },
    }
  })

  const edgesWithSelection = externalEdges.map((e) => ({
    ...e,
    selected: selectedEdgeIds.includes(e.id),
  }))

  // Focus on node when focusNodeId changes
  useEffect(() => {
    if (!focusNodeId) return
    if (rfInstance.current) {
      const node = rfInstance.current.getNode(focusNodeId)
      if (node) {
        rfInstance.current.fitView({
          nodes: [node],
          duration: 300,
          padding: 0.5,
        })
      }
    }
    clearFocus()
  }, [focusNodeId, clearFocus])

  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes, edges: selectedEdges }: OnSelectionChangeParams) => {
      const state = useVisualWorkspaceStore.getState()
      const newNodeIds = selectedNodes.map((n) => n.id)
      const newEdgeIds = selectedEdges.map((e) => e.id)

      if (arraysEqual(newNodeIds, state.selectedNodeIds) && arraysEqual(newEdgeIds, state.selectedEdgeIds)) {
        return
      }

      if (selectedNodes.length > 0) {
        selectNodes(newNodeIds)
      } else if (selectedEdges.length > 0) {
        selectEdges(newEdgeIds)
      } else {
        clearSelection()
      }
    },
    [selectNodes, selectEdges, clearSelection],
  )

  // Keyboard handler for F (fit view) and Delete/Backspace (edge deletion)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't trigger when typing in inputs
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      // F key: fit view (no modifiers)
      if ((e.key === 'f' || e.key === 'F') && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
        e.preventDefault()
        rfInstance.current?.fitView({ duration: 300 })
        return
      }

      if (e.key !== 'Delete' && e.key !== 'Backspace') return

      const state = useVisualWorkspaceStore.getState()
      if (state.selectedEdgeIds.length !== 1) return
      if (state.deleteConfirm) return // already showing confirm

      const edgeId = state.selectedEdgeIds[0]!
      const graphEdge = state.graphEdges.find((ge: VisualEdgeDto) => ge.id === edgeId)
      if (!graphEdge) return
      if (NON_CREATABLE_EDGE_TYPES.has(graphEdge.edgeType)) return

      e.preventDefault()
      state.showDeleteConfirm(graphEdge.edgeType, graphEdge.sourceId, graphEdge.targetId)
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  // Keyboard handler for [ and ] collapse/expand
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== '[' && e.key !== ']') return
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      const state = useVisualWorkspaceStore.getState()

      if (e.key === '[') {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault()
          state.collapseAll()
        } else if (state.selectedNodeIds.length === 1) {
          const nodeId = state.selectedNodeIds[0]!
          if (!state.collapsedNodeIds.includes(nodeId)) {
            e.preventDefault()
            state.toggleCollapse(nodeId)
          }
        }
      } else if (e.key === ']') {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault()
          state.expandAll()
        } else if (state.selectedNodeIds.length === 1) {
          const nodeId = state.selectedNodeIds[0]!
          if (state.collapsedNodeIds.includes(nodeId)) {
            e.preventDefault()
            state.toggleCollapse(nodeId)
          }
        }
      }
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  // Connection start: compute valid targets and set pending state
  const handleConnectStart = useCallback(
    (_event: MouseEvent | TouchEvent, params: { nodeId: string | null }) => {
      if (!params.nodeId) return
      const { graphNodes, startConnection } = useVisualWorkspaceStore.getState()
      const sourceNode = graphNodes.find((n) => n.id === params.nodeId)
      if (!sourceNode) return

      const validTargets = getValidTargetTypes(sourceNode.nodeType, CONNECTION_RULES)
      startConnection(params.nodeId, sourceNode.nodeType, validTargets)
    },
    [],
  )

  // Validate connection during drag
  const checkValidConnection = useCallback(
    (connection: Connection | Edge) => {
      const source = 'source' in connection ? connection.source : null
      const target = 'target' in connection ? connection.target : null
      if (!source || !target) return false

      const { graphNodes } = useVisualWorkspaceStore.getState()
      const sourceNode = graphNodes.find((n) => n.id === source)
      const targetNode = graphNodes.find((n) => n.id === target)
      if (!sourceNode || !targetNode) return false

      if (isSelfLoop(sourceNode.entityId, targetNode.entityId)) return false

      const validation = validateConnection(sourceNode.nodeType, targetNode.nodeType, CONNECTION_RULES)
      return validation.valid
    },
    [],
  )

  // Connection complete: validate, disambiguate, collect metadata, create
  const handleConnect = useCallback(
    (connection: Connection) => {
      const { source, target } = connection
      if (!source || !target) return

      const { graphNodes, showEdgeTypePicker, showMetadataInput, cancelConnection } =
        useVisualWorkspaceStore.getState()
      const sourceNode = graphNodes.find((n) => n.id === source)
      const targetNode = graphNodes.find((n) => n.id === target)
      if (!sourceNode || !targetNode) {
        cancelConnection()
        return
      }

      if (isSelfLoop(sourceNode.entityId, targetNode.entityId)) {
        cancelConnection()
        return
      }

      const validation = validateConnection(sourceNode.nodeType, targetNode.nodeType, CONNECTION_RULES)
      if (!validation.valid) {
        cancelConnection()
        return
      }

      if (isAmbiguousConnection(validation)) {
        showEdgeTypePicker(validation.possibleEdgeTypes, source, target)
        return
      }

      const edgeType = validation.possibleEdgeTypes[0]!

      if (requiresMetadata(edgeType)) {
        showMetadataInput(edgeType, source, target)
        return
      }

      onEdgeCreate?.(edgeType, source, target)
      cancelConnection()
    },
    [onEdgeCreate],
  )

  // Connection end: cleanup if no picker/input is pending
  const handleConnectEnd = useCallback(() => {
    const state = useVisualWorkspaceStore.getState()
    if (!state.edgeTypePicker && !state.metadataInput) {
      state.cancelConnection()
    }
  }, [])

  // Edge type picker selection
  const handleEdgeTypeSelect = useCallback(
    (edgeType: EdgeType) => {
      const { edgeTypePicker: picker, dismissEdgeTypePicker, showMetadataInput: showMeta, cancelConnection } =
        useVisualWorkspaceStore.getState()
      if (!picker) return

      dismissEdgeTypePicker()

      if (requiresMetadata(edgeType)) {
        showMeta(edgeType, picker.sourceNodeId, picker.targetNodeId)
        return
      }

      onEdgeCreate?.(edgeType, picker.sourceNodeId, picker.targetNodeId)
      cancelConnection()
    },
    [onEdgeCreate],
  )

  // Edge type picker cancel
  const handlePickerCancel = useCallback(() => {
    useVisualWorkspaceStore.getState().cancelConnection()
  }, [])

  // Metadata input submit
  const handleMetadataSubmit = useCallback(
    (metadata: Record<string, unknown>) => {
      const { metadataInput: meta, cancelConnection } = useVisualWorkspaceStore.getState()
      if (!meta) return

      onEdgeCreate?.(meta.edgeType, meta.sourceNodeId, meta.targetNodeId, metadata)
      cancelConnection()
    },
    [onEdgeCreate],
  )

  // Metadata input cancel
  const handleMetadataCancel = useCallback(() => {
    useVisualWorkspaceStore.getState().cancelConnection()
  }, [])

  // Delete confirm
  const handleDeleteConfirm = useCallback(() => {
    const state = useVisualWorkspaceStore.getState()
    if (!state.deleteConfirm) return
    const { edgeType, sourceNodeId, targetNodeId } = state.deleteConfirm
    state.dismissDeleteConfirm()
    onEdgeDelete?.(edgeType, sourceNodeId, targetNodeId)
  }, [onEdgeDelete])

  const handleDeleteCancel = useCallback(() => {
    useVisualWorkspaceStore.getState().dismissDeleteConfirm()
  }, [])

  const handleZoomIn = useCallback(() => rfInstance.current?.zoomIn(), [])
  const handleZoomOut = useCallback(() => rfInstance.current?.zoomOut(), [])
  const handleFitView = useCallback(() => rfInstance.current?.fitView(), [])
  const handleAutoLayout = useCallback(() => {
    rfInstance.current?.fitView({ duration: 300 })
  }, [])

  if (isLoading) {
    return (
      <div data-testid="canvas-viewport" className="flex flex-1 flex-col overflow-hidden">
        <CanvasToolbar onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} onFitView={handleFitView} onAutoLayout={handleAutoLayout} onAddEntity={onAddEntity} />
        <div data-testid="canvas-loading" className="flex flex-1 items-center justify-center text-slate-400">
          Loading graph...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div data-testid="canvas-viewport" className="flex flex-1 flex-col overflow-hidden">
        <CanvasToolbar onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} onFitView={handleFitView} onAutoLayout={handleAutoLayout} onAddEntity={onAddEntity} />
        <div data-testid="canvas-error" className="flex flex-1 items-center justify-center text-red-500">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div data-testid="canvas-viewport" className="relative flex flex-1 flex-col overflow-hidden">
      <CanvasToolbar
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitView={handleFitView}
        onAutoLayout={handleAutoLayout}
        onAddEntity={onAddEntity}
      />
      <TransitionWrapper direction={transitionDirection} onTransitionEnd={clearTransition}>
        <div className="h-full w-full">
          <ReactFlow
            nodes={nodesWithState}
            edges={edgesWithSelection}
            nodeTypes={visualNodeTypes}
            onInit={(instance) => {
              rfInstance.current = instance
            }}
            onSelectionChange={onSelectionChange}
            onNodeDoubleClick={onNodeDoubleClick}
            onConnectStart={handleConnectStart}
            onConnect={handleConnect}
            onConnectEnd={handleConnectEnd}
            isValidConnection={checkValidConnection}
            deleteKeyCode={null}
            connectionLineStyle={{ stroke: '#3b82f6', strokeWidth: 2 }}
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
      {edgeTypePicker && (
        <EdgeTypePicker
          options={edgeTypePicker.options}
          onSelect={handleEdgeTypeSelect}
          onCancel={handlePickerCancel}
        />
      )}
      {metadataInput && (
        <MetadataInput
          edgeType={metadataInput.edgeType}
          onSubmit={handleMetadataSubmit}
          onCancel={handleMetadataCancel}
        />
      )}
      {deleteConfirm && (
        <EdgeDeleteConfirm
          edgeType={deleteConfirm.edgeType}
          sourceNodeId={deleteConfirm.sourceNodeId}
          targetNodeId={deleteConfirm.targetNodeId}
          allNodes={useVisualWorkspaceStore.getState().graphNodes}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}
    </div>
  )
}
