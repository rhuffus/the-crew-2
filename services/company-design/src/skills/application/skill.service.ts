import { Inject, Injectable, NotFoundException, Optional } from '@nestjs/common'
import type { CreateSkillDto, UpdateSkillDto, SkillDto } from '@the-crew/shared-types'
import { Skill } from '../domain/skill'
import { SKILL_REPOSITORY, type SkillRepository } from '../domain/skill-repository'
import { SkillMapper } from './skill.mapper'
import { AuditService } from '../../audit/application/audit.service'

@Injectable()
export class SkillService {
  constructor(
    @Inject(SKILL_REPOSITORY) private readonly repo: SkillRepository,
    @Optional() private readonly auditService?: AuditService,
  ) {}

  async list(projectId: string): Promise<SkillDto[]> {
    const skills = await this.repo.findByProjectId(projectId)
    return skills.map(SkillMapper.toDto)
  }

  async get(id: string): Promise<SkillDto> {
    const skill = await this.repo.findById(id)
    if (!skill) throw new NotFoundException(`Skill ${id} not found`)
    return SkillMapper.toDto(skill)
  }

  async create(projectId: string, dto: CreateSkillDto): Promise<SkillDto> {
    const id = crypto.randomUUID()
    const skill = Skill.create({
      id,
      projectId,
      name: dto.name,
      description: dto.description,
      category: dto.category,
      tags: dto.tags,
      compatibleRoleIds: dto.compatibleRoleIds,
    })
    await this.repo.save(skill)
    const result = SkillMapper.toDto(skill)
    await this.auditService?.record({
      projectId,
      entityType: 'skill',
      entityId: result.id,
      entityName: result.name,
      action: 'created',
    })
    return result
  }

  async update(id: string, dto: UpdateSkillDto): Promise<SkillDto> {
    const skill = await this.repo.findById(id)
    if (!skill) throw new NotFoundException(`Skill ${id} not found`)
    skill.update(dto)
    await this.repo.save(skill)
    const result = SkillMapper.toDto(skill)
    await this.auditService?.record({
      projectId: result.projectId,
      entityType: 'skill',
      entityId: id,
      entityName: result.name,
      action: 'updated',
      changes: dto as Record<string, unknown>,
    })
    return result
  }

  async remove(id: string): Promise<void> {
    const skill = await this.repo.findById(id)
    if (!skill) throw new NotFoundException(`Skill ${id} not found`)
    await this.auditService?.record({
      projectId: skill.projectId,
      entityType: 'skill',
      entityId: id,
      entityName: skill.name,
      action: 'deleted',
    })
    await this.repo.delete(id)
  }
}
