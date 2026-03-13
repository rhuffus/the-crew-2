import { Link } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { BreadcrumbEntry } from '@the-crew/shared-types'
import { Badge } from '@/components/ui/badge'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'
import { breadcrumbToRoute } from '@/lib/breadcrumb-utils'
import { useCurrentProject } from '@/providers/project-provider'
import { UserMenu } from './user-menu'

export function TopBar() {
  const { projectSlug, projectName } = useCurrentProject()
  const breadcrumb = useVisualWorkspaceStore((s) => s.breadcrumb)
  const zoomLevel = useVisualWorkspaceStore((s) => s.zoomLevel)
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
