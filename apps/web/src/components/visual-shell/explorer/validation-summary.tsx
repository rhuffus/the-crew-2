import { AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react'
import type { ValidationIssue, VisualNodeDto } from '@the-crew/shared-types'
import { cn } from '@/lib/utils'
import { useVisualWorkspaceStore } from '@/stores/visual-workspace-store'
import { groupIssuesByVisualNodeId } from '@/lib/validation-mapping'

export interface ValidationSummaryProps {
  errors?: number
  warnings?: number
  projectId?: string
}

interface NodeIssueGroup {
  visualNodeId: string
  label: string
  issues: ValidationIssue[]
  hasError: boolean
}

function buildNodeIssueGroups(
  issues: ValidationIssue[],
  projectId: string,
  graphNodes: VisualNodeDto[],
): NodeIssueGroup[] {
  const issueMap = groupIssuesByVisualNodeId(issues, projectId)
  const nodeMap = new Map(graphNodes.map((n) => [n.id, n]))
  const groups: NodeIssueGroup[] = []

  for (const [visualNodeId, nodeIssues] of issueMap) {
    const node = nodeMap.get(visualNodeId)
    groups.push({
      visualNodeId,
      label: node?.label ?? visualNodeId,
      issues: nodeIssues,
      hasError: nodeIssues.some((i) => i.severity === 'error'),
    })
  }

  // Sort: errors first, then by label
  groups.sort((a, b) => {
    if (a.hasError !== b.hasError) return a.hasError ? -1 : 1
    return a.label.localeCompare(b.label)
  })

  return groups
}

export function ValidationSummary({ errors = 0, warnings = 0, projectId }: ValidationSummaryProps) {
  const validationIssues = useVisualWorkspaceStore((s) => s.validationIssues)
  const graphNodes = useVisualWorkspaceStore((s) => s.graphNodes)
  const showValidationOverlay = useVisualWorkspaceStore((s) => s.showValidationOverlay)

  const hasIssueData = validationIssues.length > 0 && projectId
  const isClean = errors === 0 && warnings === 0

  const nodeGroups = hasIssueData
    ? buildNodeIssueGroups(validationIssues, projectId, graphNodes)
    : []

  const handleNodeClick = (visualNodeId: string) => {
    const state = useVisualWorkspaceStore.getState()
    state.selectNodes([visualNodeId])
    state.focusNode(visualNodeId)
  }

  return (
    <div data-testid="validation-summary" className="p-3">
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Validation
      </h4>
      {isClean ? (
        <div className="flex items-center gap-2 rounded bg-green-50 p-2 text-sm text-green-700">
          <CheckCircle className="h-4 w-4" />
          <span>No issues</span>
        </div>
      ) : (
        <div className="space-y-1">
          {errors > 0 && (
            <div className="flex items-center gap-2 rounded bg-red-50 p-2 text-sm text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span>{errors} error{errors !== 1 ? 's' : ''}</span>
            </div>
          )}
          {warnings > 0 && (
            <div className="flex items-center gap-2 rounded bg-yellow-50 p-2 text-sm text-yellow-700">
              <AlertTriangle className="h-4 w-4" />
              <span>{warnings} warning{warnings !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      )}

      {showValidationOverlay && nodeGroups.length > 0 && (
        <div data-testid="validation-issue-list" className="mt-3 space-y-2">
          {nodeGroups.map((group) => (
            <button
              key={group.visualNodeId}
              type="button"
              data-testid={`validation-node-${group.visualNodeId}`}
              onClick={() => handleNodeClick(group.visualNodeId)}
              className={cn(
                'w-full rounded border p-2 text-left text-xs hover:bg-accent',
                group.hasError ? 'border-red-200 bg-red-50/50' : 'border-yellow-200 bg-yellow-50/50',
              )}
            >
              <div className="flex items-center gap-1.5 font-medium">
                {group.hasError ? (
                  <AlertCircle className="h-3 w-3 shrink-0 text-red-500" />
                ) : (
                  <AlertTriangle className="h-3 w-3 shrink-0 text-yellow-500" />
                )}
                <span className="truncate">{group.label}</span>
                <span className="ml-auto shrink-0 text-[10px] text-muted-foreground">
                  {group.issues.length}
                </span>
              </div>
              <ul className="mt-1 space-y-0.5 pl-4.5">
                {group.issues.map((issue, idx) => (
                  <li
                    key={idx}
                    className={cn(
                      'text-[11px] leading-tight',
                      issue.severity === 'error' ? 'text-red-600' : 'text-yellow-600',
                    )}
                  >
                    {issue.message}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
