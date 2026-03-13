import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/projects/$projectSlug/admin/overview')({
  component: OverviewPage,
})

function OverviewPage() {
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900">Overview</h3>
      <p className="mt-1 text-sm text-gray-600">Company model overview will appear here.</p>
    </div>
  )
}
