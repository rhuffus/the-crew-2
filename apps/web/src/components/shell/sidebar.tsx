import { Link, useParams } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { platformNavItems, projectNavSections, type NavItem } from '@/lib/navigation'

export function Sidebar() {
  const params = useParams({ strict: false })
  const projectId = 'projectId' in params ? (params.projectId as string) : undefined

  return (
    <aside data-testid="sidebar" className="flex w-60 flex-col border-r border-border bg-card">
      <div className="flex h-14 items-center border-b border-border px-4">
        <Link to="/" className="text-lg font-semibold text-foreground">
          TheCrew
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {projectId ? <ProjectNav projectId={projectId} /> : <PlatformNav />}
      </nav>
    </aside>
  )
}

function PlatformNav() {
  return (
    <ul className="space-y-1">
      {platformNavItems.map((item) => (
        <NavLink key={item.label} item={item} />
      ))}
    </ul>
  )
}

function ProjectNav({ projectId }: { projectId: string }) {
  return (
    <div className="space-y-6">
      <Link
        to="/"
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-3 w-3" />
        All projects
      </Link>
      {projectNavSections.map((section) => (
        <div key={section.title}>
          <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {section.title}
          </h3>
          <ul className="space-y-1">
            {section.items.map((item) => (
              <NavLink key={item.label} item={item} params={{ projectId }} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

function NavLink({
  item,
  params,
}: {
  item: NavItem
  params?: Record<string, string>
}) {
  const Icon = item.icon
  return (
    <li>
      <Link
        to={item.to}
        params={params}
        className={cn(
          'flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground',
          'hover:bg-accent hover:text-accent-foreground',
        )}
        activeProps={{
          className: cn(
            'flex items-center gap-2 rounded-md px-3 py-2 text-sm',
            'bg-accent font-medium text-accent-foreground',
          ),
        }}
      >
        <Icon className="h-4 w-4" />
        {item.label}
      </Link>
    </li>
  )
}
