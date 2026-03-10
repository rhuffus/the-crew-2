import { Inject, Injectable, NotFoundException, Optional } from '@nestjs/common'
import type {
  CreateWorkflowDto,
  UpdateWorkflowDto,
  WorkflowDto,
} from '@the-crew/shared-types'
import { Workflow } from '../domain/workflow'
import {
  WORKFLOW_REPOSITORY,
  type WorkflowRepository,
} from '../domain/workflow-repository'
import { WorkflowMapper } from './workflow.mapper'
import { AuditService } from '../../audit/application/audit.service'

@Injectable()
export class WorkflowService {
  constructor(
    @Inject(WORKFLOW_REPOSITORY) private readonly repo: WorkflowRepository,
    @Optional() private readonly auditService?: AuditService,
  ) {}

  async list(projectId: string): Promise<WorkflowDto[]> {
    const workflows = await this.repo.findByProjectId(projectId)
    return workflows.map(WorkflowMapper.toDto)
  }

  async get(id: string): Promise<WorkflowDto> {
    const workflow = await this.repo.findById(id)
    if (!workflow) throw new NotFoundException(`Workflow ${id} not found`)
    return WorkflowMapper.toDto(workflow)
  }

  async create(projectId: string, dto: CreateWorkflowDto): Promise<WorkflowDto> {
    const id = crypto.randomUUID()
    const workflow = Workflow.create({
      id,
      projectId,
      name: dto.name,
      description: dto.description,
      ownerDepartmentId: dto.ownerDepartmentId,
      triggerDescription: dto.triggerDescription,
      stages: dto.stages,
      participants: dto.participants,
      contractIds: dto.contractIds,
    })
    await this.repo.save(workflow)
    const result = WorkflowMapper.toDto(workflow)
    await this.auditService?.record({
      projectId,
      entityType: 'workflow',
      entityId: result.id,
      entityName: result.name,
      action: 'created',
    })
    return result
  }

  async update(id: string, dto: UpdateWorkflowDto): Promise<WorkflowDto> {
    const workflow = await this.repo.findById(id)
    if (!workflow) throw new NotFoundException(`Workflow ${id} not found`)
    workflow.update(dto)
    await this.repo.save(workflow)
    const result = WorkflowMapper.toDto(workflow)
    await this.auditService?.record({
      projectId: result.projectId,
      entityType: 'workflow',
      entityId: id,
      entityName: result.name,
      action: 'updated',
      changes: dto as Record<string, unknown>,
    })
    return result
  }

  async remove(id: string): Promise<void> {
    const workflow = await this.repo.findById(id)
    if (!workflow) throw new NotFoundException(`Workflow ${id} not found`)
    await this.auditService?.record({
      projectId: workflow.projectId,
      entityType: 'workflow',
      entityId: id,
      entityName: workflow.name,
      action: 'deleted',
    })
    await this.repo.delete(id)
  }
}
