import type { WorkflowRun } from './workflow-run'
import type { StageExecution } from './stage-execution'
import type { Incident } from './incident'
import type { ContractCompliance } from './contract-compliance'

export const WORKFLOW_RUN_REPOSITORY = Symbol('WORKFLOW_RUN_REPOSITORY')
export const STAGE_EXECUTION_REPOSITORY = Symbol('STAGE_EXECUTION_REPOSITORY')
export const INCIDENT_REPOSITORY = Symbol('INCIDENT_REPOSITORY')
export const CONTRACT_COMPLIANCE_REPOSITORY = Symbol('CONTRACT_COMPLIANCE_REPOSITORY')

export interface WorkflowRunRepository {
  findById(id: string): Promise<WorkflowRun | null>
  listByProject(projectId: string): Promise<WorkflowRun[]>
  listByWorkflow(projectId: string, workflowId: string): Promise<WorkflowRun[]>
  save(run: WorkflowRun): Promise<void>
  delete(id: string): Promise<void>
}

export interface StageExecutionRepository {
  findById(id: string): Promise<StageExecution | null>
  listByRun(runId: string): Promise<StageExecution[]>
  listByProject(projectId: string): Promise<StageExecution[]>
  save(execution: StageExecution): Promise<void>
  saveAll(executions: StageExecution[]): Promise<void>
  delete(id: string): Promise<void>
}

export interface IncidentRepository {
  findById(id: string): Promise<Incident | null>
  listByProject(projectId: string): Promise<Incident[]>
  listByEntity(projectId: string, entityId: string): Promise<Incident[]>
  save(incident: Incident): Promise<void>
  delete(id: string): Promise<void>
}

export interface ContractComplianceRepository {
  findById(id: string): Promise<ContractCompliance | null>
  findByContract(projectId: string, contractId: string): Promise<ContractCompliance | null>
  listByProject(projectId: string): Promise<ContractCompliance[]>
  save(compliance: ContractCompliance): Promise<void>
  delete(id: string): Promise<void>
}
