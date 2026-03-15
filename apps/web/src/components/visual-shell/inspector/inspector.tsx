import { useState, useCallback } from 'react'
import { PanelRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { VisualNodeDto, VisualEdgeDto, ValidationIssue, EdgeType, NodeType, VisualDiffStatus, VisualDiffSummary } from '@the-crew/shared-types'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'
import { groupIssuesByVisualNodeId } from '@/lib/validation-mapping'
import { useEntityDetail } from '@/hooks/use-entity-detail'
import { usePermission } from '@/hooks/use-permissions'
import { LockIndicator } from './lock-indicator'
import { ReviewIndicator } from './review-indicator'
import { InspectorHeader } from './inspector-header'
import { OverviewTab } from './overview-tab'
import { EditFormPanel } from './edit-form-panel'
import { PropertiesTab } from './properties-tab'
import { RelationsTab } from './relations-tab'
import { ValidationTab } from './validation-tab'
import { CommentsTab } from './comments-tab'
import { OperationsTab } from './operations-tab'
import { RuntimeTab } from './runtime-tab'
import { ChangesTab } from './changes-tab'
import { EdgeInspector } from './edge-inspector'
import { MultiSelectSummary } from './multi-select-summary'
import { CanvasSummary } from './canvas-summary'
import { ChatInspectorPanel } from './chat-inspector-panel'
import { AgentChatInspectorPanel } from './agent-chat-inspector-panel'
import { DiffSummaryPanel } from './diff-summary-panel'
import { UoDetailPanel } from './uo-detail-panel'
import { AgentDetailPanel } from './agent-detail-panel'
import { ProposalDetailPanel } from './proposal-detail-panel'
import { DocumentInspectorPanel } from './document-inspector-panel'
import {
  getSelectionSummary,
  findNodeInGraph,
  findEdgeInGraph,
  getRelatedEdges,
} from './inspector-utils'

const V3_DETAIL_NODE_TYPES = new Set<NodeType>([
  'company', 'department', 'team',
  'coordinator-agent', 'specialist-agent',
  'proposal',
])

export type InspectorTabId = 'overview' | 'edit' | 'properties' | 'relations' | 'validation' | 'changes' | 'comments' | 'operations' | 'runtime'

const STANDARD_TABS: InspectorTabId[] = ['edit', 'relations', 'validation', 'comments', 'properties']
const STANDARD_TABS_WITH_OPS: InspectorTabId[] = ['edit', 'relations', 'validation', 'comments', 'operations', 'properties']
const STANDARD_TABS_LIVE: InspectorTabId[] = ['runtime', 'relations', 'validation', 'comments', 'properties']
const READ_ONLY_TABS: InspectorTabId[] = ['overview', 'relations', 'comments', 'properties']
const READ_ONLY_TABS_WITH_OPS: InspectorTabId[] = ['overview', 'relations', 'comments', 'operations', 'properties']
const READ_ONLY_TABS_LIVE: InspectorTabId[] = ['runtime', 'relations', 'comments', 'properties']
const DIFF_TABS: InspectorTabId[] = ['overview', 'changes', 'properties']

const EDITABLE_NODE_TYPES = new Set<NodeType>([
  'department', 'capability', 'role', 'agent-archetype', 'agent-assignment',
  'skill', 'workflow', 'contract', 'policy',
])

export interface InspectorProps {
  graphNodes?: VisualNodeDto[]
  graphEdges?: VisualEdgeDto[]
  onEdgeDelete?: (edgeType: EdgeType, sourceNodeId: string, targetNodeId: string) => void
  onEdgeCreate?: (edgeType: EdgeType, sourceNodeId: string, targetNodeId: string, metadata?: Record<string, unknown>) => void
  onEdgeUpdateMetadata?: (edgeType: EdgeType, sourceNodeId: string, targetNodeId: string, metadata: Record<string, unknown>) => void
  onNodeUpdate?: (entityId: string, nodeType: NodeType, patch: Record<string, unknown>) => void
  onNodeDelete?: (entityId: string, nodeType: NodeType) => void
  isPending?: boolean
  diffSummary?: VisualDiffSummary | null
}

export function Inspector({ graphNodes, graphEdges, onEdgeDelete, onEdgeCreate, onEdgeUpdateMetadata, onNodeUpdate, onNodeDelete, isPending = false, diffSummary }: InspectorProps) {
  const inspectorCollapsed = useVisualWorkspaceStore((s) => s.inspectorCollapsed)
  const toggleInspector = useVisualWorkspaceStore((s) => s.toggleInspector)
  const selectedNodeIds = useVisualWorkspaceStore((s) => s.selectedNodeIds)
  const selectedEdgeIds = useVisualWorkspaceStore((s) => s.selectedEdgeIds)
  const validationIssues = useVisualWorkspaceStore((s) => s.validationIssues)
  const projectId = useVisualWorkspaceStore((s) => s.projectId)
  const isDiffMode = useVisualWorkspaceStore((s) => s.isDiffMode)
  const storeNodes = useVisualWorkspaceStore((s) => s.graphNodes)
  const storeEdges = useVisualWorkspaceStore((s) => s.graphEdges)
  const showDeleteConfirm = useVisualWorkspaceStore((s) => s.showDeleteConfirm)
  const currentScope = useVisualWorkspaceStore((s) => s.currentScope)
  const showOperationsOverlay = useVisualWorkspaceStore((s) => s.showOperationsOverlay)
  const designMode = useVisualWorkspaceStore((s) => s.designMode)
  const centerView = useVisualWorkspaceStore((s) => s.centerView)
  const [activeTab, setActiveTab] = useState<InspectorTabId>('edit')
  const { t } = useTranslation('inspector')

  // Permission checks (CAV-020)
  const canEditNodes = usePermission('canvas:node:edit')
  const canDeleteNodes = usePermission('canvas:node:delete')
  const canCreateEdges = usePermission('canvas:edge:create')
  const canDeleteEdges = usePermission('canvas:edge:delete')

  // Use props if provided, otherwise fall back to store
  const resolvedNodes = graphNodes && graphNodes.length > 0 ? graphNodes : storeNodes
  const resolvedEdges = graphEdges && graphEdges.length > 0 ? graphEdges : storeEdges

  const handleEdgeDelete = useCallback(
    (edgeType: EdgeType, sourceNodeId: string, targetNodeId: string) => {
      if (onEdgeDelete) {
        onEdgeDelete(edgeType, sourceNodeId, targetNodeId)
      } else {
        showDeleteConfirm(edgeType, sourceNodeId, targetNodeId)
      }
    },
    [onEdgeDelete, showDeleteConfirm],
  )

  const summary = getSelectionSummary(selectedNodeIds, selectedEdgeIds)

  let selectedNode: VisualNodeDto | undefined
  let selectedEdge: VisualEdgeDto | undefined
  let nodeValidationIssues: ValidationIssue[] = []

  if (summary.type === 'single-node' && selectedNodeIds[0]) {
    selectedNode = findNodeInGraph(selectedNodeIds[0], resolvedNodes)
    if (selectedNode && projectId && validationIssues.length > 0) {
      const issueMap = groupIssuesByVisualNodeId(validationIssues, projectId)
      nodeValidationIssues = issueMap.get(selectedNode.id) ?? []
    }
  } else if (summary.type === 'single-edge' && selectedEdgeIds[0]) {
    selectedEdge = findEdgeInGraph(selectedEdgeIds[0], resolvedEdges)
  }

  // Fetch full entity data for edit form
  const isEditable = selectedNode ? EDITABLE_NODE_TYPES.has(selectedNode.nodeType) : false
  const { data: entityData, isLoading: entityLoading } = useEntityDetail(
    projectId,
    selectedNode?.nodeType ?? null,
    selectedNode?.entityId ?? null,
  )

  // Determine which tabs to show (CAV-020: gate edit by permission, CAV-019: ops tab when overlay active)
  const getTabOrder = (): InspectorTabId[] => {
    if (isDiffMode) return DIFF_TABS
    if (designMode === 'live') {
      if (!isEditable || !canEditNodes) return READ_ONLY_TABS_LIVE
      return STANDARD_TABS_LIVE
    }
    if (!isEditable || !canEditNodes) return showOperationsOverlay ? READ_ONLY_TABS_WITH_OPS : READ_ONLY_TABS
    return showOperationsOverlay ? STANDARD_TABS_WITH_OPS : STANDARD_TABS
  }

  // Ensure active tab is valid for current tab set
  const tabOrder = selectedNode ? getTabOrder() : []
  const effectiveTab = tabOrder.includes(activeTab) ? activeTab : tabOrder[0] ?? 'edit'

  if (inspectorCollapsed) {
    return (
      <div
        data-testid="inspector-collapsed"
        className="flex w-12 flex-col items-center border-l border-border bg-card py-2"
      >
        <button
          type="button"
          aria-label={t('expand')}
          onClick={toggleInspector}
          className="rounded p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <PanelRight className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <div data-testid="inspector" className="flex h-full w-full min-w-0 flex-col overflow-hidden border-l border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t('title')}
        </span>
        <button
          type="button"
          aria-label={t('collapse')}
          onClick={toggleInspector}
          className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <PanelRight className="h-4 w-4" />
        </button>
      </div>

      {summary.type === 'single-node' && selectedNode && (
        <InspectorHeader nodeType={selectedNode.nodeType} label={selectedNode.label} />
      )}
      {summary.type === 'single-edge' && (
        <InspectorHeader />
      )}
      {summary.type === 'multi' && (
        <InspectorHeader />
      )}
      {summary.type === 'none' && (
        <InspectorHeader />
      )}

      {summary.type === 'single-node' && selectedNode && (() => {
        const nodeDiffStatus = (selectedNode as VisualNodeDto & { diffStatus?: VisualDiffStatus }).diffStatus
        const nodeChanges = (selectedNode as VisualNodeDto & { changes?: Record<string, { before: unknown; after: unknown }> }).changes
        return (
        <>
          {/* Collaboration indicators (CAV-021) */}
          {!isDiffMode && projectId && isEditable && (
            <div data-testid="collaboration-indicators" className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-1.5">
              <LockIndicator projectId={projectId} entityId={selectedNode.entityId} nodeType={selectedNode.nodeType} />
              <ReviewIndicator projectId={projectId} entityId={selectedNode.entityId} nodeType={selectedNode.nodeType} />
            </div>
          )}
          <div className="flex border-b border-border" role="tablist" aria-label="Inspector tabs">
            {tabOrder.map((tabId) => (
              <button
                key={tabId}
                type="button"
                role="tab"
                aria-selected={effectiveTab === tabId}
                aria-controls={`inspector-tabpanel-${tabId}`}
                id={`inspector-tab-${tabId}`}
                data-testid={`tab-${tabId}`}
                onClick={() => setActiveTab(tabId)}
                className={`flex-1 px-2 py-1.5 text-xs font-medium ${
                  effectiveTab === tabId
                    ? 'border-b-2 border-primary text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t(`tab.${tabId}`)}
                {tabId === 'validation' && nodeValidationIssues.length > 0 && (
                  <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-100 px-1 text-[10px] font-semibold text-red-700">
                    {nodeValidationIssues.length}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div
            className="flex-1 overflow-y-auto p-3"
            role="tabpanel"
            id={`inspector-tabpanel-${effectiveTab}`}
            aria-labelledby={`inspector-tab-${effectiveTab}`}
          >
            <div data-testid="inspector-detail">
              {effectiveTab === 'edit' && isEditable && projectId && (
                <EditFormPanel
                  nodeType={selectedNode.nodeType}
                  entityId={selectedNode.entityId}
                  entityData={entityData as Record<string, unknown> | undefined}
                  isLoadingData={entityLoading}
                  projectId={projectId}
                  onSave={onNodeUpdate ?? (() => {})}
                  isPending={isPending}
                />
              )}
              {effectiveTab === 'overview' && (
                V3_DETAIL_NODE_TYPES.has(selectedNode.nodeType) && projectId ? (
                  selectedNode.nodeType === 'proposal' ? (
                    <ProposalDetailPanel entityId={selectedNode.entityId} projectId={projectId} />
                  ) : selectedNode.nodeType === 'coordinator-agent' || selectedNode.nodeType === 'specialist-agent' ? (
                    <AgentDetailPanel entityId={selectedNode.entityId} nodeType={selectedNode.nodeType} projectId={projectId} />
                  ) : (
                    <UoDetailPanel entityId={selectedNode.entityId} nodeType={selectedNode.nodeType} projectId={projectId} />
                  )
                ) : (
                  <OverviewTab node={selectedNode} validationIssues={nodeValidationIssues} onNodeUpdate={onNodeUpdate as ((entityId: string, nodeType: NodeType, patch: Record<string, string>) => void) | undefined} isPending={isPending} />
                )
              )}
              {effectiveTab === 'changes' && isDiffMode && nodeDiffStatus && (
                <ChangesTab
                  diffStatus={nodeDiffStatus}
                  changes={nodeChanges}
                  label={selectedNode.label}
                />
              )}
              {effectiveTab === 'properties' && <PropertiesTab node={selectedNode} />}
              {effectiveTab === 'relations' && !isDiffMode && (
                <RelationsTab
                  node={selectedNode}
                  relatedEdges={getRelatedEdges(selectedNode.id, resolvedEdges)}
                  allNodes={resolvedNodes}
                  allEdges={resolvedEdges}
                  projectId={projectId ?? undefined}
                  onRemoveRelation={canDeleteEdges ? handleEdgeDelete : undefined}
                  onAddRelation={canCreateEdges ? onEdgeCreate : undefined}
                />
              )}
              {effectiveTab === 'validation' && !isDiffMode && (
                <ValidationTab validationIssues={nodeValidationIssues} />
              )}
              {effectiveTab === 'comments' && !isDiffMode && projectId && (
                <CommentsTab
                  projectId={projectId}
                  entityId={selectedNode.entityId}
                  scopeType={currentScope.scopeType}
                />
              )}
              {effectiveTab === 'operations' && !isDiffMode && projectId && (
                <OperationsTab
                  entityId={selectedNode.entityId}
                  nodeType={selectedNode.nodeType}
                  projectId={projectId}
                />
              )}
              {effectiveTab === 'runtime' && !isDiffMode && projectId && (
                <RuntimeTab
                  entityId={selectedNode.entityId}
                  nodeType={selectedNode.nodeType}
                  projectId={projectId}
                />
              )}
            </div>
          </div>
        </>
        )
      })()}

      {summary.type === 'single-edge' && selectedEdge && (
        <div className="flex-1 overflow-y-auto p-3">
          <EdgeInspector
            edge={selectedEdge}
            allNodes={resolvedNodes}
            isPending={isPending}
            onDelete={handleEdgeDelete}
            onUpdateMetadata={onEdgeUpdateMetadata}
          />
        </div>
      )}

      {summary.type === 'multi' && (
        <div className="flex-1 overflow-y-auto p-3">
          <MultiSelectSummary
            summary={summary}
            onDeleteSelected={(onNodeDelete && canDeleteNodes) ? () => {
              // Bulk delete: delete all selected nodes
              for (const nodeId of selectedNodeIds) {
                const node = findNodeInGraph(nodeId, resolvedNodes)
                if (node && EDITABLE_NODE_TYPES.has(node.nodeType)) {
                  onNodeDelete(node.entityId, node.nodeType)
                }
              }
            } : undefined}
            selectedNodeCount={selectedNodeIds.length}
          />
        </div>
      )}

      {summary.type === 'none' && (
        <div className="flex-1 overflow-y-auto p-3">
          {isDiffMode && diffSummary ? (
            <DiffSummaryPanel summary={diffSummary} />
          ) : centerView.type === 'chat' ? (
            centerView.agentId && projectId ? (
              <AgentChatInspectorPanel projectId={projectId} agentId={centerView.agentId} />
            ) : (
              <ChatInspectorPanel />
            )
          ) : centerView.type === 'document' && projectId ? (
            <DocumentInspectorPanel projectId={projectId} documentId={centerView.documentId} />
          ) : (
            <CanvasSummary nodes={resolvedNodes} edges={resolvedEdges} />
          )}
        </div>
      )}
    </div>
  )
}
