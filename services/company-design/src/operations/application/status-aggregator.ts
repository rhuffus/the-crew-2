import type {
  ScopeType,
  ReleaseSnapshotDto,
  WorkflowRunDto,
  StageExecutionDto,
  IncidentDto,
  ContractComplianceDto,
  OperationsStatusDto,
  OperationsSummary,
  EntityOperationStatusDto,
  OperationStatus,
  OperationBadge,
  NodeType,
  ComplianceStatus,
} from '@the-crew/shared-types'
import { visualNodeId, workflowStageId } from '../../graph-projection/mapping/visual-id'

// --- Status escalation: failed > blocked > running > completed > idle ---

const STATUS_PRIORITY: Record<OperationStatus, number> = {
  failed: 4,
  blocked: 3,
  running: 2,
  completed: 1,
  idle: 0,
}

function escalate(current: OperationStatus, candidate: OperationStatus): OperationStatus {
  return STATUS_PRIORITY[candidate] > STATUS_PRIORITY[current] ? candidate : current
}

// --- Badge builders ---

function buildBadges(
  opStatus: OperationStatus,
  activeRunCount: number,
  incidentCount: number,
  queueDepth: number,
  complianceStatus: ComplianceStatus | null,
): OperationBadge[] {
  const badges: OperationBadge[] = []

  if (activeRunCount > 0 && opStatus !== 'failed') {
    badges.push({
      type: 'active-run',
      label: `${activeRunCount} active run(s)`,
      severity: 'info',
    })
  }

  if (opStatus === 'failed') {
    badges.push({
      type: 'failed-run',
      label: 'Failed run',
      severity: 'critical',
    })
  }

  if (opStatus === 'blocked') {
    badges.push({
      type: 'blocked-stage',
      label: 'Blocked',
      severity: 'warning',
    })
  }

  if (queueDepth > 0) {
    badges.push({
      type: 'queue-depth',
      label: `${queueDepth} pending`,
      severity: 'info',
    })
  }

  if (incidentCount > 0) {
    badges.push({
      type: 'incident',
      label: `${incidentCount} open incident(s)`,
      severity: incidentCount > 0 ? 'warning' : 'info',
    })
  }

  if (complianceStatus === 'compliant') {
    badges.push({ type: 'compliance-ok', label: 'Compliant', severity: 'info' })
  } else if (complianceStatus === 'at-risk') {
    badges.push({ type: 'compliance-risk', label: 'At risk', severity: 'warning' })
  } else if (complianceStatus === 'violated') {
    badges.push({ type: 'compliance-violated', label: 'Violated', severity: 'critical' })
  }

  return badges
}

// --- Scope filtering helpers ---

interface ScopeEntity {
  entityId: string
  entityType: NodeType
  visualNodeId: string
}

