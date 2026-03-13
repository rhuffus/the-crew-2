import { createFileRoute, Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/projects/$projectSlug/')({
  component: ProjectIndex,
})

function ProjectIndex() {
  const { projectSlug } = Route.useParams()
  return <Navigate to="/projects/$projectSlug/org" params={{ projectSlug }} />
}
