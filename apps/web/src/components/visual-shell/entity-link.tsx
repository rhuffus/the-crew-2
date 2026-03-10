import { useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ExternalLink } from 'lucide-react'
import type { NodeType } from '@the-crew/shared-types'
import { resolveEntityRoute, extractDeptIdFromParent } from '@/lib/entity-route-resolver'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'
import { getNodeTypeLabel } from './inspector/inspector-utils'

export interface EntityLinkProps {
  entityId: string
  nodeType: NodeType
  label: string
  projectId: string
  parentId?: string | null
  /** Whether this entity is present in the current canvas graph */
  isInScope?: boolean
}

export function EntityLink({
  entityId,
  nodeType,
  label,
  projectId,
  parentId = null,
  isInScope = false,
}: EntityLinkProps) {
  const navigate = useNavigate()
  const focusNode = useVisualWorkspaceStore((s) => s.focusNode)

  const parentDeptId = extractDeptIdFromParent(parentId)

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      const route = resolveEntityRoute(projectId, nodeType, entityId, parentDeptId)

      if (route.focusNodeId) {
        // Navigate to the scope route and focus on the entity after navigation
        focusNode(route.focusNodeId)
      }

      navigate({ to: route.path })
    },
    [projectId, nodeType, entityId, parentDeptId, navigate, focusNode],
  )

  const typeLabel = getNodeTypeLabel(nodeType)

  return (
    <button
      type="button"
      data-testid={`entity-link-${entityId}`}
      onClick={handleClick}
      className={`inline-flex items-center gap-1 rounded px-1 py-0.5 text-xs font-medium transition-colors ${
        isInScope
          ? 'text-foreground hover:bg-accent'
          : 'text-blue-600 hover:bg-blue-50 hover:text-blue-700'
      }`}
      title={`Navigate to ${typeLabel}: ${label}`}
    >
      <span className="truncate max-w-[140px]">{label}</span>
      {!isInScope && <ExternalLink className="h-3 w-3 shrink-0 opacity-60" />}
    </button>
  )
}
