import { useBootstrapStatus } from '@/hooks/use-bootstrap'
import type { MaturityPhase } from '@the-crew/shared-types'

const PHASE_COLORS: Record<MaturityPhase, string> = {
  seed: 'bg-amber-100 text-amber-800',
  formation: 'bg-blue-100 text-blue-800',
  structured: 'bg-indigo-100 text-indigo-800',
  operating: 'bg-green-100 text-green-800',
  scaling: 'bg-purple-100 text-purple-800',
  optimizing: 'bg-emerald-100 text-emerald-800',
}

const PHASE_LABELS: Record<MaturityPhase, string> = {
  seed: 'Seed',
  formation: 'Formation',
  structured: 'Structured',
  operating: 'Operating',
  scaling: 'Scaling',
  optimizing: 'Optimizing',
}

export function BootstrapStatusBadge({ projectId }: { projectId: string }) {
  const { data: status } = useBootstrapStatus(projectId)

  if (!status?.bootstrapped || !status.maturityPhase) return null

  const phase = status.maturityPhase as MaturityPhase
  const colorClass = PHASE_COLORS[phase] ?? 'bg-gray-100 text-gray-800'
  const label = PHASE_LABELS[phase] ?? phase

  return (
    <span
      data-testid="bootstrap-status-badge"
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colorClass}`}
    >
      {label}
    </span>
  )
}
