import type { Repository } from '@the-crew/domain-core'
import type { Workflow } from './workflow'

export interface WorkflowRepository extends Repository<Workflow, string> {
  findByProjectId(projectId: string): Promise<Workflow[]>
}

export const WORKFLOW_REPOSITORY = Symbol('WORKFLOW_REPOSITORY')
