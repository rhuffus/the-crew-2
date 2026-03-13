import { createFileRoute } from '@tanstack/react-router'
import { useCompanyModel } from '@/hooks/use-company-model'
import { CompanyModelForm } from '@/components/company-model/company-model-form'
import { useCurrentProject } from '@/providers/project-provider'

export const Route = createFileRoute('/projects/$projectSlug/admin/company-model')({
  component: CompanyModelPage,
})

function CompanyModelPage() {
  const { projectId } = useCurrentProject()
  const { data: model, isLoading, error } = useCompanyModel(projectId)

  return (
    <div>
      <h3 className="mb-4 text-lg font-medium text-foreground">Company Model</h3>
      {isLoading && <p className="text-muted-foreground">Loading...</p>}
      {error && <p className="text-destructive">Failed to load company model.</p>}
      {model && <CompanyModelForm model={model} />}
    </div>
  )
}
