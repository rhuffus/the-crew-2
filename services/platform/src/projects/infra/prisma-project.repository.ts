import { Injectable } from '@nestjs/common'
import { PlatformPrismaService } from '../../prisma/platform-prisma.service'
import type { ProjectRepository } from '../domain/project-repository'
import { Project } from '../domain/project'

@Injectable()
export class PrismaProjectRepository implements ProjectRepository {
  constructor(private readonly prisma: PlatformPrismaService) {}

  async findById(id: string): Promise<Project | null> {
    const row = await this.prisma.project.findUnique({ where: { id } })
    return row ? this.toDomain(row) : null
  }

  async findAll(): Promise<Project[]> {
    const rows = await this.prisma.project.findMany()
    return rows.map((row) => this.toDomain(row))
  }

  async save(project: Project): Promise<void> {
    await this.prisma.project.upsert({
      where: { id: project.id },
      create: {
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      },
      update: {
        name: project.name,
        description: project.description,
        status: project.status,
        updatedAt: project.updatedAt,
      },
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.project.delete({ where: { id } })
  }

  private toDomain(row: {
    id: string
    name: string
    description: string
    status: string
    createdAt: Date
    updatedAt: Date
  }): Project {
    return Project.reconstitute(row.id, {
      name: row.name,
      description: row.description,
      status: row.status as 'active' | 'archived',
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }
}
