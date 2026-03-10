import { useState, useMemo } from 'react'
import type {
  EdgeType,
  NodeType,
  ConnectionRule,
  VisualNodeDto,
  VisualEdgeDto,
} from '@the-crew/shared-types'
import { CONNECTION_RULES } from '@the-crew/shared-types'
import { NON_CREATABLE_EDGE_TYPES } from '@/lib/relationship-mutations'
import { requiresMetadata } from '@/lib/relationship-mutations'
import { checkDuplicate } from '@/lib/connection-validator'
import { getEdgeTypeLabel, getNodeTypeLabel } from './inspector-utils'

// --- Public interface ---

export interface AddRelationshipDialogProps {
  node: VisualNodeDto
  allNodes: VisualNodeDto[]
  allEdges: VisualEdgeDto[]
  onAdd: (
    edgeType: EdgeType,
    sourceNodeId: string,
    targetNodeId: string,
    metadata?: Record<string, unknown>,
  ) => void
  onCancel: () => void
}

// --- Helper types ---

export interface EdgeTypeOption {
  edgeType: EdgeType
  direction: 'outgoing' | 'incoming'
  label: string
  compatibleNodeTypes: NodeType[]
}

// --- Pure helper: compute available edge types for a node ---

export function getAvailableEdgeTypes(
  nodeType: NodeType,
  rules: ConnectionRule[],
): EdgeTypeOption[] {
  const outgoingMap = new Map<EdgeType, Set<NodeType>>()
  const incomingMap = new Map<EdgeType, Set<NodeType>>()

  for (const rule of rules) {
    if (NON_CREATABLE_EDGE_TYPES.has(rule.edgeType)) continue
    if (rule.sourceTypes.includes(nodeType)) {
      const existing = outgoingMap.get(rule.edgeType) ?? new Set()
      for (const t of rule.targetTypes) existing.add(t)
      outgoingMap.set(rule.edgeType, existing)
    }
    if (rule.targetTypes.includes(nodeType)) {
      const existing = incomingMap.get(rule.edgeType) ?? new Set()
      for (const s of rule.sourceTypes) existing.add(s)
      incomingMap.set(rule.edgeType, existing)
    }
  }

  const options: EdgeTypeOption[] = []
  for (const [edgeType, types] of outgoingMap) {
    options.push({
      edgeType,
      direction: 'outgoing',
      label: getEdgeTypeLabel(edgeType),
      compatibleNodeTypes: [...types],
    })
  }
  for (const [edgeType, types] of incomingMap) {
    options.push({
      edgeType,
      direction: 'incoming',
      label: getEdgeTypeLabel(edgeType),
      compatibleNodeTypes: [...types],
    })
  }

  return options
}

// --- Component ---

