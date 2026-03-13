import { Link } from '@tanstack/react-router'
import type { ProjectSummary } from '@the-crew/shared-types'
import { Badge } from '@/components/ui/badge'
import { slugify } from '@/lib/slugify'

interface ProjectCardProps {
  project: ProjectSummary
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      to="/projects/$projectSlug"
      params={{ projectSlug: slugify(project.name) }}
      className="block rounded-lg border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <h3 className="font-semibold text-card-foreground">{project.name}</h3>
        <Badge variant={project.status === 'active' ? 'success' : 'secondary'}>
          {project.status}
        </Badge>
      </div>
      {project.description && (
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{project.description}</p>
      )}
      <p className="mt-3 text-xs text-muted-foreground">
        Updated {new Date(project.updatedAt).toLocaleDateString()}
      </p>
    </Link>
  )
}
