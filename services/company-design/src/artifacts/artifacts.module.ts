import { Module } from '@nestjs/common'
import { isPersistenceModeDrizzle } from '@the-crew/drizzle-db'
import { ArtifactsController } from './artifacts.controller'
import { ArtifactService } from './application/artifact.service'
import { InMemoryArtifactRepository } from './infra/in-memory-artifact.repository'
import { DrizzleArtifactRepository } from './infra/drizzle-artifact.repository'
import { ARTIFACT_REPOSITORY } from './domain/artifact-repository'

@Module({
  controllers: [ArtifactsController],
  providers: [
    ArtifactService,
    {
      provide: ARTIFACT_REPOSITORY,
      useClass: isPersistenceModeDrizzle()
        ? DrizzleArtifactRepository
        : InMemoryArtifactRepository,
    },
  ],
  exports: [ARTIFACT_REPOSITORY],
})
export class ArtifactsModule {}
