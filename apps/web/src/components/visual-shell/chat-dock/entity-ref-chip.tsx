import { useNavigate } from '@tanstack/react-router'
import type { ChatEntityRef } from '@the-crew/shared-types'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'
import { resolveEntityRoute } from '@/lib/entity-route-resolver'

interface EntityRefChipProps {
  entityRef: ChatEntityRef
  projectId: string
}

export function EntityRefChip({ entityRef, projectId }: EntityRefChipProps) {
  const navigate = useNavigate()
  const graphNodes = useVisualWorkspaceStore((s) => s.graphNodes)

  const isInScope = graphNodes.some(
    (n) => n.entityId === entityRef.entityId && n.nodeType === entityRef.entityType,
  )

  const handleClick = () => {
    if (isInScope) {
      useVisualWorkspaceStore.getState().focusNode(entityRef.entityId)
    } else {
      const route = resolveEntityRoute(projectId, entityRef.entityType, entityRef.entityId)
      if (route) {
        navigate({ to: route.path })
      }
    }
  }

  return (
    <button
      type="button"
      data-testid="entity-ref-chip"
      onClick={handleClick}
      className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary hover:bg-primary/20"
    >
      <span>@{entityRef.label}</span>
    </button>
  )
}
