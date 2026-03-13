import type { BreadcrumbEntry, ZoomLevel } from '@the-crew/shared-types'

export function breadcrumbToRoute(entry: BreadcrumbEntry, projectSlug: string): string {
  switch (entry.zoomLevel) {
    case 'L1':
      return `/projects/${projectSlug}/org`
    case 'L2':
      return `/projects/${projectSlug}/departments/${entry.entityId}`
    case 'L3':
      return `/projects/${projectSlug}/workflows/${entry.entityId}`
    default:
      return `/projects/${projectSlug}/org`
  }
}

export function zoomLevelLabel(level: ZoomLevel): string {
  return level
}
