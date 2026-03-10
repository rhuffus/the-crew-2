import { Module } from '@nestjs/common'
import { ProjectsController } from './projects.controller'
import { ProjectService } from './application/project.service'
import { InMemoryProjectRepository } from './infra/in-memory-project.repository'
import { PROJECT_REPOSITORY } from './domain/project-repository'

@Module({
  controllers: [ProjectsController],
  providers: [
    ProjectService,
    { provide: PROJECT_REPOSITORY, useClass: InMemoryProjectRepository },
  ],
})
export class ProjectsModule {}