function extractScopeEntities(
  snapshot: ReleaseSnapshotDto,
  scopeType: ScopeType,
  entityId: string | null,
): ScopeEntity[] {
  const entities: ScopeEntity[] = []

  // Company has everything
  if (snapshot.companyModel) {
    entities.push({
      entityId: snapshot.companyModel.projectId,
      entityType: 'company',
      visualNodeId: visualNodeId('company', snapshot.companyModel.projectId),
    })
  }

  for (const d of snapshot.departments) {
    entities.push({ entityId: d.id, entityType: 'department', visualNodeId: visualNodeId('department', d.id) })
  }
  for (const w of snapshot.workflows) {
    entities.push({ entityId: w.id, entityType: 'workflow', visualNodeId: visualNodeId('workflow', w.id) })
    for (const stage of w.stages) {
      entities.push({
        entityId: `${w.id}:${stage.order}`,
        entityType: 'workflow-stage',
        visualNodeId: workflowStageId(w.id, stage.order),
      })
    }
  }
  for (const c of snapshot.contracts) {
    entities.push({ entityId: c.id, entityType: 'contract', visualNodeId: visualNodeId('contract', c.id) })
  }
  for (const cap of snapshot.capabilities) {
    entities.push({ entityId: cap.id, entityType: 'capability', visualNodeId: visualNodeId('capability', cap.id) })
  }
  for (const r of snapshot.roles) {
    entities.push({ entityId: r.id, entityType: 'role', visualNodeId: visualNodeId('role', r.id) })
  }
  for (const p of snapshot.policies) {
    entities.push({ entityId: p.id, entityType: 'policy', visualNodeId: visualNodeId('policy', p.id) })
  }
  for (const a of snapshot.artifacts) {
    entities.push({ entityId: a.id, entityType: 'artifact', visualNodeId: visualNodeId('artifact', a.id) })
  }

  // Scope-level filtering: narrow entities to match scope
  if (scopeType === 'department' && entityId) {
    const deptId = entityId
    const ownedWorkflowIds = new Set(
      snapshot.workflows.filter(w => w.ownerDepartmentId === deptId).map(w => w.id),
    )
    return entities.filter(e => {
      if (e.entityType === 'department') return e.entityId === deptId
      if (e.entityType === 'workflow') return ownedWorkflowIds.has(e.entityId)
      if (e.entityType === 'workflow-stage') {
        const wfId = e.entityId.split(':')[0] ?? ''
        return ownedWorkflowIds.has(wfId)
      }
      if (e.entityType === 'contract') {
        const contract = snapshot.contracts.find(c => c.id === e.entityId)
        return contract && (contract.providerId === deptId || contract.consumerId === deptId)
      }
      if (e.entityType === 'capability') {
        const cap = snapshot.capabilities.find(c => c.id === e.entityId)
        return cap?.ownerDepartmentId === deptId
      }
      if (e.entityType === 'role') {
        const role = snapshot.roles.find(r => r.id === e.entityId)
        return role?.departmentId === deptId
      }
      return false
    })
  }

  if (scopeType === 'workflow' && entityId) {
    const wfId = entityId
    return entities.filter(e => {
      if (e.entityType === 'workflow') return e.entityId === wfId
      if (e.entityType === 'workflow-stage') return e.entityId.startsWith(`${wfId}:`)
      if (e.entityType === 'contract') {
        const wf = snapshot.workflows.find(w => w.id === wfId)
        return wf?.contractIds.includes(e.entityId)
      }
      return false
    })
  }

  return entities
}

// --- Main aggregation function ---

