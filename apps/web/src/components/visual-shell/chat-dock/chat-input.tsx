import { useState, useRef, type KeyboardEvent } from 'react'
import { Send } from 'lucide-react'
import type { ProjectDocumentDto } from '@the-crew/shared-types'
import { DocumentMentionPopover } from './document-mention-popover'

interface ChatInputProps {
  onSend: (content: string) => void
  disabled?: boolean
  isPending?: boolean
  projectId?: string
}

export function ChatInput({ onSend, disabled, isPending, projectId }: ChatInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled || isPending) return
    onSend(trimmed)
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = () => {
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = `${Math.min(el.scrollHeight, 80)}px`
    }
  }

  const handleDocMention = (doc: ProjectDocumentDto) => {
    const mention = `@doc:${doc.slug}`
    const el = textareaRef.current
    if (el) {
      const start = el.selectionStart
      const before = value.slice(0, start)
      const after = value.slice(el.selectionEnd)
      const space = before.length > 0 && !before.endsWith(' ') ? ' ' : ''
      const newValue = `${before}${space}${mention} ${after}`
      setValue(newValue)
      // Move cursor after the mention
      const cursorPos = before.length + space.length + mention.length + 1
      requestAnimationFrame(() => {
        el.focus()
        el.setSelectionRange(cursorPos, cursorPos)
      })
    } else {
      setValue((prev) => (prev ? `${prev} ${mention} ` : `${mention} `))
    }
  }

  return (
    <div data-testid="chat-input" className="flex items-end gap-2 border-t border-border p-2">
      {projectId && (
        <DocumentMentionPopover projectId={projectId} onSelect={handleDocMention} />
      )}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        placeholder="Type a message..."
        disabled={disabled}
        rows={1}
        className="flex-1 resize-none rounded-md border border-border bg-background px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
      />
      <button
        type="button"
        onClick={handleSend}
        disabled={disabled || isPending || !value.trim()}
        className="rounded-md bg-primary p-1.5 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        aria-label="Send message"
      >
        <Send className="h-4 w-4" />
      </button>
    </div>
  )
}
