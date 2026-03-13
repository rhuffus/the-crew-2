import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  applyNodeChanges,
  type ReactFlowInstance,
  type Node,
  type Edge,
  type NodeChange,
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
import { usePermission } from '@/hooks/use-permissions'
import { visualNodeTypes } from './nodes'
import { CanvasToolbar } from './canvas-toolbar'
import { EdgeTypePicker } from './edge-type-picker'
import { MetadataInput } from './metadata-input'
import { EdgeDeleteConfirm } from './edge-delete-confirm'
import { TransitionWrapper } from './transition-wrapper'
import { KeyboardShortcutsHelp } from './keyboard-shortcuts-help'
import { CanvasContextMenu } from './context-menu'

// Stable object references — avoid recreating on every render
const EMPTY_NODES: Node[] = []
const EMPTY_EDGES: Edge[] = []
const CONNECTION_LINE_STYLE = { stroke: '#3b82f6', strokeWidth: 2 }
const PRO_OPTIONS = { hideAttribution: true }
const FIT_VIEW_OPTIONS = { maxZoom: 1, padding: 0.2 }

export interface CanvasViewportProps {
  nodes?: Node[]
  edges?: Edge[]
  isLoading?: boolean
  error?: string | null
  onNodeDoubleClick?: NodeMouseHandler
  onEdgeCreate?: (edgeType: EdgeType, sourceNodeId: string, targetNodeId: string, metadata?: Record<string, unknown>) => void
  onEdgeDelete?: (edgeType: EdgeType, sourceNodeId: string, targetNodeId: string) => void
  onAddEntity?: (nodeType: NodeType) => void
  onNodeDelete?: (nodeType: string, entityId: string) => void
  onDrillIn?: (nodeId: string) => void
  onNodeDragStop?: (nodeId: string, position: { x: number; y: number }) => void
  onAutoLayout?: () => void
  isPending?: boolean
}

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}

