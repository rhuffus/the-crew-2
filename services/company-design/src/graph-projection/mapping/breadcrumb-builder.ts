import type {
  GraphScope,
  ReleaseSnapshotDto,
  BreadcrumbEntry,
} from '@the-crew/shared-types'

export function buildBreadcrumb(
  scope: GraphScope,
  snapshot: ReleaseSnapshotDto,
  projectId: string,
): BreadcrumbEntry[] {
  const companyLabel = snapshot.companyModel?.purpose ?? 'Company'
  const crumbs: BreadcrumbEntry[] = [
    { label: companyLabel, nodeType: 'company', entityId: projectId, zoomLevel: 'L1' },
  ]

  if (scope.level === 'L1') return crumbs

  if (scope.level === 'L2' && scope.entityId) {
    const chain = buildDeptChain(scope.entityId, snapshot)
    crumbs.push(...chain)
    return crumbs
  }

  if (scope.level === 'L3' && scope.entityId) {
    const wf = snapshot.workflows.find((w) => w.id === scope.entityId)
    if (wf?.ownerDepartmentId) {
      const chain = buildDeptChain(wf.ownerDepartmentId, snapshot)
      crumbs.push(...chain)
    }
    if (wf) {
      crumbs.push({
        label: wf.name,
        nodeType: 'workflow',
        entityId: wf.id,
        zoomLevel: 'L3',
      })
    }
    return crumbs
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
