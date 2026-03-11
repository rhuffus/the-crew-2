import 'reflect-metadata'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { VisualGraphController } from './visual-graph.controller'
import type { VisualGraphDto } from '@the-crew/shared-types'

describe('VisualGraphController (gateway)', () => {
  let controller: VisualGraphController
  let mockClient: { getVisualGraph: ReturnType<typeof vi.fn> }

  const mockGraph: VisualGraphDto = {
    projectId: 'p1',
    scopeType: 'company',
    scope: { level: 'L1', entityId: null, entityType: null },
    zoomLevel: 'L1',
    nodes: [],
    edges: [],
    activeLayers: ['organization'],
    breadcrumb: [{ label: 'Co', nodeType: 'company', entityId: 'p1', zoomLevel: 'L1' }],
  }

  beforeEach(() => {
    mockClient = { getVisualGraph: vi.fn().mockResolvedValue(mockGraph) }
    controller = new VisualGraphController(mockClient as unknown as InstanceType<typeof import('./company-design.client').CompanyDesignClient>)
  })

  it('should proxy to companyDesignClient.getVisualGraph with scope', async () => {
    const result = await controller.getVisualGraph('p1', 'workflow', 'L3', 'wf1', 'workflows')

    expect(mockClient.getVisualGraph).toHaveBeenCalledWith('p1', 'workflow', 'L3', 'wf1', 'workflows')
    expect(result).toBe(mockGraph)
  })

  it('should pass undefined params when not provided', async () => {
    const result = await controller.getVisualGraph('p1')

    expect(mockClient.getVisualGraph).toHaveBeenCalledWith('p1', undefined, undefined, undefined, undefined)
    expect(result).toBe(mockGraph)
  })
})
