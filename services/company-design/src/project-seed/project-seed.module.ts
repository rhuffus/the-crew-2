import { Module } from '@nestjs/common'
import { isPersistenceModeDrizzle } from '@the-crew/drizzle-db'
import { InMemoryProjectSeedRepository } from './infra/in-memory-project-seed.repository'
import { DrizzleProjectSeedRepository } from './infra/drizzle-project-seed.repository'
import { PROJECT_SEED_REPOSITORY } from './domain/project-seed-repository'

@Module({
  providers: [
    {
      provide: PROJECT_SEED_REPOSITORY,
      useClass: isPersistenceModeDrizzle()
        ? DrizzleProjectSeedRepository
        : InMemoryProjectSeedRepository,
    },
  ],
  exports: [PROJECT_SEED_REPOSITORY],
})
export class ProjectSeedModule {}
