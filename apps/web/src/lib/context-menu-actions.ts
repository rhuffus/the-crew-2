import type { NodeType, ScopeType, VisualNodeDto, VisualEdgeDto, EdgeType } from '@the-crew/shared-types'
import { NON_CREATABLE_EDGE_TYPES } from './relationship-mutations'
import { getAddableEntitiesByScope } from './addable-entities'

export type ContextMenuActionId =
  // Node actions
  | 'inspect'
  | 'edit'
  | 'drill-in'
  | 'create-relationship'
  | 'collapse'
  | 'expand'
  | 'delete-node'
  | 'add-comment'
  // Edge actions
  | 'inspect-edge'
  | 'delete-edge'
  | 'focus-source'
  | 'focus-target'
  // Pane actions
  | 'add-node'
  | 'fit-view'
  | 'auto-layout'
  | 'select-all'
  // Multi-select actions
  | 'delete-selected'
  | 'deselect-all'
  // Operations actions (CAV-019)
  | 'start-run'
  | 'view-runs'
  | 'report-incident'
  | 'set-compliance'
  | 'advance-stage'
  | 'block-stage'

export interface ContextMenuAction {
  id: ContextMenuActionId
  label: string
  shortcut?: string
  danger?: boolean
  disabled?: boolean
  /** For add-node submenu items */
  nodeType?: NodeType
}

export interface ContextMenuSection {
  items: ContextMenuAction[]
}

const DRILLABLE_TYPES: ReadonlySet<NodeType> = new Set(['company', 'department', 'workflow'])

const NON_DELETABLE_TYPES: ReadonlySet<NodeType> = new Set(['company', 'workflow-stage'])

export interface PermissionCheck {
  canEdit?: boolean
  canDelete?: boolean
  canCreateEdges?: boolean
  canComment?: boolean
  canOperations?: boolean
}

export interface OperationsContext {
  showOperationsOverlay?: boolean
  operationStatus?: string
}

export function getNodeContextMenuSections(
  nodeId: string,
  graphNodes: VisualNodeDto[],
  collapsedNodeIds: string[],
  isDiffMode: boolean,
  permissions?: PermissionCheck,
  operationsContext?: OperationsContext,
): ContextMenuSection[] {
  const node = graphNodes.find((n) => n.id === nodeId)
  if (!node) return []

  const canEdit = permissions?.canEdit ?? true
  const canDelete = permissions?.canDelete ?? true
  const canCreateEdges = permissions?.canCreateEdges ?? true
  const canComment = permissions?.canComment ?? true
  const canOperations = permissions?.canOperations ?? true

  const isDrillable = DRILLABLE_TYPES.has(node.nodeType)
  const isDeletable = !NON_DELETABLE_TYPES.has(node.nodeType)
  const isContainer = graphNodes.some((n) => n.parentId === nodeId)
  const isCollapsed = collapsedNodeIds.includes(nodeId)

  const sections: ContextMenuSection[] = []

  // Navigation section
  const navItems: ContextMenuAction[] = [
    { id: 'inspect', label: 'Inspect' },
  ]
  if (isDrillable) {
    navItems.push({ id: 'drill-in', label: 'Drill In', shortcut: 'Enter' })
  }
  sections.push({ items: navItems })

  // Edit section (hidden in diff mode or when no edit permission)
  if (!isDiffMode && canEdit) {
    const editItems: ContextMenuAction[] = [
      { id: 'edit', label: 'Edit' },
    ]
    if (canCreateEdges) {
      editItems.push({ id: 'create-relationship', label: 'Create Relationship', shortcut: 'E' })
    }
    if (canComment) {
      editItems.push({ id: 'add-comment', label: 'Add Comment' })
    }
    sections.push({ items: editItems })
  }

  // Operations section (CAV-019): shown when overlay is active and not in diff mode
  if (!isDiffMode && operationsContext?.showOperationsOverlay && canOperations) {
    const opsItems: ContextMenuAction[] = []
    if (node.nodeType === 'workflow') {
      opsItems.push({ id: 'start-run', label: 'Start Run' })
      opsItems.push({ id: 'view-runs', label: 'View Runs' })
    }
    opsItems.push({ id: 'report-incident', label: 'Report Incident' })
    if (node.nodeType === 'contract') {
      opsItems.push({ id: 'set-compliance', label: 'Set Compliance' })
    }
    if (node.nodeType === 'workflow-stage' && operationsContext.operationStatus === 'running') {
      opsItems.push({ id: 'advance-stage', label: 'Complete Stage' })
      opsItems.push({ id: 'block-stage', label: 'Block Stage' })
    }
    if (opsItems.length > 0) {
      sections.push({ items: opsItems })
    }
  }

  // Collapse section (if container)
  if (isContainer && !isDiffMode) {
    sections.push({
      items: [
        isCollapsed
          ? { id: 'expand', label: 'Expand Children', shortcut: ']' }
          : { id: 'collapse', label: 'Collapse Children', shortcut: '[' },
      ],
    })
  }

  // Destructive section (hidden in diff mode or when no delete permission)
  if (!isDiffMode && isDeletable && canDelete) {
    sections.push({
      items: [{ id: 'delete-node', label: 'Delete', shortcut: 'Del', danger: true }],
    })
  }

  return sections
}

