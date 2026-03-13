import { describe, it, expect } from 'vitest'
import type { BreadcrumbEntry } from '@the-crew/shared-types'
import { breadcrumbToRoute, zoomLevelLabel } from '@/lib/breadcrumb-utils'

describe('breadcrumbToRoute', () => {
  const projectSlug = 'proj-1'

  it('should return org route for L1 entry', () => {
    const entry: BreadcrumbEntry = { label: 'Organization', nodeType: 'company', entityId: 'comp-1', zoomLevel: 'L1' }
    expect(breadcrumbToRoute(entry, projectSlug)).toBe('/projects/proj-1/org')
  })

  it('should return department route for L2 entry', () => {
    const entry: BreadcrumbEntry = { label: 'Engineering', nodeType: 'department', entityId: 'dept-1', zoomLevel: 'L2' }
    expect(breadcrumbToRoute(entry, projectSlug)).toBe('/projects/proj-1/departments/dept-1')
  })

  it('should return workflow route for L3 entry', () => {
    const entry: BreadcrumbEntry = { label: 'CI/CD', nodeType: 'workflow', entityId: 'wf-1', zoomLevel: 'L3' }
    expect(breadcrumbToRoute(entry, projectSlug)).toBe('/projects/proj-1/workflows/wf-1')
  })

  it('should default to org route for unknown zoom level', () => {
    const entry = { label: 'Unknown', nodeType: 'company', entityId: 'x', zoomLevel: 'L4' } as unknown as BreadcrumbEntry
    expect(breadcrumbToRoute(entry, projectSlug)).toBe('/projects/proj-1/org')
  })

  it('should use the entry entityId, not projectSlug', () => {
    const entry: BreadcrumbEntry = { label: 'Finance', nodeType: 'department', entityId: 'dept-finance', zoomLevel: 'L2' }
    expect(breadcrumbToRoute(entry, 'other-proj')).toBe('/projects/other-proj/departments/dept-finance')
  })
})

describe('zoomLevelLabel', () => {
  it('should return L1 for L1', () => {
    expect(zoomLevelLabel('L1')).toBe('L1')
  })

  it('should return L2 for L2', () => {
    expect(zoomLevelLabel('L2')).toBe('L2')
  })

  it('should return L3 for L3', () => {
    expect(zoomLevelLabel('L3')).toBe('L3')
  })
})
