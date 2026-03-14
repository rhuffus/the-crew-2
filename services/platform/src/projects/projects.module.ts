import { Module } from '@nestjs/common'
import { ProjectsController } from './projects.controller'
import { ProjectService } from './application/project.service'
import { PrismaProjectRepository } from './infra/prisma-project.repository'
import { PROJECT_REPOSITORY } from './domain/project-repository'

@Module({
  controllers: [ProjectsController],
  providers: [
    ProjectService,
    {
      provide: PROJECT_REPOSITORY,
      useClass: PrismaProjectRepository,
    },
  ],
  exports: [PROJECT_REPOSITORY],
})
export class ProjectsModule {}
