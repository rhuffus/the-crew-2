import type { ChatActionSuggestion } from '@the-crew/shared-types'
import { useNavigate } from '@tanstack/react-router'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'

interface ActionButtonProps {
  action: ChatActionSuggestion
  projectId: string
}

export function ActionButton({ action }: ActionButtonProps) {
  const navigate = useNavigate()

  const handleClick = () => {
    const state = useVisualWorkspaceStore.getState()
    switch (action.type) {
      case 'navigate':
        if (action.payload.route) {
          navigate({ to: action.payload.route })
        } else if (action.payload.entityId) {
          state.focusNode(action.payload.entityId)
        }
        break
      case 'create-entity':
        if (action.payload.nodeType) {
          state.showEntityForm(action.payload.nodeType as Parameters<typeof state.showEntityForm>[0])
        }
        break
      case 'edit-entity':
        if (action.payload.entityId) {
          state.focusNode(action.payload.entityId)
        }
        break
      default:
        break
    }
  }

  return (
    <button
      type="button"
      data-testid="action-button"
      onClick={handleClick}
      className="rounded border border-primary/30 bg-primary/5 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
    >
      {action.label}
    </button>
  )
}
