import { Module } from '@nestjs/common'
import { PrismaProjectSeedRepository } from './infra/prisma-project-seed.repository'
import { PROJECT_SEED_REPOSITORY } from './domain/project-seed-repository'

@Module({
  providers: [
    {
      provide: PROJECT_SEED_REPOSITORY,
      useClass: PrismaProjectSeedRepository,
    },
  ],
  exports: [PROJECT_SEED_REPOSITORY],
})
export class ProjectSeedModule {}
