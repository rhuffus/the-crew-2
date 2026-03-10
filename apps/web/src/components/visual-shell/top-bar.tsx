import { Link, useParams } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import type { BreadcrumbEntry } from '@the-crew/shared-types'
import { Badge } from '@/components/ui/badge'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'
import { breadcrumbToRoute } from '@/lib/breadcrumb-utils'

export function TopBar() {
  const params = useParams({ strict: false })
  const projectId = 'projectId' in params ? (params.projectId as string) : ''
  const { breadcrumb, zoomLevel } = useVisualWorkspaceStore()

  return (
    <header
      data-testid="visual-topbar"
      className="flex h-12 items-center justify-between border-b border-border bg-card px-4"
    >
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm">
        <Link to="/" className="font-semibold text-foreground hover:text-primary">
          TheCrew
        </Link>
        {projectId && (
          <span className="flex items-center gap-1">
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
            <Link
              to="/projects/$projectId/org"
              params={{ projectId }}
              className={breadcrumb.length > 0 ? 'text-muted-foreground hover:text-foreground' : 'font-medium text-foreground'}
            >
              {projectId}
            </Link>
          </span>
        )}
        {breadcrumb.map((entry: BreadcrumbEntry, i: number) => {
          const isLast = i === breadcrumb.length - 1
          const route = breadcrumbToRoute(entry, projectId)
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
        <Badge variant="warning">Draft</Badge>
        <div className="flex rounded-md border border-border text-xs">
          <span className="bg-primary px-2 py-1 font-medium text-primary-foreground rounded-l-md">
            Visual
          </span>
          <Link
            to="/projects/$projectId/admin"
            params={{ projectId }}
            className="px-2 py-1 text-muted-foreground hover:text-foreground rounded-r-md"
          >
            Admin
          </Link>
        </div>
      </div>
    </header>
  )
}
