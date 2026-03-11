import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
import { useVisualWorkspaceStore, type CanvasMode } from '@/stores/visual-workspace-store'
import {
  validateConnection,
  getValidTargetTypes,
  isSelfLoop,
  isAmbiguousConnection,
} from '@/lib/connection-validator'
import { requiresMetadata, NON_CREATABLE_EDGE_TYPES } from '@/lib/relationship-mutations'
import { getNodePaletteItems } from '@/lib/palette-data'
import { usePermission } from '@/hooks/use-permissions'
import { visualNodeTypes } from './nodes'
import { CanvasToolbar } from './canvas-toolbar'
import { EdgeTypePicker } from './edge-type-picker'
import { MetadataInput } from './metadata-input'
import { EdgeDeleteConfirm } from './edge-delete-confirm'
import { TransitionWrapper } from './transition-wrapper'
import { KeyboardShortcutsHelp } from './keyboard-shortcuts-help'
import { CanvasContextMenu } from './context-menu'

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

// Mode-driven cursor classes for the ReactFlow pane
const CURSOR_CLASSES: Record<CanvasMode, string> = {
  select: '',
  pan: '[&_.react-flow__pane]:cursor-grab',
  connect: '[&_.react-flow__pane]:cursor-crosshair',
  'add-node': '[&_.react-flow__pane]:cursor-cell',
  'add-edge': '[&_.react-flow__pane]:cursor-crosshair',
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
  onNodeDelete,
  onDrillIn,
  onNodeDragStop,
  onAutoLayout,
  isPending = false,
}: CanvasViewportProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rfInstance = useRef<ReactFlowInstance<any, any> | null>(null)
  const {
    selectedNodeIds, selectedEdgeIds, focusNodeId, clearFocus,
    selectNodes, selectEdges, clearSelection,
    pendingConnection, edgeTypePicker, metadataInput, deleteConfirm,
    transitionDirection, clearTransition,
    canvasMode, addEdgeSource, setAddEdgeSource, isDiffMode, zoomLevel,
    preselectedEdgeType,
    showContextMenu, dismissContextMenu,
  } = useVisualWorkspaceStore()

  // Permission checks (CAV-020)
  const canMoveNodes = usePermission('canvas:node:move')
  const canCreateEdges = usePermission('canvas:edge:create')
  const canDeleteEdges = usePermission('canvas:edge:delete')
  const canCreateNodes = usePermission('canvas:node:create')
  const canDeleteNodes = usePermission('canvas:node:delete')

  // Add-node floating menu state
  const [addNodeMenu, setAddNodeMenu] = useState<{ x: number; y: number } | null>(null)
  const addNodeMenuRef = useRef<HTMLDivElement>(null)

  // Effective mode: diff mode locks to select
  const effectiveMode = isDiffMode ? 'select' : canvasMode

  // Mode-driven ReactFlow props (gated by permissions)
  const nodesDraggable = canMoveNodes && (effectiveMode === 'select' || effectiveMode === 'add-node')
  const nodesConnectable = canCreateEdges && (effectiveMode === 'select' || effectiveMode === 'connect')
  const panOnDrag = effectiveMode !== 'add-edge'

  // Compute effective pending connection for dimming/highlighting (memoized)
  const effectivePendingConnection = useMemo(() => {
    if (pendingConnection) return pendingConnection
    if (effectiveMode !== 'add-edge' || !addEdgeSource) return null
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
  }, [pendingConnection, effectiveMode, addEdgeSource, preselectedEdgeType])

  // Apply selection + connection/mode feedback to nodes (memoized)
  const nodesWithState = useMemo(() => externalNodes.map((n) => {
    const isAddEdgeSourceNode = effectiveMode === 'add-edge' && addEdgeSource === n.id
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

    return {
      ...n,
      selected,
      data: {
        ...n.data,
        connectionDimmed,
        connectionHighlight,
      },
    }
  }), [externalNodes, selectedNodeIds, effectivePendingConnection, effectiveMode, addEdgeSource])

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

  // Close add-node menu on click outside
  useEffect(() => {
    if (!addNodeMenu) return
    const handler = (e: MouseEvent) => {
      if (addNodeMenuRef.current && !addNodeMenuRef.current.contains(e.target as globalThis.Node)) {
        setAddNodeMenu(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [addNodeMenu])

  // Close add-node menu on Escape
  useEffect(() => {
    if (!addNodeMenu) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setAddNodeMenu(null)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [addNodeMenu])

  // Close add-node menu on mode change
  useEffect(() => {
    setAddNodeMenu(null)
  }, [canvasMode])

  // Context menu handlers (CAV-008)
  const handleNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault()
      const state = useVisualWorkspaceStore.getState()
      const menuType = state.selectedNodeIds.length > 1 && state.selectedNodeIds.includes(node.id)
        ? 'multi-select' as const
        : 'node' as const
      showContextMenu(event.clientX, event.clientY, menuType, node.id)
    },
    [showContextMenu],
  )

  const handleEdgeContextMenu = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.preventDefault()
      showContextMenu(event.clientX, event.clientY, 'edge', edge.id)
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

  // Pane click handler for add-node mode
  const handlePaneClick = useCallback(
    (event: React.MouseEvent) => {
      // Dismiss context menu on left click
      if (useVisualWorkspaceStore.getState().contextMenu) {
        dismissContextMenu()
        return
      }
      if (effectiveMode === 'add-node' && onAddEntity && canCreateNodes) {
        const items = getNodePaletteItems(useVisualWorkspaceStore.getState().zoomLevel)
        if (items.length > 0) {
          setAddNodeMenu({ x: event.clientX, y: event.clientY })
        }
        return
      }
      // Cancel add-edge source on pane click
      if (effectiveMode === 'add-edge' && addEdgeSource) {
        setAddEdgeSource(null)
      }
    },
    [effectiveMode, onAddEntity, canCreateNodes, addEdgeSource, setAddEdgeSource, dismissContextMenu],
  )

  // Node click handler for add-edge mode
  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (effectiveMode !== 'add-edge') return
      if (!canCreateEdges) return

      if (!addEdgeSource) {
        setAddEdgeSource(node.id)
        return
      }

      // Same node → cancel
      if (addEdgeSource === node.id) {
        setAddEdgeSource(null)
        return
      }

      // Validate and create edge
      const { graphNodes, showEdgeTypePicker, showMetadataInput, preselectedEdgeType: preselected } = useVisualWorkspaceStore.getState()
      const sourceNode = graphNodes.find((n) => n.id === addEdgeSource)
      const targetNode = graphNodes.find((n) => n.id === node.id)
      if (!sourceNode || !targetNode) {
        setAddEdgeSource(null)
        return
      }

      if (isSelfLoop(sourceNode.entityId, targetNode.entityId)) {
        setAddEdgeSource(null)
        return
      }

      // When a preselected edge type is set from the relationship palette,
      // check if it's valid for this source→target pair and use it directly
      if (preselected) {
        const rule = CONNECTION_RULES.find(
          (r) =>
            r.edgeType === preselected &&
            r.sourceTypes.includes(sourceNode.nodeType) &&
            r.targetTypes.includes(targetNode.nodeType),
        )
        if (!rule) {
          setAddEdgeSource(null)
          return
        }
        if (requiresMetadata(preselected)) {
          showMetadataInput(preselected, addEdgeSource, node.id)
          setAddEdgeSource(null)
          return
        }
        onEdgeCreate?.(preselected, addEdgeSource, node.id)
        setAddEdgeSource(null)
        return
      }

      const validation = validateConnection(sourceNode.nodeType, targetNode.nodeType, CONNECTION_RULES)
      if (!validation.valid) {
        setAddEdgeSource(null)
        return
      }

      if (isAmbiguousConnection(validation)) {
        showEdgeTypePicker(validation.possibleEdgeTypes, addEdgeSource, node.id)
        setAddEdgeSource(null)
        return
      }

      const edgeType = validation.possibleEdgeTypes[0]!

      if (requiresMetadata(edgeType)) {
        showMetadataInput(edgeType, addEdgeSource, node.id)
        setAddEdgeSource(null)
        return
      }

      onEdgeCreate?.(edgeType, addEdgeSource, node.id)
      setAddEdgeSource(null)
    },
    [effectiveMode, canCreateEdges, addEdgeSource, setAddEdgeSource, onEdgeCreate],
  )

  // Connection start: compute valid targets and set pending state
  const handleConnectStart = useCallback(
    (_event: MouseEvent | TouchEvent, params: { nodeId: string | null }) => {
      if (effectiveMode !== 'select' && effectiveMode !== 'connect') return
      if (!canCreateEdges) return
      if (!params.nodeId) return
      const { graphNodes, startConnection } = useVisualWorkspaceStore.getState()
      const sourceNode = graphNodes.find((n) => n.id === params.nodeId)
      if (!sourceNode) return

      const validTargets = getValidTargetTypes(sourceNode.nodeType, CONNECTION_RULES)
      startConnection(params.nodeId, sourceNode.nodeType, validTargets)
    },
    [effectiveMode, canCreateEdges],
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
    if (onAutoLayout) {
      onAutoLayout()
      // Defer fitView to allow React to re-render with fresh layout positions
      setTimeout(() => rfInstance.current?.fitView({ duration: 300 }), 50)
    } else {
      rfInstance.current?.fitView({ duration: 300 })
    }
  }, [onAutoLayout])

  // Handle node drag stop — persist positions
  const handleNodeDragStop = useCallback(
    (_event: React.MouseEvent, _node: Node, draggedNodes: Node[]) => {
      if (!onNodeDragStop) return
      for (const n of draggedNodes) {
        onNodeDragStop(n.id, n.position)
      }
    },
    [onNodeDragStop],
  )

  // Suppress double-click navigation in add-edge mode
  const effectiveOnNodeDoubleClick = effectiveMode === 'add-edge' ? undefined : onNodeDoubleClick

  const cursorClass = CURSOR_CLASSES[effectiveMode]

  // Palette items for the floating menu
  const paletteItems = getNodePaletteItems(zoomLevel)

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
      <TransitionWrapper direction={transitionDirection} onTransitionEnd={clearTransition}>
        <div className={`h-full w-full ${cursorClass}`} data-testid="canvas-flow-wrapper">
          <ReactFlow
            nodes={nodesWithState}
            edges={edgesWithSelection}
            nodeTypes={visualNodeTypes}
            onInit={(instance) => {
              rfInstance.current = instance
            }}
            onSelectionChange={onSelectionChange}
            onNodeDoubleClick={effectiveOnNodeDoubleClick}
            onNodeClick={handleNodeClick}
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
      <KeyboardShortcutsHelp />
      <CanvasContextMenu
        onAddEntity={canCreateNodes ? onAddEntity : undefined}
        onDrillIn={onDrillIn}
        onNodeDelete={canDeleteNodes ? onNodeDelete : undefined}
        onFitView={handleFitView}
        onAutoLayout={handleAutoLayout}
      />
      {addNodeMenu && effectiveMode === 'add-node' && onAddEntity && canCreateNodes && paletteItems.length > 0 && (
        <div
          ref={addNodeMenuRef}
          data-testid="add-node-menu"
          className="fixed z-50 min-w-56 rounded-lg border border-border bg-popover p-1 shadow-lg"
          style={{ left: addNodeMenu.x, top: addNodeMenu.y }}
        >
          {paletteItems.map((item) => (
            <button
              key={item.nodeType}
              type="button"
              data-testid={`add-node-option-${item.nodeType}`}
              onClick={() => {
                onAddEntity(item.nodeType)
                setAddNodeMenu(null)
              }}
              className="flex w-full items-start gap-2 rounded px-3 py-1.5 text-left hover:bg-accent"
            >
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-popover-foreground">{item.label}</div>
                <div className="text-xs text-muted-foreground">{item.description}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
