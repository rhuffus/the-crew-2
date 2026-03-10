import { Link, useMatches, useParams } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function Header() {
  const breadcrumbs = useBreadcrumbs()
  const params = useParams({ strict: false })
  const projectId = 'projectId' in params ? (params.projectId as string) : undefined

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm">
        {breadcrumbs.map((crumb, i) => (
          <span key={`${i}-${crumb.path}`} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
            {i < breadcrumbs.length - 1 ? (
              <Link to={crumb.path} className="text-muted-foreground hover:text-foreground">
                {crumb.label}
              </Link>
            ) : (
              <span className="font-medium text-foreground">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>
      {projectId && <Badge variant="warning">Draft</Badge>}
    </header>
  )
}

interface Breadcrumb {
  label: string
  path: string
}

function useBreadcrumbs(): Breadcrumb[] {
  const matches = useMatches()
  const crumbs: Breadcrumb[] = []

  for (const match of matches) {
    const path = match.pathname

    if (path === '/') {
      crumbs.push({ label: 'Platform', path: '/' })
    } else if (path.match(/^\/projects\/[^/]+$/)) {
      const projectId = path.split('/')[2]
      if (projectId) {
        crumbs.push({ label: projectId, path })
      }
    } else if (path.match(/^\/projects\/[^/]+\/.+$/)) {
      const segment = path.split('/').pop()
      if (segment) {
        const label = segment
          .split('-')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ')
        crumbs.push({ label, path })
      }
    }
  }

  return crumbs
}
