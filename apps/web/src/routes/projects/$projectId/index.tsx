import { createFileRoute, Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/projects/$projectId/')({
  component: ProjectIndex,
})

function ProjectIndex() {
  const { projectId } = Route.useParams()
  return <Navigate to="/projects/$projectId/org" params={{ projectId }} />
}
