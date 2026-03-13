import { Module } from '@nestjs/common'
import { isPersistenceModeDrizzle } from '@the-crew/drizzle-db'
import { ProjectsController } from './projects.controller'
import { ProjectService } from './application/project.service'
import { InMemoryProjectRepository } from './infra/in-memory-project.repository'
import { DrizzleProjectRepository } from './infra/drizzle-project.repository'
import { PROJECT_REPOSITORY } from './domain/project-repository'

@Module({
  controllers: [ProjectsController],
  providers: [
    ProjectService,
    {
      provide: PROJECT_REPOSITORY,
      useClass: isPersistenceModeDrizzle()
        ? DrizzleProjectRepository
        : InMemoryProjectRepository,
    },
  ],
  exports: [PROJECT_REPOSITORY],
})
export class ProjectsModule {}
