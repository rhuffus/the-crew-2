import { createFileRoute } from '@tanstack/react-router'
import { ShellLayout } from '@/components/shell/shell-layout'
import { useProjects } from '@/hooks/use-projects'
import { ProjectList } from '@/components/projects/project-list'
import { CreateProjectDialog } from '@/components/projects/create-project-dialog'

export const Route = createFileRoute('/')({
  component: PlatformHome,
})

function PlatformHome() {
  const { data: projects, isLoading, error } = useProjects()

  return (
    <ShellLayout>
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-foreground">Projects</h2>
          <CreateProjectDialog />
        </div>
        {isLoading && <p className="text-muted-foreground">Loading projects...</p>}
        {error && <p className="text-destructive">Failed to load projects.</p>}
        {projects && <ProjectList projects={projects} />}
      </div>
    </ShellLayout>
  )
}