export function AddRelationshipDialog({
  node,
  allNodes,
  allEdges,
  onAdd,
  onCancel,
}: AddRelationshipDialogProps) {
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<string>('')
  const [selectedEntityId, setSelectedEntityId] = useState<string>('')
  const [responsibility, setResponsibility] = useState('')
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null)

  const edgeTypeOptions = useMemo(
    () => getAvailableEdgeTypes(node.nodeType, CONNECTION_RULES),
    [node.nodeType],
  )

  const outgoing = edgeTypeOptions.filter((o) => o.direction === 'outgoing')
  const incoming = edgeTypeOptions.filter((o) => o.direction === 'incoming')

  const selectedOption = selectedOptionIdx !== ''
    ? edgeTypeOptions[Number(selectedOptionIdx)]
    : undefined

  const candidateEntities = useMemo(() => {
    if (!selectedOption) return []
    return allNodes.filter(
      (n) =>
        selectedOption.compatibleNodeTypes.includes(n.nodeType) &&
        n.entityId !== node.entityId,
    )
  }, [selectedOption, allNodes, node.entityId])

  const needsMetadata = selectedOption ? requiresMetadata(selectedOption.edgeType) : false

  const handleEdgeTypeChange = (value: string) => {
    setSelectedOptionIdx(value)
    setSelectedEntityId('')
    setResponsibility('')
    setDuplicateWarning(null)
  }

  const handleEntityChange = (entityVisualId: string) => {
    setSelectedEntityId(entityVisualId)
    setDuplicateWarning(null)

    if (entityVisualId && selectedOption) {
      const sourceId = selectedOption.direction === 'outgoing' ? node.id : entityVisualId
      const targetId = selectedOption.direction === 'outgoing' ? entityVisualId : node.id
      const dup = checkDuplicate(selectedOption.edgeType, sourceId, targetId, allEdges)
      if (dup.isDuplicate) {
        setDuplicateWarning('This relationship already exists.')
      } else if (dup.isReplacement) {
        setDuplicateWarning('This will replace the existing relationship.')
      }
    }
  }

  const canSubmit =
    selectedOption != null &&
    selectedEntityId !== '' &&
    (!needsMetadata || responsibility.trim() !== '') &&
    !duplicateWarning?.includes('already exists')

  const handleSubmit = () => {
    if (!selectedOption || !selectedEntityId) return

    const sourceId = selectedOption.direction === 'outgoing' ? node.id : selectedEntityId
    const targetId = selectedOption.direction === 'outgoing' ? selectedEntityId : node.id

    const metadata = needsMetadata
      ? { responsibility: responsibility.trim() }
      : undefined

    onAdd(selectedOption.edgeType, sourceId, targetId, metadata)
  }

  return (
    <div data-testid="add-relationship-dialog" className="space-y-3 rounded border border-border bg-background p-3">
      <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Add Relationship
      </h5>

      {/* Edge type selector */}
      <div>
        <label htmlFor="edge-type-select" className="mb-1 block text-xs text-muted-foreground">
          Relationship type
        </label>
        <select
          id="edge-type-select"
          data-testid="edge-type-select"
          value={selectedOptionIdx}
          onChange={(e) => handleEdgeTypeChange(e.target.value)}
          className="w-full rounded border border-border bg-background px-2 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
        >
          <option value="">Select...</option>
          {outgoing.length > 0 && (
            <optgroup label="Outgoing">
              {outgoing.map((opt) => {
                const idx = edgeTypeOptions.indexOf(opt)
                return (
                  <option key={`out-${idx}`} value={idx}>
                    {opt.label} → {opt.compatibleNodeTypes.map(getNodeTypeLabel).join(', ')}
                  </option>
                )
              })}
            </optgroup>
          )}
          {incoming.length > 0 && (
            <optgroup label="Incoming">
              {incoming.map((opt) => {
                const idx = edgeTypeOptions.indexOf(opt)
                return (
                  <option key={`in-${idx}`} value={idx}>
                    {opt.label} ← {opt.compatibleNodeTypes.map(getNodeTypeLabel).join(', ')}
                  </option>
                )
              })}
            </optgroup>
          )}
        </select>
      </div>

      {/* Entity selector */}
      {selectedOption && (
        <div>
          <label htmlFor="entity-select" className="mb-1 block text-xs text-muted-foreground">
            {selectedOption.direction === 'outgoing' ? 'Target' : 'Source'} entity
          </label>
          <select
            id="entity-select"
            data-testid="entity-select"
            value={selectedEntityId}
            onChange={(e) => handleEntityChange(e.target.value)}
            className="w-full rounded border border-border bg-background px-2 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
          >
            <option value="">Select entity...</option>
            {candidateEntities.map((entity) => (
              <option key={entity.id} value={entity.id}>
                {entity.label} ({getNodeTypeLabel(entity.nodeType)})
              </option>
            ))}
          </select>
          {candidateEntities.length === 0 && (
            <p data-testid="no-candidates" className="mt-1 text-xs text-muted-foreground">
              No compatible entities found in the current view.
            </p>
          )}
          {duplicateWarning && (
            <p data-testid="duplicate-warning" className="mt-1 text-xs text-amber-600">
              {duplicateWarning}
            </p>
          )}
        </div>
      )}

      {/* Metadata: responsibility for participates_in */}
      {needsMetadata && selectedEntityId && (
        <div>
          <label htmlFor="responsibility-input" className="mb-1 block text-xs text-muted-foreground">
            Responsibility
          </label>
          <input
            id="responsibility-input"
            data-testid="add-responsibility-input"
            type="text"
            value={responsibility}
            onChange={(e) => setResponsibility(e.target.value)}
            maxLength={200}
            placeholder="e.g. Facilitates onboarding sessions"
            className="w-full rounded border border-border bg-background px-2 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          data-testid="add-cancel-btn"
          onClick={onCancel}
          className="rounded px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          Cancel
        </button>
        <button
          type="button"
          data-testid="add-confirm-btn"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="rounded bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          Add
        </button>
      </div>
    </div>
  )
}
