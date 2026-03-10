import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import type { VisualEdgeDto, VisualNodeDto } from '@the-crew/shared-types'
import { NON_CREATABLE_EDGE_TYPES } from '@/lib/relationship-mutations'
import { getEdgeTypeLabel, findNodeInGraph, getNodeTypeLabel } from './inspector-utils'

export interface EdgeInspectorProps {
  edge: VisualEdgeDto
  allNodes: VisualNodeDto[]
  isPending?: boolean
  onDelete?: (edgeType: VisualEdgeDto['edgeType'], sourceNodeId: string, targetNodeId: string) => void
  onUpdateMetadata?: (edgeType: VisualEdgeDto['edgeType'], sourceNodeId: string, targetNodeId: string, metadata: Record<string, unknown>) => void
}

export function EdgeInspector({ edge, allNodes, isPending = false, onDelete, onUpdateMetadata }: EdgeInspectorProps) {
  const sourceNode = findNodeInGraph(edge.sourceId, allNodes)
  const targetNode = findNodeInGraph(edge.targetId, allNodes)
  const isDeletable = !NON_CREATABLE_EDGE_TYPES.has(edge.edgeType)
  const isParticipatesIn = edge.edgeType === 'participates_in'

  const [editingResponsibility, setEditingResponsibility] = useState(false)
  const [responsibilityValue, setResponsibilityValue] = useState(edge.label ?? '')

  const handleResponsibilitySave = () => {
    setEditingResponsibility(false)
    if (responsibilityValue !== (edge.label ?? '') && onUpdateMetadata) {
      onUpdateMetadata(edge.edgeType, edge.sourceId, edge.targetId, {
        responsibility: responsibilityValue,
      })
    }
  }

  const handleResponsibilityKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleResponsibilitySave()
    } else if (e.key === 'Escape') {
      setEditingResponsibility(false)
      setResponsibilityValue(edge.label ?? '')
    }
  }

  return (
    <div data-testid="edge-inspector" className="space-y-3">
      <div className="flex items-center justify-between">
        <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Edge Type
        </dt>
        {isDeletable && onDelete && (
          <button
            type="button"
            data-testid="edge-delete-btn"
            onClick={() => onDelete(edge.edgeType, edge.sourceId, edge.targetId)}
            disabled={isPending}
            className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
            aria-label="Delete relationship"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <dd className="-mt-2 text-sm text-foreground">{getEdgeTypeLabel(edge.edgeType)}</dd>

      <div>
        <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Style
        </dt>
        <dd className="mt-0.5 text-sm text-foreground">{edge.style}</dd>
      </div>

      <div>
        <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Source
        </dt>
        <dd className="mt-0.5 text-sm text-foreground">
          {sourceNode ? (
            <span>
              <span className="font-medium">{sourceNode.label}</span>
              <span className="ml-1 text-muted-foreground">
                ({getNodeTypeLabel(sourceNode.nodeType)})
              </span>
            </span>
          ) : (
            <span className="text-muted-foreground">{edge.sourceId}</span>
          )}
        </dd>
      </div>

      <div>
        <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Target
        </dt>
        <dd className="mt-0.5 text-sm text-foreground">
          {targetNode ? (
            <span>
              <span className="font-medium">{targetNode.label}</span>
              <span className="ml-1 text-muted-foreground">
                ({getNodeTypeLabel(targetNode.nodeType)})
              </span>
            </span>
          ) : (
            <span className="text-muted-foreground">{edge.targetId}</span>
          )}
        </dd>
      </div>

      {isParticipatesIn && (
        <div>
          <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Responsibility
          </dt>
          <dd className="mt-0.5">
            {editingResponsibility ? (
              <input
                data-testid="responsibility-input"
                type="text"
                value={responsibilityValue}
                onChange={(e) => setResponsibilityValue(e.target.value)}
                onBlur={handleResponsibilitySave}
                onKeyDown={handleResponsibilityKeyDown}
                maxLength={200}
                autoFocus
                className="w-full rounded border border-border bg-background px-2 py-1 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            ) : (
              <button
                type="button"
                data-testid="responsibility-edit-btn"
                onClick={() => setEditingResponsibility(true)}
                disabled={!onUpdateMetadata}
                className="w-full rounded px-2 py-1 text-left text-sm text-foreground hover:bg-accent disabled:cursor-default disabled:hover:bg-transparent"
              >
                {edge.label || <span className="italic text-muted-foreground">No responsibility set</span>}
              </button>
            )}
          </dd>
        </div>
      )}

      {!isParticipatesIn && edge.label && (
        <div>
          <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Label
          </dt>
          <dd className="mt-0.5 text-sm text-foreground">{edge.label}</dd>
        </div>
      )}

      <div>
        <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Layers
        </dt>
        <dd className="mt-0.5 text-sm text-foreground">{edge.layerIds.join(', ')}</dd>
      </div>
    </div>
  )
}
