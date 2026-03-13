import type { AutonomyLimitsProps } from '../../constitution/domain/company-constitution'
import type { OrganizationalUnit } from '../../organizational-units/domain/organizational-unit'
import type { MaturityPhase } from './phase-capabilities'

export type HealthStatus = 'ok' | 'warning' | 'violation'

export interface OrgHealthMetric {
  name: string
  value: number
  threshold: number | null
  status: HealthStatus
  description: string
}

export type OverallHealth = 'healthy' | 'attention-needed' | 'at-risk'

export interface OrgHealthReport {
  projectId: string
  generatedAt: Date
  phase: MaturityPhase
  metrics: OrgHealthMetric[]
  recommendations: string[]
  overallHealth: OverallHealth
}

export function computeDepthMetric(
  units: OrganizationalUnit[],
  limits: AutonomyLimitsProps,
): OrgHealthMetric {
  let maxDepth = 0
  const parentMap = new Map<string | null, OrganizationalUnit[]>()
  for (const u of units) {
    if (u.status === 'retired') continue
    const key = u.parentUoId
    if (!parentMap.has(key)) parentMap.set(key, [])
    parentMap.get(key)!.push(u)
  }

  function walk(parentId: string | null, depth: number): void {
    const children = parentMap.get(parentId) ?? []
    if (depth > maxDepth) maxDepth = depth
    for (const child of children) {
      walk(child.id, depth + 1)
    }
  }
  walk(null, 0)

  return {
    name: 'depth',
    value: maxDepth,
    threshold: limits.maxDepth,
    status: maxDepth > limits.maxDepth ? 'violation' : 'ok',
    description: `Max nesting depth: ${maxDepth} (limit: ${limits.maxDepth})`,
  }
}

export function computeFanOutMetric(
  units: OrganizationalUnit[],
  limits: AutonomyLimitsProps,
): OrgHealthMetric {
  const childCount = new Map<string, number>()
  for (const u of units) {
    if (u.status === 'retired' || !u.parentUoId) continue
    childCount.set(u.parentUoId, (childCount.get(u.parentUoId) ?? 0) + 1)
  }
  const maxFanOut = childCount.size > 0 ? Math.max(...childCount.values()) : 0

  return {
    name: 'max-fanout',
    value: maxFanOut,
    threshold: limits.maxFanOut,
    status: maxFanOut > limits.maxFanOut ? 'violation' : 'ok',
    description: `Max children per UO: ${maxFanOut} (limit: ${limits.maxFanOut})`,
  }
}

export function computePendingProposalsMetric(pendingCount: number): OrgHealthMetric {
  return {
    name: 'pending-proposals',
    value: pendingCount,
    threshold: 5,
    status: pendingCount > 5 ? 'warning' : 'ok',
    description: `Pending proposals: ${pendingCount}`,
  }
}

export function computeOverallHealth(metrics: OrgHealthMetric[]): OverallHealth {
  if (metrics.some((m) => m.status === 'violation')) return 'at-risk'
  if (metrics.some((m) => m.status === 'warning')) return 'attention-needed'
  return 'healthy'
}

export function buildHealthReport(params: {
  projectId: string
  phase: MaturityPhase
  units: OrganizationalUnit[]
  limits: AutonomyLimitsProps
  pendingProposalCount: number
}): OrgHealthReport {
  const { projectId, phase, units, limits, pendingProposalCount } = params

  const metrics: OrgHealthMetric[] = [
    computeDepthMetric(units, limits),
    computeFanOutMetric(units, limits),
    computePendingProposalsMetric(pendingProposalCount),
  ]

  const recommendations: string[] = []
  for (const m of metrics) {
    if (m.status === 'violation') {
      recommendations.push(`${m.name}: ${m.description} — requires attention`)
    }
  }

  return {
    projectId,
    generatedAt: new Date(),
    phase,
    metrics,
    recommendations,
    overallHealth: computeOverallHealth(metrics),
  }
}
