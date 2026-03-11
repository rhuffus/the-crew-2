import type {
  GraphScope,
  ReleaseSnapshotDto,
  BreadcrumbEntry,
  ScopeType,
  ScopeDescriptor,
} from '@the-crew/shared-types'
import { scopeTypeFromZoomLevel } from '@the-crew/shared-types'

type ParentResolverFn = (
  entityId: string,
  snapshot: ReleaseSnapshotDto,
) => BreadcrumbEntry[]

const PARENT_RESOLVERS: Record<ScopeType, ParentResolverFn> = {
  company: () => [],
  department: (entityId, snapshot) => buildDeptChain(entityId, snapshot),
  workflow: (entityId, snapshot) => {
    const wf = snapshot.workflows.find((w) => w.id === entityId)
    const chain: BreadcrumbEntry[] = []
    if (wf?.ownerDepartmentId) chain.push(...buildDeptChain(wf.ownerDepartmentId, snapshot))
    if (wf) chain.push({ label: wf.name, nodeType: 'workflow', entityId: wf.id, zoomLevel: 'L3' })
    return chain
  },
  'workflow-stage': (entityId, snapshot) => {
    const stage = snapshot.workflows
      .flatMap((w) => (w.stages ?? []).map((s, i) => ({ ...s, id: `${w.id}:stage:${i}`, workflowId: w.id })))
      .find((s) => s.id === entityId)
    if (!stage) {
      // Try matching by name if id format differs
      for (const w of snapshot.workflows) {
        const stageIdx = (w.stages ?? []).findIndex((s) => `${w.id}:stage:${(w.stages ?? []).indexOf(s)}` === entityId)
        if (stageIdx >= 0) {
          const s = w.stages![stageIdx]!
          const parentChain = PARENT_RESOLVERS.workflow(w.id, snapshot)
          return [...parentChain, { label: s.name, nodeType: 'workflow-stage' as const, entityId, zoomLevel: 'L4' as const }]
        }
      }
      return []
    }
    const parentChain = PARENT_RESOLVERS.workflow(stage.workflowId, snapshot)
    return [...parentChain, { label: stage.name, nodeType: 'workflow-stage', entityId, zoomLevel: 'L4' }]
  },
}

/**
 * Build breadcrumb chain for a scope.
 * Accepts ScopeDescriptor (new) or GraphScope (legacy).
 */
export function buildBreadcrumb(
  scope: ScopeDescriptor | GraphScope,
  snapshot: ReleaseSnapshotDto,
  projectId: string,
): BreadcrumbEntry[] {
  const companyLabel = snapshot.companyModel?.purpose ?? 'Company'
  const crumbs: BreadcrumbEntry[] = [
    { label: companyLabel, nodeType: 'company', entityId: projectId, zoomLevel: 'L1' },
  ]

  const scopeType: ScopeType = 'scopeType' in scope
    ? scope.scopeType
    : scopeTypeFromZoomLevel(scope.level)

  if (scopeType === 'company') return crumbs

  const entityId = 'scopeType' in scope ? scope.entityId : scope.entityId
  if (!entityId) return crumbs

  const resolver = PARENT_RESOLVERS[scopeType]
  if (resolver) {
    crumbs.push(...resolver(entityId, snapshot))
  }

  return crumbs
}

function buildDeptChain(
  deptId: string,
  snapshot: ReleaseSnapshotDto,
): BreadcrumbEntry[] {
  const chain: BreadcrumbEntry[] = []
  const deptMap = new Map(snapshot.departments.map((d) => [d.id, d]))

  let current = deptMap.get(deptId)
  while (current) {
    chain.unshift({
      label: current.name,
      nodeType: 'department',
      entityId: current.id,
      zoomLevel: 'L2',
    })
    current = current.parentId ? deptMap.get(current.parentId) : undefined
  }

  return chain
}