export function CanvasViewport({
  nodes: externalNodes = EMPTY_NODES,
  edges: externalEdges = EMPTY_EDGES,
  isLoading = false,
  error = null,
  onNodeDoubleClick,
  onEdgeCreate,
  onEdgeDelete,
  onAddEntity,
  onNodeDelete,
  onDrillIn,
  onNodeDragStop,
  onAutoLayout,
  isPending = false,
}: CanvasViewportProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rfInstance = useRef<ReactFlowInstance<any, any> | null>(null)
  // ── Reactive state — individual selectors prevent cross-slice re-renders ──
  const selectedNodeIds = useVisualWorkspaceStore((s) => s.selectedNodeIds)
  const selectedEdgeIds = useVisualWorkspaceStore((s) => s.selectedEdgeIds)
  const focusNodeId = useVisualWorkspaceStore((s) => s.focusNodeId)
  const pendingConnection = useVisualWorkspaceStore((s) => s.pendingConnection)
  const addEdgeSource = useVisualWorkspaceStore((s) => s.addEdgeSource)
  const preselectedEdgeType = useVisualWorkspaceStore((s) => s.preselectedEdgeType)
  const transitionDirection = useVisualWorkspaceStore((s) => s.transitionDirection)
  const edgeTypePicker = useVisualWorkspaceStore((s) => s.edgeTypePicker)
  const metadataInput = useVisualWorkspaceStore((s) => s.metadataInput)
  const deleteConfirm = useVisualWorkspaceStore((s) => s.deleteConfirm)
  // Actions accessed via getState() inside callbacks — no subscription overhead

  // Permission checks (CAV-020)
  const canMoveNodes = usePermission('canvas:node:move')
  const canCreateEdges = usePermission('canvas:edge:create')
  const canDeleteEdges = usePermission('canvas:edge:delete')
  const canCreateNodes = usePermission('canvas:node:create')
  const canDeleteNodes = usePermission('canvas:node:delete')

  // Unified interaction: always allow (gated only by permissions)
  const nodesDraggable = canMoveNodes
  const nodesConnectable = canCreateEdges
  const panOnDrag = true

  // Compute effective pending connection for dimming/highlighting (memoized)
  const effectivePendingConnection = useMemo(() => {
    if (pendingConnection) return pendingConnection
    if (!addEdgeSource) return null
    const graphNodes = useVisualWorkspaceStore.getState().graphNodes
    const sourceNode = graphNodes.find((n) => n.id === addEdgeSource)
    if (!sourceNode) return null

    let validTargets: NodeType[]
    if (preselectedEdgeType) {
      const rule = CONNECTION_RULES.find(
        (r) => r.edgeType === preselectedEdgeType && r.sourceTypes.includes(sourceNode.nodeType),
      )
      validTargets = rule ? [...rule.targetTypes] : []
    } else {
      validTargets = getValidTargetTypes(sourceNode.nodeType, CONNECTION_RULES)
    }

    return {
      sourceNodeId: addEdgeSource,
      sourceNodeType: sourceNode.nodeType,
      validTargetTypes: validTargets,
    }
  }, [pendingConnection, addEdgeSource, preselectedEdgeType])

  // ── Local node state for ReactFlow controlled mode ──
  // ReactFlow REQUIRES onNodesChange to visually move nodes during drag.
  // localNodes = externalNodes + drag position overrides.
  const [localNodes, setLocalNodes] = useState<Node[]>(externalNodes)

  // Sync from external data at render time (no useEffect — avoids extra mount render
  // that triggers ReactFlow's updateNodeInternals loop).
  const prevExternalRef = useRef(externalNodes)
  if (prevExternalRef.current !== externalNodes) {
    prevExternalRef.current = externalNodes
    setLocalNodes(externalNodes)
  }

  // Handle ReactFlow node changes — ONLY apply active-drag position changes.
  // ReactFlow's updateNodeInternals fires dimension/position changes internally;
  // filtering to `dragging === true` prevents the infinite re-render loop.
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    const dragChanges = changes.filter(
      (c): c is NodeChange & { type: 'position'; dragging: true } =>
        c.type === 'position' && 'dragging' in c && (c as { dragging?: boolean }).dragging === true,
    )
    if (dragChanges.length > 0) {
      setLocalNodes((nds) => applyNodeChanges(dragChanges, nds))
    }
  }, [])

  // Apply selection + connection feedback to nodes (memoized).
  const renderNodes = useMemo(() => localNodes.map((n) => {
    const isAddEdgeSourceNode = addEdgeSource === n.id
    const selected = selectedNodeIds.includes(n.id) || isAddEdgeSourceNode
    let connectionDimmed = false
    let connectionHighlight = false

    if (effectivePendingConnection) {
      const nodeType = (n.data as Record<string, unknown>)?.nodeType as string | undefined
      const isSource = n.id === effectivePendingConnection.sourceNodeId
      const isValidTarget = nodeType
        ? effectivePendingConnection.validTargetTypes.includes(nodeType as never)
        : false

      if (!isSource && !isValidTarget) {
        connectionDimmed = true
      } else if (!isSource && isValidTarget) {
        connectionHighlight = true
      }
    }

    // Only create new data object if overlay values actually changed — preserves
    // reference identity so React.memo on VisualNode can skip re-renders.
    const prevData = n.data as Record<string, unknown>
    const data = (prevData.connectionDimmed !== connectionDimmed || prevData.connectionHighlight !== connectionHighlight)
      ? { ...n.data, connectionDimmed, connectionHighlight }
      : n.data

    return {
      ...n,
      selected,
      data,
    }
  }), [localNodes, selectedNodeIds, effectivePendingConnection, addEdgeSource])

  const edgesWithSelection = useMemo(() => externalEdges.map((e) => ({
    ...e,
    selected: selectedEdgeIds.includes(e.id),
  })), [externalEdges, selectedEdgeIds])

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
    useVisualWorkspaceStore.getState().clearFocus()
  }, [focusNodeId])

  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes, edges: selectedEdges }: OnSelectionChangeParams) => {
      const state = useVisualWorkspaceStore.getState()
      const newNodeIds = selectedNodes.map((n) => n.id)
      const newEdgeIds = selectedEdges.map((e) => e.id)

      if (arraysEqual(newNodeIds, state.selectedNodeIds) && arraysEqual(newEdgeIds, state.selectedEdgeIds)) {
        return
      }

      if (selectedNodes.length > 0) {
        state.selectNodes(newNodeIds)
      } else if (selectedEdges.length > 0) {
        state.selectEdges(newEdgeIds)
      } else {
        state.clearSelection()
      }
    },
    [],
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
        rfInstance.current?.fitView({ duration: 300, ...FIT_VIEW_OPTIONS })
        return
      }

      if (e.key !== 'Delete' && e.key !== 'Backspace') return
      if (!canDeleteEdges) return

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
  }, [canDeleteEdges])

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

  // Context menu handlers (CAV-008)
  const handleNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault()
      const state = useVisualWorkspaceStore.getState()
      const menuType = state.selectedNodeIds.length > 1 && state.selectedNodeIds.includes(node.id)
        ? 'multi-select' as const
        : 'node' as const
      state.showContextMenu(event.clientX, event.clientY, menuType, node.id)
    },
    [],
  )

  const handleEdgeContextMenu = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.preventDefault()
      useVisualWorkspaceStore.getState().showContextMenu(event.clientX, event.clientY, 'edge', edge.id)
    },
    [],
  )

  const handlePaneContextMenu = useCallback(
    (event: MouseEvent | React.MouseEvent) => {
      event.preventDefault()
      useVisualWorkspaceStore.getState().showContextMenu(event.clientX, event.clientY, 'pane')
    },
    [],
  )

  // Pane click handler
  const handlePaneClick = useCallback(
    (_event: React.MouseEvent) => {
      const state = useVisualWorkspaceStore.getState()
      if (state.contextMenu) {
        state.dismissContextMenu()
        return
      }
      if (state.addEdgeSource) {
        state.setAddEdgeSource(null)
      }
    },
    [],
  )

  // Node click handler: select node in normal mode, or handle edge creation
  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      const state = useVisualWorkspaceStore.getState()

      // Normal mode: explicitly select this node for inspector
      if (!state.addEdgeSource && !state.preselectedEdgeType) {
        state.selectNodes([node.id])
        return
      }
      if (!canCreateEdges) return

      if (!state.addEdgeSource) {
        // preselectedEdgeType is set but no source yet — set this as source
        state.setAddEdgeSource(node.id)
        return
      }

      // Same node → cancel
      if (state.addEdgeSource === node.id) {
        state.setAddEdgeSource(null)
        return
      }

      // Validate and create edge
      const sourceNode = state.graphNodes.find((n) => n.id === state.addEdgeSource)
      const targetNode = state.graphNodes.find((n) => n.id === node.id)
      if (!sourceNode || !targetNode) {
        state.setAddEdgeSource(null)
        return
      }

      if (isSelfLoop(sourceNode.entityId, targetNode.entityId)) {
        state.setAddEdgeSource(null)
        return
      }

      // When a preselected edge type is set from the relationship palette,
      // check if it's valid for this source→target pair and use it directly
      if (state.preselectedEdgeType) {
        const rule = CONNECTION_RULES.find(
          (r) =>
            r.edgeType === state.preselectedEdgeType &&
            r.sourceTypes.includes(sourceNode.nodeType) &&
            r.targetTypes.includes(targetNode.nodeType),
        )
        if (!rule) {
          state.setAddEdgeSource(null)
          return
        }
        if (requiresMetadata(state.preselectedEdgeType)) {
          state.showMetadataInput(state.preselectedEdgeType, state.addEdgeSource, node.id)
          state.setAddEdgeSource(null)
          return
        }
        onEdgeCreate?.(state.preselectedEdgeType, state.addEdgeSource, node.id)
        state.setAddEdgeSource(null)
        state.setPreselectedEdgeType(null)
        return
      }

      const validation = validateConnection(sourceNode.nodeType, targetNode.nodeType, CONNECTION_RULES)
      if (!validation.valid) {
        state.setAddEdgeSource(null)
        return
      }

      if (isAmbiguousConnection(validation)) {
        state.showEdgeTypePicker(validation.possibleEdgeTypes, state.addEdgeSource, node.id)
        state.setAddEdgeSource(null)
        return
      }

      const edgeType = validation.possibleEdgeTypes[0]!

      if (requiresMetadata(edgeType)) {
        state.showMetadataInput(edgeType, state.addEdgeSource, node.id)
        state.setAddEdgeSource(null)
        return
      }

      onEdgeCreate?.(edgeType, state.addEdgeSource, node.id)
      state.setAddEdgeSource(null)
    },
    [canCreateEdges, onEdgeCreate],
  )

  // Edge click handler: explicitly select edge for inspector
  const handleEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      useVisualWorkspaceStore.getState().selectEdges([edge.id])
    },
    [],
  )

  // Connection start: compute valid targets and set pending state
  const handleConnectStart = useCallback(
    (_event: MouseEvent | TouchEvent, params: { nodeId: string | null }) => {
      if (!canCreateEdges) return
      if (!params.nodeId) return
      const { graphNodes, startConnection } = useVisualWorkspaceStore.getState()
      const sourceNode = graphNodes.find((n) => n.id === params.nodeId)
      if (!sourceNode) return

      const validTargets = getValidTargetTypes(sourceNode.nodeType, CONNECTION_RULES)
      startConnection(params.nodeId, sourceNode.nodeType, validTargets)
    },
    [canCreateEdges],
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

      const { graphNodes, showEdgeTypePicker, showMetadataInput, cancelConnection, preselectedEdgeType: preselected } =
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

      // If a preselected edge type is active, use it directly
      if (preselected) {
        const rule = CONNECTION_RULES.find(
          (r) =>
            r.edgeType === preselected &&
            r.sourceTypes.includes(sourceNode.nodeType) &&
            r.targetTypes.includes(targetNode.nodeType),
        )
        if (!rule) {
          cancelConnection()
          return
        }
        if (requiresMetadata(preselected)) {
          showMetadataInput(preselected, source, target)
          return
        }
        onEdgeCreate?.(preselected, source, target)
        cancelConnection()
        useVisualWorkspaceStore.getState().setPreselectedEdgeType(null)
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleInit = useCallback((instance: any) => {
    rfInstance.current = instance as ReactFlowInstance
  }, [])

  const handleTransitionEnd = useCallback(() => {
    useVisualWorkspaceStore.getState().clearTransition()
  }, [])

  const handleZoomIn = useCallback(() => rfInstance.current?.zoomIn(), [])
  const handleZoomOut = useCallback(() => rfInstance.current?.zoomOut(), [])
  const handleFitView = useCallback(() => rfInstance.current?.fitView(FIT_VIEW_OPTIONS), [])
  const handleAutoLayout = useCallback(() => {
    if (onAutoLayout) {
      onAutoLayout()
      // Defer fitView to allow React to re-render with fresh layout positions
      setTimeout(() => rfInstance.current?.fitView({ duration: 300, ...FIT_VIEW_OPTIONS }), 50)
    } else {
      rfInstance.current?.fitView({ duration: 300, ...FIT_VIEW_OPTIONS })
    }
  }, [onAutoLayout])

  // Handle node drag stop — persist final positions
  const handleNodeDragStop = useCallback(
    (_event: React.MouseEvent, _node: Node, draggedNodes: Node[]) => {
      if (!onNodeDragStop) return
      for (const n of draggedNodes) {
        onNodeDragStop(n.id, n.position)
      }
    },
    [onNodeDragStop],
  )

  if (isLoading) {
    return (
      <div data-testid="canvas-viewport" className="flex flex-1 flex-col overflow-hidden">
        <CanvasToolbar onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} onFitView={handleFitView} onAutoLayout={handleAutoLayout} onAddEntity={onAddEntity} isPending={isPending} />
        <div data-testid="canvas-loading" className="flex flex-1 items-center justify-center text-slate-400">
          Loading graph...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div data-testid="canvas-viewport" className="flex flex-1 flex-col overflow-hidden">
        <CanvasToolbar onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} onFitView={handleFitView} onAutoLayout={handleAutoLayout} onAddEntity={onAddEntity} isPending={isPending} />
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
        isPending={isPending}
      />
      <TransitionWrapper direction={transitionDirection} onTransitionEnd={handleTransitionEnd}>
        <div className="h-full w-full" data-testid="canvas-flow-wrapper">
          <ReactFlow
            nodes={renderNodes}
            edges={edgesWithSelection}
            nodeTypes={visualNodeTypes}
            onNodesChange={handleNodesChange}
            onInit={handleInit}
            onSelectionChange={onSelectionChange}
            onNodeDoubleClick={onNodeDoubleClick}
            onNodeClick={handleNodeClick}
            onEdgeClick={handleEdgeClick}
            onPaneClick={handlePaneClick}
            onNodeContextMenu={handleNodeContextMenu}
            onEdgeContextMenu={handleEdgeContextMenu}
            onPaneContextMenu={handlePaneContextMenu}
            onNodeDragStop={handleNodeDragStop}
            onConnectStart={handleConnectStart}
            onConnect={handleConnect}
            onConnectEnd={handleConnectEnd}
            isValidConnection={checkValidConnection}
            deleteKeyCode={null}
            nodesDraggable={nodesDraggable}
            nodesConnectable={nodesConnectable}
            panOnDrag={panOnDrag}
            connectionLineStyle={CONNECTION_LINE_STYLE}
            fitView
            fitViewOptions={FIT_VIEW_OPTIONS}
            minZoom={0.1}
            maxZoom={4}
            proOptions={PRO_OPTIONS}
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
      <KeyboardShortcutsHelp />
      <CanvasContextMenu
        onAddEntity={canCreateNodes ? onAddEntity : undefined}
        onDrillIn={onDrillIn}
        onNodeDelete={canDeleteNodes ? onNodeDelete : undefined}
        onFitView={handleFitView}
        onAutoLayout={handleAutoLayout}
      />
    </div>
  )
}
