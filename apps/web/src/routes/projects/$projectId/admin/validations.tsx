import { createFileRoute } from '@tanstack/react-router'
import { useValidations } from '@/hooks/use-validations'
import { ValidationPanel } from '@/components/validations/validation-panel'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

export const Route = createFileRoute('/projects/$projectId/admin/validations')({
  component: ValidationsPage,
})

function ValidationsPage() {
  const { projectId } = Route.useParams()
  const { data, isLoading, error, refetch, isFetching } = useValidations(projectId)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-medium text-foreground">Validations</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={`mr-1.5 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Re-validate
        </Button>
      </div>

      {isLoading && <p className="text-muted-foreground">Running validations...</p>}
      {error && <p className="text-destructive">Failed to run validations.</p>}
      {data && <ValidationPanel result={data} />}
    </div>
  )
}
