import { Inject, Injectable, NotFoundException, Optional } from '@nestjs/common'
import type { CreateAgentAssignmentDto, UpdateAgentAssignmentDto, AgentAssignmentDto } from '@the-crew/shared-types'
import { AgentAssignment } from '../domain/agent-assignment'
import { AGENT_ASSIGNMENT_REPOSITORY, type AgentAssignmentRepository } from '../domain/agent-assignment-repository'
import { AgentAssignmentMapper } from './agent-assignment.mapper'
import { AuditService } from '../../audit/application/audit.service'

@Injectable()
export class AgentAssignmentService {
  constructor(
    @Inject(AGENT_ASSIGNMENT_REPOSITORY) private readonly repo: AgentAssignmentRepository,
    @Optional() private readonly auditService?: AuditService,
  ) {}

  async list(projectId: string): Promise<AgentAssignmentDto[]> {
    const assignments = await this.repo.findByProjectId(projectId)
    return assignments.map(AgentAssignmentMapper.toDto)
  }

  async get(id: string): Promise<AgentAssignmentDto> {
    const assignment = await this.repo.findById(id)
    if (!assignment) throw new NotFoundException(`Agent assignment ${id} not found`)
    return AgentAssignmentMapper.toDto(assignment)
  }

  async create(projectId: string, dto: CreateAgentAssignmentDto): Promise<AgentAssignmentDto> {
    const id = crypto.randomUUID()
    const assignment = AgentAssignment.create({
      id,
      projectId,
      archetypeId: dto.archetypeId,
      name: dto.name,
    })
    await this.repo.save(assignment)
    const result = AgentAssignmentMapper.toDto(assignment)
    await this.auditService?.record({
      projectId,
      entityType: 'agentAssignment',
      entityId: result.id,
      entityName: result.name,
      action: 'created',
    })
    return result
  }

  async update(id: string, dto: UpdateAgentAssignmentDto): Promise<AgentAssignmentDto> {
    const assignment = await this.repo.findById(id)
    if (!assignment) throw new NotFoundException(`Agent assignment ${id} not found`)
    assignment.update(dto)
    await this.repo.save(assignment)
    const result = AgentAssignmentMapper.toDto(assignment)
    await this.auditService?.record({
      projectId: result.projectId,
      entityType: 'agentAssignment',
      entityId: id,
      entityName: result.name,
      action: 'updated',
      changes: dto as Record<string, unknown>,
    })
    return result
  }

  async remove(id: string): Promise<void> {
    const assignment = await this.repo.findById(id)
    if (!assignment) throw new NotFoundException(`Agent assignment ${id} not found`)
    await this.auditService?.record({
      projectId: assignment.projectId,
      entityType: 'agentAssignment',
      entityId: id,
      entityName: assignment.name,
      action: 'deleted',
    })
    await this.repo.delete(id)
  }
}