export function getEdgeContextMenuSections(
  edgeId: string,
  graphEdges: VisualEdgeDto[],
  graphNodes: VisualNodeDto[],
  isDiffMode: boolean,
  permissions?: PermissionCheck,
): ContextMenuSection[] {
  const edge = graphEdges.find((e) => e.id === edgeId)
  if (!edge) return []

  const canDelete = permissions?.canDelete ?? true
  const isDeletable = !NON_CREATABLE_EDGE_TYPES.has(edge.edgeType)

  const sections: ContextMenuSection[] = []

  // Inspect section
  sections.push({
    items: [{ id: 'inspect-edge', label: 'Inspect Relationship' }],
  })

  // Focus section
  const sourceNode = graphNodes.find((n) => n.id === edge.sourceId)
  const targetNode = graphNodes.find((n) => n.id === edge.targetId)
  const focusItems: ContextMenuAction[] = []
  if (sourceNode) {
    focusItems.push({ id: 'focus-source', label: `Focus Source: ${sourceNode.label}` })
  }
  if (targetNode) {
    focusItems.push({ id: 'focus-target', label: `Focus Target: ${targetNode.label}` })
  }
  if (focusItems.length > 0) {
    sections.push({ items: focusItems })
  }

  // Destructive section (gated by permission)
  if (!isDiffMode && isDeletable && canDelete) {
    sections.push({
      items: [{ id: 'delete-edge', label: 'Delete Relationship', danger: true }],
    })
  }

  return sections
}

export function getPaneContextMenuSections(
  scopeType: ScopeType,
  isDiffMode: boolean,
  hasNodes: boolean,
  permissions?: PermissionCheck,
): ContextMenuSection[] {
  const canEdit = permissions?.canEdit ?? true
  const sections: ContextMenuSection[] = []

  // Add node section (hidden in diff mode or when no edit permission)
  if (!isDiffMode && canEdit) {
    const addable = getAddableEntitiesByScope(scopeType)
    if (addable.length > 0) {
      sections.push({
        items: addable.map((a) => ({
          id: 'add-node' as const,
          label: `Add ${a.label}`,
          nodeType: a.nodeType,
        })),
      })
    }
  }

  // View section
  const viewItems: ContextMenuAction[] = [
    { id: 'fit-view', label: 'Fit View', shortcut: 'F' },
    { id: 'auto-layout', label: 'Auto Layout' },
  ]
  if (hasNodes) {
    viewItems.push({ id: 'select-all', label: 'Select All', shortcut: 'Ctrl+A' })
  }
  sections.push({ items: viewItems })

  const canComment = permissions?.canComment ?? true
  if (!isDiffMode && canComment) {
    sections.push({
      items: [{ id: 'add-comment', label: 'Add Comment to Scope' }],
    })
  }

  return sections
}

export function getMultiSelectContextMenuSections(
  selectedNodeIds: string[],
  isDiffMode: boolean,
  permissions?: PermissionCheck,
): ContextMenuSection[] {
  const canDelete = permissions?.canDelete ?? true
  const count = selectedNodeIds.length
  if (count < 2) return []

  const sections: ContextMenuSection[] = []

  sections.push({
    items: [{ id: 'deselect-all', label: 'Deselect All', shortcut: 'Esc' }],
  })

  if (!isDiffMode && canDelete) {
    sections.push({
      items: [{ id: 'delete-selected', label: `Delete ${count} Selected`, danger: true }],
    })
  }

  return sections
}

export function resolveEdgeForDeletion(
  edgeId: string,
  graphEdges: VisualEdgeDto[],
): { edgeType: EdgeType; sourceId: string; targetId: string } | null {
  const edge = graphEdges.find((e) => e.id === edgeId)
  if (!edge) return null
  if (NON_CREATABLE_EDGE_TYPES.has(edge.edgeType)) return null
  return { edgeType: edge.edgeType, sourceId: edge.sourceId, targetId: edge.targetId }
}
