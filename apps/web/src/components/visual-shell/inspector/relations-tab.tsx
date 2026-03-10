import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import type { VisualNodeDto, VisualEdgeDto, EdgeType } from '@the-crew/shared-types'
import { NON_CREATABLE_EDGE_TYPES } from '@/lib/relationship-mutations'
import { EntityLink } from '../entity-link'
import { getEdgeTypeLabel, findNodeInGraph } from './inspector-utils'
import { AddRelationshipDialog } from './add-relationship-dialog'

export interface RelationsTabProps {
  node: VisualNodeDto
  relatedEdges: VisualEdgeDto[]
  allNodes: VisualNodeDto[]
  allEdges?: VisualEdgeDto[]
  projectId?: string
  onRemoveRelation?: (edgeType: EdgeType, sourceNodeId: string, targetNodeId: string) => void
  onAddRelation?: (edgeType: EdgeType, sourceNodeId: string, targetNodeId: string, metadata?: Record<string, unknown>) => void
}

interface RelationEntry {
  edgeId: string
  edgeType: EdgeType
  direction: 'incoming' | 'outgoing'
  otherNodeId: string
  otherNode: VisualNodeDto | undefined
  otherLabel: string
  sourceNodeId: string
  targetNodeId: string
  isDeletable: boolean
}

function buildRelations(
  node: VisualNodeDto,
  edges: VisualEdgeDto[],
  allNodes: VisualNodeDto[],
): RelationEntry[] {
  return edges.map((edge) => {
    const isSource = edge.sourceId === node.id
    const otherNodeId = isSource ? edge.targetId : edge.sourceId
    const otherNode = findNodeInGraph(otherNodeId, allNodes)
    return {
      edgeId: edge.id,
      edgeType: edge.edgeType,
      direction: isSource ? 'outgoing' : 'incoming',
      otherNodeId,
      otherNode,
      otherLabel: otherNode?.label ?? otherNodeId,
      sourceNodeId: edge.sourceId,
      targetNodeId: edge.targetId,
      isDeletable: !NON_CREATABLE_EDGE_TYPES.has(edge.edgeType),
    }
  })
}

export function RelationsTab({ node, relatedEdges, allNodes, allEdges = [], projectId, onRemoveRelation, onAddRelation }: RelationsTabProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const relations = buildRelations(node, relatedEdges, allNodes)

  const incoming = relations.filter((r) => r.direction === 'incoming')
  const outgoing = relations.filter((r) => r.direction === 'outgoing')

  const handleAdd = (edgeType: EdgeType, sourceNodeId: string, targetNodeId: string, metadata?: Record<string, unknown>) => {
    onAddRelation?.(edgeType, sourceNodeId, targetNodeId, metadata)
    setShowAddDialog(false)
  }

  return (
    <div data-testid="relations-tab" className="space-y-3">
      {relations.length === 0 && !showAddDialog && (
        <p className="text-xs text-muted-foreground">No relations found.</p>
      )}

      {incoming.length > 0 && (
        <div>
          <h5 className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Incoming
          </h5>
          <ul className="space-y-1">
            {incoming.map((rel) => (
              <li
                key={rel.edgeId}
                className="group flex items-center justify-between rounded border border-border px-2 py-1.5 text-xs"
              >
                <span className="flex items-center gap-0.5">
                  {projectId && rel.otherNode ? (
                    <EntityLink
                      entityId={rel.otherNode.entityId}
                      nodeType={rel.otherNode.nodeType}
                      label={rel.otherLabel}
                      projectId={projectId}
                      parentId={rel.otherNode.parentId}
                      isInScope={!!findNodeInGraph(rel.otherNodeId, allNodes)}
                    />
                  ) : (
                    <span className="font-medium text-foreground">{rel.otherLabel}</span>
                  )}
                  <span className="mx-1 text-muted-foreground">&rarr;</span>
                  <span className="text-muted-foreground">{getEdgeTypeLabel(rel.edgeType)}</span>
                </span>
                {rel.isDeletable && onRemoveRelation && (
                  <button
                    type="button"
                    data-testid={`remove-relation-${rel.edgeId}`}
                    onClick={() => onRemoveRelation(rel.edgeType, rel.sourceNodeId, rel.targetNodeId)}
                    className="ml-1 hidden rounded p-0.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive group-hover:inline-flex"
                    aria-label={`Remove ${getEdgeTypeLabel(rel.edgeType)} from ${rel.otherLabel}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {outgoing.length > 0 && (
        <div>
          <h5 className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Outgoing
          </h5>
          <ul className="space-y-1">
            {outgoing.map((rel) => (
              <li
                key={rel.edgeId}
                className="group flex items-center justify-between rounded border border-border px-2 py-1.5 text-xs"
              >
                <span className="flex items-center gap-0.5">
                  <span className="text-muted-foreground">{getEdgeTypeLabel(rel.edgeType)}</span>
                  <span className="mx-1 text-muted-foreground">&rarr;</span>
                  {projectId && rel.otherNode ? (
                    <EntityLink
                      entityId={rel.otherNode.entityId}
                      nodeType={rel.otherNode.nodeType}
                      label={rel.otherLabel}
                      projectId={projectId}
                      parentId={rel.otherNode.parentId}
                      isInScope={!!findNodeInGraph(rel.otherNodeId, allNodes)}
                    />
                  ) : (
                    <span className="font-medium text-foreground">{rel.otherLabel}</span>
                  )}
                </span>
                {rel.isDeletable && onRemoveRelation && (
                  <button
                    type="button"
                    data-testid={`remove-relation-${rel.edgeId}`}
                    onClick={() => onRemoveRelation(rel.edgeType, rel.sourceNodeId, rel.targetNodeId)}
                    className="ml-1 hidden rounded p-0.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive group-hover:inline-flex"
                    aria-label={`Remove ${getEdgeTypeLabel(rel.edgeType)} to ${rel.otherLabel}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {showAddDialog ? (
        <AddRelationshipDialog
          node={node}
          allNodes={allNodes}
          allEdges={allEdges}
          onAdd={handleAdd}
          onCancel={() => setShowAddDialog(false)}
        />
      ) : (
        onAddRelation && (
          <button
            type="button"
            data-testid="add-relationship-btn"
            onClick={() => setShowAddDialog(true)}
            className="flex w-full items-center justify-center gap-1 rounded border border-dashed border-border px-2 py-1.5 text-xs text-muted-foreground hover:border-primary hover:text-primary"
          >
            <Plus className="h-3 w-3" />
            Add Relationship
          </button>
        )
      )}
    </div>
  )
}
