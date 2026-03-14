import { Building2, FileText, Users, UsersRound } from 'lucide-react'
import type { NodeType } from '@the-crew/shared-types'
import { useOrganizationalUnit } from '@/hooks/use-organizational-units'
import { useProjectDocuments } from '@/hooks/use-project-documents'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'

const UO_TYPE_ICONS: Record<string, typeof Building2> = {
  company: Building2,
  department: Users,
  team: UsersRound,
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-yellow-100 text-yellow-800',
  review: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
}

interface UoDetailPanelProps {
  entityId: string
  nodeType: NodeType
  projectId: string
}

export function UoDetailPanel({ entityId, nodeType, projectId }: UoDetailPanelProps) {
  const { data: uo, isLoading } = useOrganizationalUnit(projectId, entityId)
  const showDocs = nodeType === 'company'
  const { data: docs } = useProjectDocuments(showDocs ? projectId : '')
  const openDocumentView = useVisualWorkspaceStore((s) => s.openDocumentView)

  if (isLoading) return <p className="text-xs text-muted-foreground">Loading...</p>
  if (!uo) return <p className="text-xs text-muted-foreground">Not found</p>

  const Icon = UO_TYPE_ICONS[uo.uoType] ?? Building2

  return (
    <div className="space-y-3" data-testid="uo-detail-panel">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-medium capitalize text-muted-foreground">{uo.uoType}</span>
      </div>

      <div>
        <h4 className="text-sm font-semibold">{uo.name}</h4>
        {uo.purpose && <p className="mt-1 text-xs text-muted-foreground">{uo.purpose}</p>}
      </div>

      {uo.mandate && (
        <div>
          <h5 className="text-xs font-medium text-muted-foreground">Mandate</h5>
          <p className="mt-0.5 text-xs">{uo.mandate}</p>
        </div>
      )}

      {uo.functions && uo.functions.length > 0 && (
        <div>
          <h5 className="text-xs font-medium text-muted-foreground">Functions</h5>
          <ul className="mt-0.5 space-y-0.5">
            {uo.functions.map((fn: string, i: number) => (
              <li key={i} className="text-xs">• {fn}</li>
            ))}
          </ul>
        </div>
      )}

      {uo.coordinatorAgentId && (
        <div>
          <h5 className="text-xs font-medium text-muted-foreground">Coordinator</h5>
          <p className="mt-0.5 text-xs font-mono">{uo.coordinatorAgentId}</p>
        </div>
      )}

      <div>
        <h5 className="text-xs font-medium text-muted-foreground">Status</h5>
        <span className="mt-0.5 inline-flex rounded bg-muted px-1.5 py-0.5 text-xs capitalize">{uo.status ?? 'active'}</span>
      </div>

      {showDocs && (
        <div data-testid="foundation-documents-section">
          <h5 className="text-xs font-medium text-muted-foreground">Foundation Documents</h5>
          {docs && docs.length > 0 ? (
            <ul className="mt-1 space-y-1">
              {docs.map((doc) => (
                <li key={doc.id}>
                  <button
                    type="button"
                    onClick={() => openDocumentView(doc.id)}
                    className="flex w-full items-center gap-1.5 group rounded px-1 py-0.5 text-left hover:bg-accent transition-colors"
                    data-testid={`doc-item-${doc.slug}`}
                  >
                    <FileText className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="text-xs truncate flex-1" title={doc.title}>
                      {doc.title}
                    </span>
                    <span className={`shrink-0 rounded px-1 py-0.5 text-[10px] leading-none ${STATUS_COLORS[doc.status] ?? 'bg-muted text-muted-foreground'}`}>
                      {doc.status}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-0.5 text-xs text-muted-foreground italic">No documents yet</p>
          )}
        </div>
      )}
    </div>
  )
}
