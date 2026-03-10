import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import type { CreateProjectDto, UpdateProjectDto, ProjectSummary } from '@the-crew/shared-types'
import { Project } from '../domain/project'
import {
  PROJECT_REPOSITORY,
  type ProjectRepository,
} from '../domain/project-repository'
import { ProjectMapper } from './project.mapper'

@Injectable()
export class ProjectService {
  constructor(
    @Inject(PROJECT_REPOSITORY) private readonly repo: ProjectRepository,
  ) {}

  async list(): Promise<ProjectSummary[]> {
    const projects = await this.repo.findAll()
    return projects.map(ProjectMapper.toSummary)
  }

  async get(id: string): Promise<ProjectSummary> {
    const project = await this.repo.findById(id)
    if (!project) throw new NotFoundException(`Project ${id} not found`)
    return ProjectMapper.toSummary(project)
  }

  async create(dto: CreateProjectDto): Promise<ProjectSummary> {
    const id = crypto.randomUUID()
    const project = Project.create({ id, name: dto.name, description: dto.description })
    await this.repo.save(project)
    return ProjectMapper.toSummary(project)
  }

  async update(id: string, dto: UpdateProjectDto): Promise<ProjectSummary> {
    const project = await this.repo.findById(id)
    if (!project) throw new NotFoundException(`Project ${id} not found`)

    if (dto.status === 'archived') {
      project.archive()
    }
    if (dto.name !== undefined || dto.description !== undefined) {
      project.updateMetadata({ name: dto.name, description: dto.description })
    }

    await this.repo.save(project)
    return ProjectMapper.toSummary(project)
  }
}
