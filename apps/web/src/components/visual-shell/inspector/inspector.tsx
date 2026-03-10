import { useState, useCallback } from 'react'
import { PanelRight } from 'lucide-react'
import type { VisualNodeDto, VisualEdgeDto, ValidationIssue, EdgeType, NodeType, VisualDiffStatus, VisualDiffSummary } from '@the-crew/shared-types'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'
import { groupIssuesByVisualNodeId } from '@/lib/validation-mapping'
import { InspectorHeader } from './inspector-header'
import { OverviewTab } from './overview-tab'
import { PropertiesTab } from './properties-tab'
import { RelationsTab } from './relations-tab'
import { ChangesTab } from './changes-tab'
import { EdgeInspector } from './edge-inspector'
import { MultiSelectSummary } from './multi-select-summary'
import { CanvasSummary } from './canvas-summary'
import { DiffSummaryPanel } from './diff-summary-panel'
import {
  getSelectionSummary,
  findNodeInGraph,
  findEdgeInGraph,
  getRelatedEdges,
} from './inspector-utils'

export type InspectorTabId = 'overview' | 'properties' | 'relations' | 'changes'

const TAB_LABELS: Record<InspectorTabId, string> = {
  overview: 'Overview',
  properties: 'Properties',
  relations: 'Relations',
  changes: 'Changes',
}

const STANDARD_TABS: InspectorTabId[] = ['overview', 'properties', 'relations']
const DIFF_TABS: InspectorTabId[] = ['overview', 'changes', 'properties']

export interface InspectorProps {
  graphNodes?: VisualNodeDto[]
  graphEdges?: VisualEdgeDto[]
  onEdgeDelete?: (edgeType: EdgeType, sourceNodeId: string, targetNodeId: string) => void
  onEdgeCreate?: (edgeType: EdgeType, sourceNodeId: string, targetNodeId: string, metadata?: Record<string, unknown>) => void
  onEdgeUpdateMetadata?: (edgeType: EdgeType, sourceNodeId: string, targetNodeId: string, metadata: Record<string, unknown>) => void
  onNodeUpdate?: (entityId: string, nodeType: NodeType, patch: Record<string, string>) => void
  isPending?: boolean
  diffSummary?: VisualDiffSummary | null
}

export function Inspector({ graphNodes, graphEdges, onEdgeDelete, onEdgeCreate, onEdgeUpdateMetadata, onNodeUpdate, isPending = false, diffSummary }: InspectorProps) {
  const {
    inspectorCollapsed,
    toggleInspector,
    selectedNodeIds,
    selectedEdgeIds,
    validationIssues,
    projectId,
    isDiffMode,
    graphNodes: storeNodes,
    graphEdges: storeEdges,
    showDeleteConfirm,
  } = useVisualWorkspaceStore()
  const [activeTab, setActiveTab] = useState<InspectorTabId>('overview')

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

  if (inspectorCollapsed) {
    return (
      <div
        data-testid="inspector-collapsed"
        className="flex w-12 flex-col items-center border-l border-border bg-card py-2"
      >
        <button
          type="button"
          aria-label="Expand inspector"
          onClick={toggleInspector}
          className="rounded p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <PanelRight className="h-4 w-4" />
        </button>
      </div>
    )
  }

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

  return (
    <div data-testid="inspector" className="flex h-full w-full min-w-0 flex-col overflow-hidden border-l border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Inspector
        </span>
        <button
          type="button"
          aria-label="Close inspector"
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
        const tabOrder = isDiffMode ? DIFF_TABS : STANDARD_TABS
        const nodeDiffStatus = (selectedNode as VisualNodeDto & { diffStatus?: VisualDiffStatus }).diffStatus
        const nodeChanges = (selectedNode as VisualNodeDto & { changes?: Record<string, { before: unknown; after: unknown }> }).changes
        return (
        <>
          <div className="flex border-b border-border">
            {tabOrder.map((tabId) => (
              <button
                key={tabId}
                type="button"
                data-testid={`tab-${tabId}`}
                onClick={() => setActiveTab(tabId)}
                className={`flex-1 px-2 py-1.5 text-xs font-medium ${
                  activeTab === tabId
                    ? 'border-b-2 border-primary text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {TAB_LABELS[tabId]}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            <div data-testid="inspector-detail">
              {activeTab === 'overview' && (
                <OverviewTab node={selectedNode} validationIssues={nodeValidationIssues} onNodeUpdate={onNodeUpdate} isPending={isPending} />
              )}
              {activeTab === 'changes' && isDiffMode && nodeDiffStatus && (
                <ChangesTab
                  diffStatus={nodeDiffStatus}
                  changes={nodeChanges}
                  label={selectedNode.label}
                />
              )}
              {activeTab === 'properties' && <PropertiesTab node={selectedNode} />}
              {activeTab === 'relations' && !isDiffMode && (
                <RelationsTab
                  node={selectedNode}
                  relatedEdges={getRelatedEdges(selectedNode.id, resolvedEdges)}
                  allNodes={resolvedNodes}
                  allEdges={resolvedEdges}
                  projectId={projectId ?? undefined}
                  onRemoveRelation={handleEdgeDelete}
                  onAddRelation={onEdgeCreate}
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
          <MultiSelectSummary summary={summary} />
        </div>
      )}

      {summary.type === 'none' && (
        <div className="flex-1 overflow-y-auto p-3">
          {isDiffMode && diffSummary ? (
            <DiffSummaryPanel summary={diffSummary} />
          ) : (
            <CanvasSummary nodes={resolvedNodes} edges={resolvedEdges} />
          )}
        </div>
      )}
    </div>
  )
}
