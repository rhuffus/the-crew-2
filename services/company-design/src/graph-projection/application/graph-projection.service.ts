import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common'
import type {
  VisualGraphDto,
  VisualGraphDiffDto,
  VisualNodeDto,
  VisualEdgeDto,
  ReleaseSnapshotDto,
  ZoomLevel,
  LayerId,
  BreadcrumbEntry,
  ScopeType,
  ScopeDescriptor,
} from '@the-crew/shared-types'
import { SCOPE_REGISTRY } from '@the-crew/shared-types'
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
    levelOrScopeType: ZoomLevel | ScopeType = 'L1',
    entityId: string | null = null,
    requestedLayers: LayerId[] | null = null,
  ): Promise<VisualGraphDto> {
    const { scopeType, level } = this.resolveScopeType(levelOrScopeType)
    const scopeDef = SCOPE_REGISTRY[scopeType]

    const snapshot = await this.snapshotCollector.collect(projectId)
    const issues = this.validationEngine.validate(snapshot)

    const allNodes = mapNodes(snapshot, projectId)
    const allEdges = extractEdges(snapshot, projectId)

    const scope: ScopeDescriptor = { scopeType, entityId, zoomLevel: level }
    const legacyScope = { level, entityId, entityType: scopeDef.rootNodeType }
    const activeLayers = requestedLayers ?? scopeDef.defaultLayers

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
      scopeType,
      scope: legacyScope,
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
    levelOrScopeType: ZoomLevel | ScopeType = 'L1',
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

    const { scopeType, level } = this.resolveScopeType(levelOrScopeType)
    const scopeDef = SCOPE_REGISTRY[scopeType]

    const baseSnapshot = baseRelease.snapshot!
    const compareSnapshot = compareRelease.snapshot!

    const legacyScope = { level, entityId, entityType: scopeDef.rootNodeType }
    const activeLayers = requestedLayers ?? scopeDef.defaultLayers

    const baseProjected = this.projectFromSnapshot(baseSnapshot, projectId, scopeType, entityId, activeLayers)
    const compareProjected = this.projectFromSnapshot(compareSnapshot, projectId, scopeType, entityId, activeLayers)

    const breadcrumb = compareProjected.breadcrumb.length > 0
      ? compareProjected.breadcrumb
      : baseProjected.breadcrumb

    return diffVisualGraphs(
      { nodes: baseProjected.nodes, edges: baseProjected.edges },
      { nodes: compareProjected.nodes, edges: compareProjected.edges },
      baseReleaseId,
      compareReleaseId,
      legacyScope,
      level,
      activeLayers,
      breadcrumb,
      projectId,
      scopeType,
    )
  }

  private projectFromSnapshot(
    snapshot: ReleaseSnapshotDto,
    projectId: string,
    scopeType: ScopeType,
    entityId: string | null,
    activeLayers: LayerId[],
  ): { nodes: VisualNodeDto[]; edges: VisualEdgeDto[]; breadcrumb: BreadcrumbEntry[] } {
    const level = SCOPE_REGISTRY[scopeType].zoomLevel
    const allNodes = mapNodes(snapshot, projectId)
    const allEdges = extractEdges(snapshot, projectId)

    const scope: ScopeDescriptor = { scopeType, entityId, zoomLevel: level }

    const { nodes: scopedNodes, edges: scopedEdges } = filterByScope(
      allNodes,
      allEdges,
      scope,
      activeLayers,
      snapshot,
    )

    const nodeIdSet = new Set(scopedNodes.map((n) => n.id))
    const cleanEdges = scopedEdges.filter(
      (e) => nodeIdSet.has(e.sourceId) && nodeIdSet.has(e.targetId),
    )

    const breadcrumb = buildBreadcrumb(scope, snapshot, projectId)

    return { nodes: scopedNodes, edges: cleanEdges, breadcrumb }
  }

  /** Legacy API mapping: level → scope type (backend contract, pre-v3) */
  private static readonly LEGACY_ZOOM_TO_SCOPE: Record<string, ScopeType> = {
    L1: 'company',
    L2: 'department',
    L3: 'workflow',
    L4: 'workflow-stage',
  }

  private resolveScopeType(input: ZoomLevel | ScopeType): { scopeType: ScopeType; level: ZoomLevel } {
    // Check if input is a ScopeType (exists in SCOPE_REGISTRY)
    if (input in SCOPE_REGISTRY) {
      const scopeType = input as ScopeType
      return { scopeType, level: SCOPE_REGISTRY[scopeType].zoomLevel }
    }
    // Otherwise treat as ZoomLevel (backward compat with legacy mapping)
    const level = input as ZoomLevel
    const scopeType = GraphProjectionService.LEGACY_ZOOM_TO_SCOPE[level] ?? 'company'
    return { scopeType, level }
  }
}
