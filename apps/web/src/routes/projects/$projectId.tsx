import { createFileRoute, Outlet } from '@tanstack/react-router'
import { PermissionProvider } from '@/providers/permission-provider'

export const Route = createFileRoute('/projects/$projectId')({
  component: ProjectLayout,
})

function ProjectLayout() {
  const { projectId } = Route.useParams()
  return (
    <PermissionProvider projectId={projectId}>
      <Outlet />
    </PermissionProvider>
  )
}
