import { FileText, Clock, User, Tag, Hash, CheckCircle2, CircleDot, FileEdit } from 'lucide-react'
import type { DocumentStatus, UpdateProjectDocumentDto } from '@the-crew/shared-types'
import { Button } from '@/components/ui/button'
import { useProjectDocument, useUpdateProjectDocument } from '@/hooks/use-project-documents'

const STATUS_COLORS: Record<DocumentStatus, string> = {
  draft: 'bg-yellow-100 text-yellow-800',
  review: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
}

const STATUS_ICONS: Record<DocumentStatus, typeof CircleDot> = {
  draft: FileEdit,
  review: CircleDot,
  approved: CheckCircle2,
}

const STATUS_TRANSITIONS: Record<DocumentStatus, { label: string; next: DocumentStatus }[]> = {
  draft: [{ label: 'Send to Review', next: 'review' }],
  review: [
    { label: 'Approve', next: 'approved' },
    { label: 'Back to Draft', next: 'draft' },
  ],
  approved: [{ label: 'Reopen as Draft', next: 'draft' }],
}

interface DocumentInspectorPanelProps {
  projectId: string
  documentId: string
}

export function DocumentInspectorPanel({ projectId, documentId }: DocumentInspectorPanelProps) {
  const { data: doc, isLoading } = useProjectDocument(projectId, documentId)
  const updateMutation = useUpdateProjectDocument(projectId)

  if (isLoading) {
    return (
      <div data-testid="document-inspector-panel" className="p-3">
        <p className="text-xs text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!doc) {
    return (
      <div data-testid="document-inspector-panel" className="p-3">
        <p className="text-xs text-muted-foreground">Document not found</p>
      </div>
    )
  }

  const transitions = STATUS_TRANSITIONS[doc.status] ?? []
  const StatusIcon = STATUS_ICONS[doc.status] ?? CircleDot

  function handleStatusChange(nextStatus: DocumentStatus) {
    const dto: UpdateProjectDocumentDto = {
      status: nextStatus,
      lastUpdatedBy: 'user',
    }
    updateMutation.mutate({ id: documentId, dto })
  }

  return (
    <div data-testid="document-inspector-panel" className="space-y-4 p-3">
      {/* Document Header */}
      <div className="flex items-start gap-2">
        <FileText className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold truncate">{doc.title}</h4>
          <div className="flex items-center gap-1 mt-0.5">
            <Hash className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground font-mono">{doc.slug}</span>
          </div>
        </div>
      </div>

      {/* Status */}
      <div>
        <h5 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Status</h5>
        <div className="flex items-center gap-2">
          <StatusIcon className="h-3.5 w-3.5 text-muted-foreground" />
          <span
            className={`rounded px-1.5 py-0.5 text-xs capitalize ${STATUS_COLORS[doc.status]}`}
            data-testid="status-badge"
          >
            {doc.status}
          </span>
        </div>
      </div>

      {/* Source */}
      <div>
        <h5 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Source</h5>
        <div className="flex items-center gap-2">
          <Tag className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs capitalize" data-testid="source-type">{doc.sourceType}</span>
        </div>
      </div>

      {/* History */}
      <div>
        <h5 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">History</h5>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs">
            <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">Created</span>
            <span className="ml-auto text-foreground" data-testid="created-at">
              {formatDate(doc.createdAt)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">Updated</span>
            <span className="ml-auto text-foreground" data-testid="updated-at">
              {formatDate(doc.updatedAt)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <User className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">By</span>
            <span className="ml-auto text-foreground" data-testid="last-updated-by">
              {doc.lastUpdatedBy}
            </span>
          </div>
        </div>
      </div>

      {/* Linked Entities */}
      {doc.linkedEntityIds.length > 0 && (
        <div>
          <h5 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
            Linked Entities
          </h5>
          <ul className="space-y-0.5">
            {doc.linkedEntityIds.map((entityId) => (
              <li key={entityId} className="text-xs font-mono text-muted-foreground truncate">
                {entityId}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      {transitions.length > 0 && (
        <div>
          <h5 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Actions</h5>
          <div className="flex flex-col gap-1.5">
            {transitions.map(({ label, next }) => (
              <Button
                key={next}
                variant={next === 'approved' ? 'default' : 'outline'}
                size="sm"
                className="w-full justify-start text-xs"
                onClick={() => handleStatusChange(next)}
                disabled={updateMutation.isPending}
                data-testid={`action-${next}`}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}
