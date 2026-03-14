import { useState, useRef, useEffect } from 'react'
import { FileText, ChevronDown } from 'lucide-react'
import type { ProjectDocumentDto } from '@the-crew/shared-types'
import { useProjectDocuments } from '@/hooks/use-project-documents'

interface DocumentMentionPopoverProps {
  projectId: string
  onSelect: (doc: ProjectDocumentDto) => void
}

export function DocumentMentionPopover({ projectId, onSelect }: DocumentMentionPopoverProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { data: docs } = useProjectDocuments(projectId)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  if (!docs || docs.length === 0) return null

  return (
    <div ref={containerRef} className="relative" data-testid="doc-mention-popover">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-0.5 rounded px-1.5 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        title="Mention a document"
        aria-label="Mention a document"
      >
        <FileText className="h-3 w-3" />
        <ChevronDown className="h-2.5 w-2.5" />
      </button>
      {open && (
        <div className="absolute bottom-full left-0 mb-1 w-56 rounded-md border border-border bg-popover p-1 shadow-md z-50" data-testid="doc-mention-list">
          <p className="px-2 py-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Documents
          </p>
          {docs.map((doc) => (
            <button
              key={doc.id}
              type="button"
              onClick={() => { onSelect(doc); setOpen(false) }}
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs hover:bg-accent transition-colors"
              data-testid={`mention-doc-${doc.slug}`}
            >
              <FileText className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="truncate">{doc.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
