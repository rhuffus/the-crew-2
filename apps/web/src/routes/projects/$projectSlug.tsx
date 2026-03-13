import { createFileRoute, Outlet } from '@tanstack/react-router'
import { PermissionProvider } from '@/providers/permission-provider'
import { ProjectProvider, useCurrentProject } from '@/providers/project-provider'

export const Route = createFileRoute('/projects/$projectSlug')({
  component: ProjectLayout,
})

function ProjectLayout() {
  const { projectSlug } = Route.useParams()
  return (
    <ProjectProvider slug={projectSlug}>
      <ProjectLayoutInner />
    </ProjectProvider>
  )
}

function ProjectLayoutInner() {
  const { projectId } = useCurrentProject()
  return (
    <PermissionProvider projectId={projectId}>
      <Outlet />
    </PermissionProvider>
  )
}
