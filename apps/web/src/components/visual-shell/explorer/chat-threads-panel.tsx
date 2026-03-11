import { MessageSquare } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { useChatThreads } from '@/hooks/use-chat'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'

interface ChatThreadsPanelProps {
  projectId?: string
}

export function ChatThreadsPanel({ projectId }: ChatThreadsPanelProps) {
  const { data: threads, isLoading } = useChatThreads(projectId ?? '')
  const navigate = useNavigate()
  const { toggleChatDock, chatDockOpen } = useVisualWorkspaceStore()

  if (!projectId) {
    return <div className="p-3 text-xs text-muted-foreground">No project selected</div>
  }

  if (isLoading) {
    return <div className="p-3 text-xs text-muted-foreground">Loading threads...</div>
  }

  const sortedThreads = [...(threads ?? [])].sort((a, b) => {
    if (!a.lastMessageAt && !b.lastMessageAt) return 0
    if (!a.lastMessageAt) return 1
    if (!b.lastMessageAt) return -1
    return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  })

  if (sortedThreads.length === 0) {
    return (
      <div data-testid="chat-threads-empty" className="p-3 text-xs text-muted-foreground">
        No chat threads yet. Open the chat dock to start a conversation.
      </div>
    )
  }

  const handleThreadClick = (thread: (typeof sortedThreads)[0]) => {
    // Navigate to the scope
    if (thread.scopeType === 'company') {
      navigate({ to: '/projects/$projectId/org', params: { projectId } })
    } else if (thread.scopeType === 'department' && thread.entityId) {
      navigate({
        to: '/projects/$projectId/departments/$departmentId',
        params: { projectId, departmentId: thread.entityId },
      })
    } else if (thread.scopeType === 'workflow' && thread.entityId) {
      navigate({
        to: '/projects/$projectId/workflows/$workflowId',
        params: { projectId, workflowId: thread.entityId },
      })
    }
    // Open the chat dock
    if (!chatDockOpen) {
      toggleChatDock()
    }
  }

  const formatTime = (iso: string | null) => {
    if (!iso) return ''
    const d = new Date(iso)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    if (diffMin < 60) return `${diffMin}m ago`
    const diffH = Math.floor(diffMin / 60)
    if (diffH < 24) return `${diffH}h ago`
    const diffD = Math.floor(diffH / 24)
    return `${diffD}d ago`
  }

  return (
    <div data-testid="chat-threads-panel" className="flex flex-col gap-0.5 p-1">
      {sortedThreads.map((thread) => (
        <button
          key={thread.id}
          type="button"
          onClick={() => handleThreadClick(thread)}
          className="flex items-center gap-2 rounded px-2 py-1.5 text-left text-xs hover:bg-accent"
        >
          <MessageSquare className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <div className="flex flex-1 flex-col overflow-hidden">
            <span className="truncate font-medium">{thread.title}</span>
            <span className="text-[10px] text-muted-foreground">
              {thread.messageCount} messages
              {thread.lastMessageAt && ` · ${formatTime(thread.lastMessageAt)}`}
            </span>
          </div>
        </button>
      ))}
    </div>
  )
}
