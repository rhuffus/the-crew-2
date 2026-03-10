import { Inject, Injectable, NotFoundException, Optional } from '@nestjs/common'
import type { CreateAgentArchetypeDto, UpdateAgentArchetypeDto, AgentArchetypeDto } from '@the-crew/shared-types'
import { AgentArchetype } from '../domain/agent-archetype'
import { AGENT_ARCHETYPE_REPOSITORY, type AgentArchetypeRepository } from '../domain/agent-archetype-repository'
import { AgentArchetypeMapper } from './agent-archetype.mapper'
import { AuditService } from '../../audit/application/audit.service'

@Injectable()
export class AgentArchetypeService {
  constructor(
    @Inject(AGENT_ARCHETYPE_REPOSITORY) private readonly repo: AgentArchetypeRepository,
    @Optional() private readonly auditService?: AuditService,
  ) {}

  async list(projectId: string): Promise<AgentArchetypeDto[]> {
    const archetypes = await this.repo.findByProjectId(projectId)
    return archetypes.map(AgentArchetypeMapper.toDto)
  }

  async get(id: string): Promise<AgentArchetypeDto> {
    const archetype = await this.repo.findById(id)
    if (!archetype) throw new NotFoundException(`Agent archetype ${id} not found`)
    return AgentArchetypeMapper.toDto(archetype)
  }

  async create(projectId: string, dto: CreateAgentArchetypeDto): Promise<AgentArchetypeDto> {
    const id = crypto.randomUUID()
    const archetype = AgentArchetype.create({
      id,
      projectId,
      name: dto.name,
      description: dto.description,
      roleId: dto.roleId,
      departmentId: dto.departmentId,
      skillIds: dto.skillIds,
      constraints: dto.constraints,
    })
    await this.repo.save(archetype)
    const result = AgentArchetypeMapper.toDto(archetype)
    await this.auditService?.record({
      projectId,
      entityType: 'agentArchetype',
      entityId: result.id,
      entityName: result.name,
      action: 'created',
    })
    return result
  }

  async update(id: string, dto: UpdateAgentArchetypeDto): Promise<AgentArchetypeDto> {
    const archetype = await this.repo.findById(id)
    if (!archetype) throw new NotFoundException(`Agent archetype ${id} not found`)
    archetype.update(dto)
    await this.repo.save(archetype)
    const result = AgentArchetypeMapper.toDto(archetype)
    await this.auditService?.record({
      projectId: result.projectId,
      entityType: 'agentArchetype',
      entityId: id,
      entityName: result.name,
      action: 'updated',
      changes: dto as Record<string, unknown>,
    })
    return result
  }

  async remove(id: string): Promise<void> {
    const archetype = await this.repo.findById(id)
    if (!archetype) throw new NotFoundException(`Agent archetype ${id} not found`)
    await this.auditService?.record({
      projectId: archetype.projectId,
      entityType: 'agentArchetype',
      entityId: id,
      entityName: archetype.name,
      action: 'deleted',
    })
    await this.repo.delete(id)
  }
}
