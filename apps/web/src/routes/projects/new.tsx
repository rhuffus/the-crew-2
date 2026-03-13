import { createFileRoute } from '@tanstack/react-router'
import { ShellLayout } from '@/components/shell/shell-layout'
import { CreateProjectForm } from '@/components/projects/create-project-dialog'

export const Route = createFileRoute('/projects/new')({
  component: NewProjectPage,
})

function NewProjectPage() {
  return (
    <ShellLayout>
      <div className="mx-auto max-w-lg">
        <CreateProjectForm />
      </div>
    </ShellLayout>
  )
}
