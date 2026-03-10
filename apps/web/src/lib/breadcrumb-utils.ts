import type { BreadcrumbEntry, ZoomLevel } from '@the-crew/shared-types'

export function breadcrumbToRoute(entry: BreadcrumbEntry, projectId: string): string {
  switch (entry.zoomLevel) {
    case 'L1':
      return `/projects/${projectId}/org`
    case 'L2':
      return `/projects/${projectId}/departments/${entry.entityId}`
    case 'L3':
      return `/projects/${projectId}/workflows/${entry.entityId}`
    default:
      return `/projects/${projectId}/org`
  }
}

export function zoomLevelLabel(level: ZoomLevel): string {
  return level
}
