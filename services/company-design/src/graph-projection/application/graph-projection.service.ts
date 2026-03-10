import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common'
import type {
  VisualGraphDto,
  VisualGraphDiffDto,
  VisualNodeDto,
  VisualEdgeDto,
  ReleaseSnapshotDto,
  ZoomLevel,
  LayerId,
  NodeType,
  BreadcrumbEntry,
} from '@the-crew/shared-types'
import { DEFAULT_LAYERS_PER_LEVEL } from '@the-crew/shared-types'
import { SnapshotCollector } from '../../releases/application/snapshot-collector'
import { ValidationEngine } from '../../validations/application/validation-engine'
import type { ReleaseRepository } from '../../releases/domain/release-repository'
import { RELEASE_REPOSITORY } from '../../releases/domain/release-repository'
import { mapNodes } from '../mapping/node-mapper'
import { extractEdges } from '../mapping/edge-extractor'
import { filterByScope } from '../mapping/scope-filter'
import { applyValidationOverlay } from '../mapping/validation-overlay'
import { buildBreadcrumb } from '../mapping/breadcrumb-builder'
import { diffVisualGraphs } from '../mapping/visual-diff'

@Injectable()
export class GraphProjectionService {
  constructor(
    private readonly snapshotCollector: SnapshotCollector,
    private readonly validationEngine: ValidationEngine,
    @Inject(RELEASE_REPOSITORY) private readonly releaseRepo: ReleaseRepository,
  ) {}

  async projectGraph(
    projectId: string,
    level: ZoomLevel = 'L1',
    entityId: string | null = null,
    requestedLayers: LayerId[] | null = null,
  ): Promise<VisualGraphDto> {
    const snapshot = await this.snapshotCollector.collect(projectId)
    const issues = this.validationEngine.validate(snapshot)

    const allNodes = mapNodes(snapshot, projectId)
    const allEdges = extractEdges(snapshot, projectId)

    const entityType = this.inferEntityType(level)
    const scope = { level, entityId, entityType }
    const activeLayers = requestedLayers ?? DEFAULT_LAYERS_PER_LEVEL[level]

    const { nodes: scopedNodes, edges: scopedEdges } = filterByScope(
      allNodes,
      allEdges,
      scope,
      activeLayers,
      snapshot,
    )

    const nodesWithValidation = applyValidationOverlay(scopedNodes, issues, projectId)

    // Final orphan edge cleanup
    const nodeIdSet = new Set(nodesWithValidation.map((n) => n.id))
    const cleanEdges = scopedEdges.filter(
      (e) => nodeIdSet.has(e.sourceId) && nodeIdSet.has(e.targetId),
    )

    const breadcrumb = buildBreadcrumb(scope, snapshot, projectId)

    return {
      projectId,
      scope,
      zoomLevel: level,
      nodes: nodesWithValidation,
      edges: cleanEdges,
      activeLayers,
      breadcrumb,
    }
  }

  async projectDiff(
    projectId: string,
    baseReleaseId: string,
    compareReleaseId: string,
    level: ZoomLevel = 'L1',
    entityId: string | null = null,
    requestedLayers: LayerId[] | null = null,
  ): Promise<VisualGraphDiffDto> {
    const [baseRelease, compareRelease] = await Promise.all([
      this.releaseRepo.findById(baseReleaseId),
      this.releaseRepo.findById(compareReleaseId),
    ])

    if (!baseRelease) {
      throw new NotFoundException(`Base release ${baseReleaseId} not found`)
    }
    if (!compareRelease) {
      throw new NotFoundException(`Compare release ${compareReleaseId} not found`)
    }
    if (baseRelease.status !== 'published') {
      throw new BadRequestException(`Base release ${baseReleaseId} is not published`)
    }
    if (compareRelease.status !== 'published') {
      throw new BadRequestException(`Compare release ${compareReleaseId} is not published`)
    }

    const baseSnapshot = baseRelease.snapshot!
    const compareSnapshot = compareRelease.snapshot!

    const entityType = this.inferEntityType(level)
    const scope = { level, entityId, entityType }
    const activeLayers = requestedLayers ?? DEFAULT_LAYERS_PER_LEVEL[level]

    const baseProjected = this.projectFromSnapshot(baseSnapshot, projectId, level, entityId, activeLayers)
    const compareProjected = this.projectFromSnapshot(compareSnapshot, projectId, level, entityId, activeLayers)

    // Use compare breadcrumb if available, fall back to base for removed-entity case
    const breadcrumb = compareProjected.breadcrumb.length > 0
      ? compareProjected.breadcrumb
      : baseProjected.breadcrumb

    return diffVisualGraphs(
      { nodes: baseProjected.nodes, edges: baseProjected.edges },
      { nodes: compareProjected.nodes, edges: compareProjected.edges },
      baseReleaseId,
      compareReleaseId,
      scope,
      level,
      activeLayers,
      breadcrumb,
      projectId,
    )
  }

  private projectFromSnapshot(
    snapshot: ReleaseSnapshotDto,
    projectId: string,
    level: ZoomLevel,
    entityId: string | null,
    activeLayers: LayerId[],
  ): { nodes: VisualNodeDto[]; edges: VisualEdgeDto[]; breadcrumb: BreadcrumbEntry[] } {
    const allNodes = mapNodes(snapshot, projectId)
    const allEdges = extractEdges(snapshot, projectId)

    const entityType = this.inferEntityType(level)
    const scope = { level, entityId, entityType }

    const { nodes: scopedNodes, edges: scopedEdges } = filterByScope(
      allNodes,
      allEdges,
      scope,
      activeLayers,
      snapshot,
    )

    // Orphan edge cleanup (no validation overlay for diff — structural only)
    const nodeIdSet = new Set(scopedNodes.map((n) => n.id))
    const cleanEdges = scopedEdges.filter(
      (e) => nodeIdSet.has(e.sourceId) && nodeIdSet.has(e.targetId),
    )

    const breadcrumb = buildBreadcrumb(scope, snapshot, projectId)

    return { nodes: scopedNodes, edges: cleanEdges, breadcrumb }
  }

  private inferEntityType(level: ZoomLevel): NodeType | null {
    switch (level) {
      case 'L2':
        return 'department'
      case 'L3':
        return 'workflow'
      default:
        return null
    }
  }
}