export function aggregateOperationsStatus(
  scopeType: ScopeType,
  entityId: string | null,
  snapshot: ReleaseSnapshotDto,
  runs: WorkflowRunDto[],
  stageExecutions: StageExecutionDto[],
  incidents: IncidentDto[],
  compliances: ContractComplianceDto[],
  projectId: string,
): OperationsStatusDto {
  const scopeEntities = extractScopeEntities(snapshot, scopeType, entityId)

  // Build lookup maps
  const runsByWorkflow = new Map<string, WorkflowRunDto[]>()
  for (const run of runs) {
    const list = runsByWorkflow.get(run.workflowId) ?? []
    list.push(run)
    runsByWorkflow.set(run.workflowId, list)
  }

  const execsByWorkflowStage = new Map<string, StageExecutionDto[]>()
  for (const exec of stageExecutions) {
    const key = `${exec.workflowId}:${exec.stageIndex}`
    const list = execsByWorkflowStage.get(key) ?? []
    list.push(exec)
    execsByWorkflowStage.set(key, list)
  }

  const openIncidentsByEntity = new Map<string, IncidentDto[]>()
  for (const inc of incidents.filter(i => i.status !== 'resolved')) {
    const list = openIncidentsByEntity.get(inc.entityId) ?? []
    list.push(inc)
    openIncidentsByEntity.set(inc.entityId, list)
  }

  const complianceByContract = new Map<string, ContractComplianceDto>()
  for (const c of compliances) {
    complianceByContract.set(c.contractId, c)
  }

  // Compute per-entity status
  const entityStatuses: EntityOperationStatusDto[] = []

  for (const se of scopeEntities) {
    let opStatus: OperationStatus = 'idle'
    let activeRunCount = 0
    let incidentCount = 0
    let queueDepth = 0
    let complianceStatus: ComplianceStatus | null = null

    // Incidents
    const entityIncidents = openIncidentsByEntity.get(se.entityId) ?? []
    incidentCount = entityIncidents.length
    if (incidentCount > 0) {
      const hasCritical = entityIncidents.some(i => i.severity === 'critical')
      opStatus = escalate(opStatus, hasCritical ? 'failed' : 'running')
    }

    // Workflow-specific
    if (se.entityType === 'workflow') {
      const wfRuns = runsByWorkflow.get(se.entityId) ?? []
      const activeRuns = wfRuns.filter(r => r.status === 'running')
      const failedRuns = wfRuns.filter(r => r.status === 'failed')
      activeRunCount = activeRuns.length

      if (failedRuns.length > 0) opStatus = escalate(opStatus, 'failed')
      else if (activeRuns.length > 0) opStatus = escalate(opStatus, 'running')
    }

    // Workflow-stage-specific
    if (se.entityType === 'workflow-stage') {
      const stageKey = se.entityId
      const execs = execsByWorkflowStage.get(stageKey) ?? []
      const pendingExecs = execs.filter(e => e.status === 'pending')
      const runningExecs = execs.filter(e => e.status === 'running')
      const blockedExecs = execs.filter(e => e.status === 'blocked')
      const failedExecs = execs.filter(e => e.status === 'failed')

      queueDepth = pendingExecs.length
      if (failedExecs.length > 0) opStatus = escalate(opStatus, 'failed')
      else if (blockedExecs.length > 0) opStatus = escalate(opStatus, 'blocked')
      else if (runningExecs.length > 0) opStatus = escalate(opStatus, 'running')
    }

    // Contract-specific
    if (se.entityType === 'contract') {
      const cc = complianceByContract.get(se.entityId)
      if (cc) {
        complianceStatus = cc.status
        if (cc.status === 'violated') opStatus = escalate(opStatus, 'failed')
        else if (cc.status === 'at-risk') opStatus = escalate(opStatus, 'blocked')
      }
    }

    // Department: aggregate owned workflow statuses
    if (se.entityType === 'department') {
      const dept = snapshot.departments.find(d => d.id === se.entityId)
      if (dept) {
        const ownedWfIds = snapshot.workflows
          .filter(w => w.ownerDepartmentId === dept.id)
          .map(w => w.id)
        for (const wfId of ownedWfIds) {
          const wfRuns = runsByWorkflow.get(wfId) ?? []
          const active = wfRuns.filter(r => r.status === 'running')
          const failed = wfRuns.filter(r => r.status === 'failed')
          activeRunCount += active.length
          if (failed.length > 0) opStatus = escalate(opStatus, 'failed')
          else if (active.length > 0) opStatus = escalate(opStatus, 'running')
        }
      }
    }

    const badges = buildBadges(opStatus, activeRunCount, incidentCount, queueDepth, complianceStatus)

    entityStatuses.push({
      entityId: se.entityId,
      entityType: se.entityType,
      visualNodeId: se.visualNodeId,
      operationStatus: opStatus,
      activeRunCount,
      incidentCount,
      queueDepth,
      complianceStatus,
      badges,
    })
  }

  // Summary
  const summary: OperationsSummary = {
    totalActiveRuns: runs.filter(r => r.status === 'running').length,
    totalBlockedStages: stageExecutions.filter(e => e.status === 'blocked').length,
    totalFailedRuns: runs.filter(r => r.status === 'failed').length,
    totalOpenIncidents: incidents.filter(i => i.status !== 'resolved').length,
    totalComplianceViolations: compliances.filter(c => c.status === 'violated').length,
  }

  return {
    projectId,
    scopeType,
    entityId,
    entities: entityStatuses,
    summary,
    fetchedAt: new Date().toISOString(),
  }
}
