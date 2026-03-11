import { Inject, Injectable, NotFoundException, Optional } from '@nestjs/common'
import type {
  CreateWorkflowRunDto,
  UpdateWorkflowRunDto,
  WorkflowRunDto,
  StageExecutionDto,
  CreateIncidentDto,
  UpdateIncidentDto,
  IncidentDto,
  CreateContractComplianceDto,
  UpdateContractComplianceDto,
  ContractComplianceDto,
  OperationsStatusDto,
  ScopeType,
  StageExecutionStatus,
} from '@the-crew/shared-types'
import {
  WORKFLOW_RUN_REPOSITORY,
  STAGE_EXECUTION_REPOSITORY,
  INCIDENT_REPOSITORY,
  CONTRACT_COMPLIANCE_REPOSITORY,
  type WorkflowRunRepository,
  type StageExecutionRepository,
  type IncidentRepository,
  type ContractComplianceRepository,
} from '../domain/operations-repository'
import { WorkflowRun } from '../domain/workflow-run'
import { StageExecution } from '../domain/stage-execution'
import { Incident } from '../domain/incident'
import { ContractCompliance } from '../domain/contract-compliance'
import { OperationsMapper } from './operations.mapper'
import { aggregateOperationsStatus } from './status-aggregator'
import { SnapshotCollector } from '../../releases/application/snapshot-collector'
import type { AuditService } from '../../audit/application/audit.service'

@Injectable()
export class OperationsService {
  constructor(
    @Inject(WORKFLOW_RUN_REPOSITORY) private readonly runRepo: WorkflowRunRepository,
    @Inject(STAGE_EXECUTION_REPOSITORY) private readonly stageRepo: StageExecutionRepository,
    @Inject(INCIDENT_REPOSITORY) private readonly incidentRepo: IncidentRepository,
    @Inject(CONTRACT_COMPLIANCE_REPOSITORY) private readonly complianceRepo: ContractComplianceRepository,
    private readonly snapshotCollector: SnapshotCollector,
    @Optional() @Inject('AuditService') private readonly auditService?: AuditService,
  ) {}

  // ── Workflow Runs ────────────────────────────────────────────────────

  async createRun(projectId: string, dto: CreateWorkflowRunDto): Promise<WorkflowRunDto> {
    const run = WorkflowRun.create(projectId, dto)
    await this.runRepo.save(run)

    // Create stage executions from workflow stages
    const snapshot = await this.snapshotCollector.collect(projectId)
    const workflow = snapshot.workflows.find(w => w.id === dto.workflowId)
    if (workflow) {
      const stages = workflow.stages.map((s, i) =>
        StageExecution.create(run.id, workflow.id, s.name, i),
      )
      if (stages.length > 0 && stages[0]) {
        stages[0].advance('running')
      }
      await this.stageRepo.saveAll(stages)
    }

    this.auditService?.record?.({ projectId, entityType: 'workflow-run', entityId: run.id, entityName: run.workflowId, action: 'created', changes: null })
    return OperationsMapper.runToDto(run)
  }

  async getRun(runId: string): Promise<WorkflowRunDto> {
    const run = await this.runRepo.findById(runId)
    if (!run) throw new NotFoundException(`Run ${runId} not found`)
    return OperationsMapper.runToDto(run)
  }

  async listRuns(projectId: string, workflowId?: string): Promise<WorkflowRunDto[]> {
    const runs = workflowId
      ? await this.runRepo.listByWorkflow(projectId, workflowId)
      : await this.runRepo.listByProject(projectId)
    return runs.map(OperationsMapper.runToDto)
  }

  async updateRun(runId: string, dto: UpdateWorkflowRunDto): Promise<WorkflowRunDto> {
    const run = await this.runRepo.findById(runId)
    if (!run) throw new NotFoundException(`Run ${runId} not found`)
    run.update(dto)
    await this.runRepo.save(run)
    this.auditService?.record?.({ projectId: run.projectId, entityType: 'workflow-run', entityId: run.id, entityName: run.workflowId, action: 'updated', changes: dto as unknown as Record<string, unknown> })
    return OperationsMapper.runToDto(run)
  }

  async advanceStage(
    runId: string,
    stageIndex: number,
    status: StageExecutionStatus,
    blockReason?: string | null,
  ): Promise<StageExecutionDto> {
    const execs = await this.stageRepo.listByRun(runId)
    const exec = execs.find(e => e.stageIndex === stageIndex)
    if (!exec) throw new NotFoundException(`Stage execution at index ${stageIndex} not found for run ${runId}`)

    exec.advance(status, blockReason)
    await this.stageRepo.save(exec)

    // Auto-advance next stage to running when current completes
    if (status === 'completed') {
      const next = execs.find(e => e.stageIndex === stageIndex + 1)
      if (next && next.status === 'pending') {
        next.advance('running')
        await this.stageRepo.save(next)
      }

      // If all stages done, complete the run
      const allDone = execs.every(e =>
        e.stageIndex === stageIndex
          ? true // just completed
          : e.status === 'completed' || e.status === 'skipped',
      )
      if (allDone && !next) {
        const run = await this.runRepo.findById(runId)
        if (run && run.status === 'running') {
          run.update({ status: 'completed' })
          await this.runRepo.save(run)
        }
      }
    }

    return OperationsMapper.stageToDto(exec)
  }

