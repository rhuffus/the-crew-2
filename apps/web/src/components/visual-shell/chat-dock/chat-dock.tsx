import { MessageSquare, ChevronUp, ChevronDown } from 'lucide-react'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'

export function ChatDock() {
  const { chatDockOpen, toggleChatDock, currentView, scopeEntityId } = useVisualWorkspaceStore()

  const scopeLabel = currentView === 'org'
    ? 'Company'
    : scopeEntityId ?? currentView

  return (
    <div data-testid="chat-dock" className="border-t border-border bg-card">
      <button
        type="button"
        onClick={toggleChatDock}
        className="flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-accent"
      >
        <div className="flex items-center gap-2 text-muted-foreground">
          <MessageSquare className="h-4 w-4" />
          <span>Chat: {scopeLabel}</span>
        </div>
        {chatDockOpen ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {chatDockOpen && (
        <div className="h-40 border-t border-border p-3">
          <div className="flex h-full flex-col">
            <div className="flex-1 overflow-y-auto text-xs text-muted-foreground">
              <p>Chat messages will appear here.</p>
            </div>
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                disabled
                className="flex-1 rounded-md border border-border bg-background px-2 py-1 text-sm"
              />
              <button
                type="button"
                disabled
                className="rounded-md bg-primary px-3 py-1 text-xs text-primary-foreground opacity-50"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
