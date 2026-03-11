import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react'
import type { ValidationIssue } from '@the-crew/shared-types'

export interface ValidationTabProps {
  validationIssues: ValidationIssue[]
}

export function ValidationTab({ validationIssues }: ValidationTabProps) {
  const errors = validationIssues.filter((i) => i.severity === 'error')
  const warnings = validationIssues.filter((i) => i.severity === 'warning')

  if (validationIssues.length === 0) {
    return (
      <div data-testid="validation-tab" className="space-y-3">
        <div className="flex items-center gap-2 rounded bg-green-50 p-2 text-green-700">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span className="text-xs font-medium">No validation issues</span>
        </div>
      </div>
    )
  }

  return (
    <div data-testid="validation-tab" className="space-y-3">
      <div className="flex items-center gap-3 text-xs">
        {errors.length > 0 && (
          <span className="flex items-center gap-1 text-red-600">
            <AlertCircle className="h-3 w-3" />
            {errors.length} error{errors.length !== 1 ? 's' : ''}
          </span>
        )}
        {warnings.length > 0 && (
          <span className="flex items-center gap-1 text-yellow-600">
            <AlertTriangle className="h-3 w-3" />
            {warnings.length} warning{warnings.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      <div className="space-y-1">
        {validationIssues.map((issue, idx) => (
          <div
            key={idx}
            data-testid={`validation-issue-${idx}`}
            className={`flex items-start gap-1.5 rounded p-1.5 text-xs ${
              issue.severity === 'error'
                ? 'bg-red-50 text-red-700'
                : 'bg-yellow-50 text-yellow-700'
            }`}
          >
            {issue.severity === 'error' ? (
              <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
            ) : (
              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
            )}
            <span>{issue.message}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
