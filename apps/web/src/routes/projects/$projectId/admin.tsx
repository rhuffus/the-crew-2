import { createFileRoute, Outlet } from '@tanstack/react-router'
import { ShellLayout } from '@/components/shell/shell-layout'

export const Route = createFileRoute('/projects/$projectId/admin')({
  component: AdminLayout,
})

function AdminLayout() {
  return (
    <ShellLayout>
      <div>
        <div className="mb-6 border-b border-border pb-4">
          <h2 className="text-2xl font-semibold text-foreground">Admin</h2>
        </div>
        <Outlet />
      </div>
    </ShellLayout>
  )
}
