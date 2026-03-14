import type { ReactNode } from 'react'
import { FileText } from 'lucide-react'
import { useProjectDocuments } from '@/hooks/use-project-documents'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'

interface DocumentLinkProps {
  slug: string
  projectId: string
}

export function DocumentLink({ slug, projectId }: DocumentLinkProps) {
  const { data: docs } = useProjectDocuments(projectId)
  const openDocumentView = useVisualWorkspaceStore((s) => s.openDocumentView)
  const doc = docs?.find((d) => d.slug === slug)

  if (!doc) {
    return <span className="text-muted-foreground italic text-xs">@doc:{slug}</span>
  }

  return (
    <button
      type="button"
      onClick={() => openDocumentView(doc.id)}
      className="inline-flex items-center gap-0.5 rounded bg-blue-50 px-1 py-0.5 text-xs text-blue-700 hover:bg-blue-100 transition-colors"
      data-testid={`doc-link-${slug}`}
    >
      <FileText className="h-3 w-3" />
      {doc.title}
    </button>
  )
}

const DOC_MENTION_REGEX = /@doc:([a-zA-Z0-9_-]+)/g

export function renderWithDocLinks(text: string, projectId: string): ReactNode[] {
  const parts: ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  const regex = new RegExp(DOC_MENTION_REGEX)
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    const slug = match[1]!
    parts.push(<DocumentLink key={`${slug}-${match.index}`} slug={slug} projectId={projectId} />)
    lastIndex = regex.lastIndex
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts
}