  async listStageExecutions(runId: string): Promise<StageExecutionDto[]> {
    const execs = await this.stageRepo.listByRun(runId)
    return execs.map(OperationsMapper.stageToDto)
  }

  // ── Incidents ────────────────────────────────────────────────────────

  async createIncident(projectId: string, dto: CreateIncidentDto): Promise<IncidentDto> {
    const incident = Incident.create(projectId, dto)
    await this.incidentRepo.save(incident)
    this.auditService?.record?.({ projectId, entityType: 'incident', entityId: incident.id, entityName: dto.title, action: 'created', changes: null })
    return OperationsMapper.incidentToDto(incident)
  }

  async listIncidents(projectId: string, entityType?: string, entityId?: string): Promise<IncidentDto[]> {
    let incidents: Incident[]
    if (entityId) {
      incidents = await this.incidentRepo.listByEntity(projectId, entityId)
    } else {
      incidents = await this.incidentRepo.listByProject(projectId)
    }
    if (entityType) {
      incidents = incidents.filter(i => i.entityType === entityType)
    }
    return incidents.map(OperationsMapper.incidentToDto)
  }

  async updateIncident(incidentId: string, dto: UpdateIncidentDto): Promise<IncidentDto> {
    const incident = await this.incidentRepo.findById(incidentId)
    if (!incident) throw new NotFoundException(`Incident ${incidentId} not found`)
    incident.update(dto)
    await this.incidentRepo.save(incident)
    this.auditService?.record?.({ projectId: incident.projectId, entityType: 'incident', entityId: incident.id, entityName: incident.title, action: 'updated', changes: dto as unknown as Record<string, unknown> })
    return OperationsMapper.incidentToDto(incident)
  }

  async resolveIncident(incidentId: string): Promise<IncidentDto> {
    const incident = await this.incidentRepo.findById(incidentId)
    if (!incident) throw new NotFoundException(`Incident ${incidentId} not found`)
    incident.resolve()
    await this.incidentRepo.save(incident)
    this.auditService?.record?.({ projectId: incident.projectId, entityType: 'incident', entityId: incident.id, entityName: incident.title, action: 'updated', changes: { status: 'resolved' } })
    return OperationsMapper.incidentToDto(incident)
  }

  // ── Contract Compliance ──────────────────────────────────────────────

  async setCompliance(projectId: string, dto: CreateContractComplianceDto): Promise<ContractComplianceDto> {
    // Upsert: if compliance exists for this contract, update it
    const existing = await this.complianceRepo.findByContract(projectId, dto.contractId)
    if (existing) {
      existing.update({ status: dto.status, reason: dto.reason })
      await this.complianceRepo.save(existing)
      return OperationsMapper.complianceToDto(existing)
    }
    const cc = ContractCompliance.create(projectId, dto)
    await this.complianceRepo.save(cc)
    this.auditService?.record?.({ projectId, entityType: 'contract-compliance', entityId: cc.id, entityName: dto.contractId, action: 'created', changes: null })
    return OperationsMapper.complianceToDto(cc)
  }

  async listCompliances(projectId: string): Promise<ContractComplianceDto[]> {
    const list = await this.complianceRepo.listByProject(projectId)
    return list.map(OperationsMapper.complianceToDto)
  }

  async updateCompliance(complianceId: string, dto: UpdateContractComplianceDto): Promise<ContractComplianceDto> {
    const cc = await this.complianceRepo.findById(complianceId)
    if (!cc) throw new NotFoundException(`Compliance record ${complianceId} not found`)
    cc.update(dto)
    await this.complianceRepo.save(cc)
    this.auditService?.record?.({ projectId: cc.projectId, entityType: 'contract-compliance', entityId: cc.id, entityName: cc.contractId, action: 'updated', changes: dto as unknown as Record<string, unknown> })
    return OperationsMapper.complianceToDto(cc)
  }

  // ── Aggregated Status ────────────────────────────────────────────────

  async getOperationsStatus(
    projectId: string,
    scopeType: ScopeType,
    entityId?: string | null,
  ): Promise<OperationsStatusDto> {
    const [snapshot, runs, stageExecs, incidents, compliances] = await Promise.all([
      this.snapshotCollector.collect(projectId),
      this.runRepo.listByProject(projectId),
      this.getAllStageExecutions(projectId),
      this.incidentRepo.listByProject(projectId),
      this.complianceRepo.listByProject(projectId),
    ])

    const runDtos = runs.map(OperationsMapper.runToDto)
    const stageDtos = stageExecs.map(OperationsMapper.stageToDto)
    const incidentDtos = incidents.map(OperationsMapper.incidentToDto)
    const complianceDtos = compliances.map(OperationsMapper.complianceToDto)

    return aggregateOperationsStatus(
      scopeType,
      entityId ?? null,
      snapshot,
      runDtos,
      stageDtos,
      incidentDtos,
      complianceDtos,
      projectId,
    )
  }

  private async getAllStageExecutions(projectId: string): Promise<StageExecution[]> {
    const runs = await this.runRepo.listByProject(projectId)
    const allExecs: StageExecution[] = []
    for (const run of runs) {
      const execs = await this.stageRepo.listByRun(run.id)
      allExecs.push(...execs)
    }
    return allExecs
  }
}
