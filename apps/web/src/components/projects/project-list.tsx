import type { ProjectSummary } from '@the-crew/shared-types'
import { ProjectCard } from './project-card'

interface ProjectListProps {
  projects: ProjectSummary[]
}

export function ProjectList({ projects }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">No projects yet. Create your first project to get started.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}
