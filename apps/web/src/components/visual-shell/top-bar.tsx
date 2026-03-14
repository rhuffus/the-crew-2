import { Link } from '@tanstack/react-router'
import { ArrowLeft, ChevronRight, LayoutGrid, MessageSquare, FileText } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { BreadcrumbEntry } from '@the-crew/shared-types'
import { Badge } from '@/components/ui/badge'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'
import { breadcrumbToRoute } from '@/lib/breadcrumb-utils'
import { useCurrentProject } from '@/providers/project-provider'
import { useProjectDocument } from '@/hooks/use-project-documents'
import { UserMenu } from './user-menu'

function CenterViewIndicator({ projectId }: { projectId: string }) {
  const centerView = useVisualWorkspaceStore((s) => s.centerView)
  const { t } = useTranslation('common')

  const documentId = centerView.type === 'document' ? centerView.documentId : ''
  const { data: documentData } = useProjectDocument(projectId, documentId)

  if (centerView.type === 'canvas') {
    return (
      <span data-testid="center-view-indicator" className="ml-3 flex items-center gap-1.5 border-l border-border pl-3">
        <LayoutGrid className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">{t('centerView.canvas')}</span>
      </span>
    )
  }

  if (centerView.type === 'chat') {
    const label = centerView.chatMode === 'ceo' ? t('centerView.ceoChat') : t('centerView.chat')
    return (
      <span data-testid="center-view-indicator" className="ml-3 flex items-center gap-1.5 border-l border-border pl-3">
        <MessageSquare className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-medium text-foreground">{label}</span>
      </span>
    )
  }

  const title = documentData?.title ?? t('centerView.document')
  return (
    <span data-testid="center-view-indicator" className="ml-3 flex items-center gap-1.5 border-l border-border pl-3">
      <FileText className="h-3.5 w-3.5 text-primary" />
      <span className="text-xs font-medium text-foreground truncate max-w-[200px]">{title}</span>
    </span>
  )
}

export function TopBar() {
  const { projectId, projectSlug, projectName } = useCurrentProject()
  const breadcrumb = useVisualWorkspaceStore((s) => s.breadcrumb)
  const zoomLevel = useVisualWorkspaceStore((s) => s.zoomLevel)
  const centerViewHistory = useVisualWorkspaceStore((s) => s.centerViewHistory)
  const goBackCenterView = useVisualWorkspaceStore((s) => s.goBackCenterView)
  const { t } = useTranslation('common')
  const { t: tEntities } = useTranslation('entities')

  // Filter out L1/company entries — the project name link already covers that level.
  // When at L1 with no deeper entries, show a translated "Company" label instead.
  const visibleBreadcrumb = breadcrumb.filter((e) => e.zoomLevel !== 'L1')
  const showCompanyLevel = visibleBreadcrumb.length === 0

  return (
    <header
      data-testid="visual-topbar"
      className="flex h-12 items-center justify-between border-b border-border bg-card px-4"
    >
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm">
        {centerViewHistory.length > 0 && (
          <button
            data-testid="center-view-back-button"
            onClick={goBackCenterView}
            aria-label={t('back')}
            className="mr-1 flex h-6 w-6 items-center justify-center rounded hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
        <Link to="/" className="font-semibold text-foreground hover:text-primary">
          {t('appName')}
        </Link>
        <span className="flex items-center gap-1">
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
          <Link
            to="/projects/$projectSlug/org"
            params={{ projectSlug }}
            className="text-muted-foreground hover:text-foreground"
          >
            {projectName}
          </Link>
        </span>
        {showCompanyLevel && (
          <span className="flex items-center gap-1">
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
            <span className="font-medium text-foreground">{tEntities('nodeType.company')}</span>
          </span>
        )}
        {visibleBreadcrumb.map((entry: BreadcrumbEntry, i: number) => {
          const isLast = i === visibleBreadcrumb.length - 1
          const route = breadcrumbToRoute(entry, projectSlug)
          return (
            <span key={`${entry.zoomLevel}-${entry.entityId}`} className="flex items-center gap-1">
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
              {isLast ? (
                <span className="font-medium text-foreground">{entry.label}</span>
              ) : (
                <Link to={route} className="text-muted-foreground hover:text-foreground">
                  {entry.label}
                </Link>
              )}
            </span>
          )
        })}
        <Badge variant="outline" className="ml-2 text-[10px] px-1.5 py-0" data-testid="zoom-level-badge">
          {zoomLevel}
        </Badge>
        <CenterViewIndicator projectId={projectId} />
      </nav>
      <div className="flex items-center gap-3">
        <Badge variant="warning">{t('draft')}</Badge>
        <div className="flex rounded-md border border-border text-xs">
          <span className="bg-primary px-2 py-1 font-medium text-primary-foreground rounded-l-md">
            {t('visual')}
          </span>
          <Link
            to="/projects/$projectSlug/admin"
            params={{ projectSlug }}
            className="px-2 py-1 text-muted-foreground hover:text-foreground rounded-r-md"
          >
            {t('admin')}
          </Link>
        </div>
        <UserMenu />
      </div>
    </header>
  )
}
