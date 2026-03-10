import type { ValidationResultDto, ValidationIssue } from '@the-crew/shared-types'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react'

interface ValidationPanelProps {
  result: ValidationResultDto
}

export function ValidationPanel({ result }: ValidationPanelProps) {
  const { issues, summary } = result

  if (issues.length === 0) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6 text-center">
        <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-emerald-600" />
        <p className="font-medium text-emerald-800">All validations passed</p>
        <p className="mt-1 text-sm text-emerald-600">Your company model is consistent and complete.</p>
      </div>
    )
  }

  const grouped = groupByEntity(issues)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        {summary.errors > 0 && (
          <Badge variant="destructive">
            {summary.errors} {summary.errors === 1 ? 'error' : 'errors'}
          </Badge>
        )}
        {summary.warnings > 0 && (
          <Badge variant="warning">
            {summary.warnings} {summary.warnings === 1 ? 'warning' : 'warnings'}
          </Badge>
        )}
      </div>

      {Object.entries(grouped).map(([entity, entityIssues]) => (
        <div key={entity} className="rounded-lg border bg-card">
          <div className="border-b px-4 py-2">
            <h4 className="text-sm font-semibold text-foreground">{entity}</h4>
          </div>
          <ul className="divide-y">
            {entityIssues.map((issue, i) => (
              <li key={i} className="flex items-start gap-3 px-4 py-3">
                {issue.severity === 'error' ? (
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                ) : (
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                )}
                <div className="min-w-0">
                  <p className="text-sm text-foreground">{issue.message}</p>
                  {issue.field && (
                    <p className="mt-0.5 text-xs text-muted-foreground">Field: {issue.field}</p>
                  )}
                </div>
                <Badge
                  variant={issue.severity === 'error' ? 'destructive' : 'warning'}
                  className="ml-auto shrink-0"
                >
                  {issue.severity}
                </Badge>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

function groupByEntity(issues: ValidationIssue[]): Record<string, ValidationIssue[]> {
  const groups: Record<string, ValidationIssue[]> = {}
  for (const issue of issues) {
    const key = issue.entity
    if (!groups[key]) groups[key] = []
    groups[key].push(issue)
  }
  return groups
}
